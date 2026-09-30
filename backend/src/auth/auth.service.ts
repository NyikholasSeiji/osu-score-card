import { randomBytes } from 'node:crypto';
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { API, Ruleset } from 'osu-api-v2-js';
import { ScoreSummary, toScoreSummary } from './score-summary.js';

export interface AuthUser {
  id: number;
  username: string;
  countryCode: string;
  avatarUrl: string;
}

export type ScoreListType = 'recent' | 'best';

interface Session {
  api: API;
  user: AuthUser;
  expiresAt: number;
}

export interface OAuthConfig {
  clientId: number;
  clientSecret: string;
  appUrl: string;
  redirectUri: string;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SCORE_LIST_LIMIT = 50;

/**
 * Handles the osu! OAuth authorization-code flow and keeps the resulting
 * user tokens in memory, keyed by an opaque session id stored in a cookie.
 * Tokens never leave the server.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessions = new Map<string, Session>();

  getConfig(): OAuthConfig {
    const clientId = Number(process.env.OSU_CLIENT_ID);
    const clientSecret = process.env.OSU_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException({
        code: 'OSU_CREDENTIALS_MISSING',
        message:
          'osu! API credentials are not configured (OSU_CLIENT_ID and OSU_CLIENT_SECRET).',
      });
    }
    const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(
      /\/+$/,
      '',
    );
    return {
      clientId,
      clientSecret,
      appUrl,
      redirectUri: `${appUrl}/api/auth/osu/callback`,
    };
  }

  createState(): string {
    return randomBytes(16).toString('hex');
  }

  authorizationUrl(state: string): string {
    const { clientId, redirectUri } = this.getConfig();
    const url = new URL('https://osu.ppy.sh/oauth/authorize');
    url.search = new URLSearchParams({
      client_id: String(clientId),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify public',
      state,
    }).toString();
    return url.toString();
  }

  /** Exchanges the authorization code for tokens and opens a session. */
  async login(code: string): Promise<string> {
    const { clientId, clientSecret, redirectUri } = this.getConfig();
    let api: API;
    let user: AuthUser;
    try {
      api = await API.createAsync(clientId, clientSecret, {
        redirect_uri: redirectUri,
        code,
      });
      const owner = await api.getResourceOwner(Ruleset.osu);
      user = {
        id: owner.id,
        username: owner.username,
        countryCode: owner.country_code,
        avatarUrl: owner.avatar_url,
      };
    } catch (error) {
      this.logger.error(`osu! login failed: ${String(error)}`);
      throw new BadGatewayException({
        code: 'OSU_LOGIN_FAILED',
        message: 'Could not complete the osu! login.',
      });
    }

    this.evictExpired();
    const sessionId = randomBytes(32).toString('base64url');
    this.sessions.set(sessionId, {
      api,
      user,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return sessionId;
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (!sessionId) return;
    const session = this.sessions.get(sessionId);
    this.sessions.delete(sessionId);
    if (!session) return;
    await session.api.revokeToken().catch((error: unknown) => {
      this.logger.warn(`Could not revoke osu! token: ${String(error)}`);
    });
  }

  getUser(sessionId: string | undefined): AuthUser {
    return this.requireSession(sessionId).user;
  }

  async getScores(
    sessionId: string | undefined,
    type: ScoreListType,
  ): Promise<ScoreSummary[]> {
    const session = this.requireSession(sessionId);
    try {
      const scores = await session.api.getUserScores(
        session.user.id,
        type,
        Ruleset.osu,
        { lazer: true, fails: false },
        { limit: SCORE_LIST_LIMIT },
      );
      return scores.map(toScoreSummary);
    } catch (error) {
      this.logger.error(`Could not list ${type} scores: ${String(error)}`);
      throw new BadGatewayException({
        code: 'OSU_API_FAILED',
        message: 'Could not reach the osu! API.',
      });
    }
  }

  private requireSession(sessionId: string | undefined): Session {
    const session = sessionId ? this.sessions.get(sessionId) : undefined;
    if (!session || session.expiresAt <= Date.now()) {
      if (sessionId) this.sessions.delete(sessionId);
      throw new UnauthorizedException({
        code: 'NOT_LOGGED_IN',
        message: 'You need to log in with osu! first.',
      });
    }
    return session;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(id);
    }
  }
}
