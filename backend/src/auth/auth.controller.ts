import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthUser, OAuthConfig, ScoreListType } from './auth.service.js';
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  cookieOptions,
  readCookie,
} from './cookies.js';
import { parseRuleset } from '../osu/ruleset.js';
import type { ScoreSummary } from './score-summary.js';

const STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_COOKIE_TTL_MS = 24 * 60 * 60 * 1000;

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('auth/osu')
  login(@Res() res: Response): void {
    const config = this.auth.getConfig();
    const state = this.auth.createState();
    res.cookie(STATE_COOKIE, state, cookieOptions(config.appUrl, STATE_TTL_MS));
    res.redirect(this.auth.authorizationUrl(state));
  }

  @Get('auth/osu/callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') oauthError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const config = this.auth.getConfig();
    res.clearCookie(STATE_COOKIE, cookieOptions(config.appUrl, 0));

    if (oauthError || !code) {
      return this.backToApp(res, config, 'denied');
    }
    if (!state || state !== readCookie(req, STATE_COOKIE)) {
      return this.backToApp(res, config, 'state');
    }

    try {
      const sessionId = await this.auth.login(code);
      res.cookie(
        SESSION_COOKIE,
        sessionId,
        cookieOptions(config.appUrl, SESSION_COOKIE_TTL_MS),
      );
      return this.backToApp(res, config, 'ok');
    } catch {
      return this.backToApp(res, config, 'failed');
    }
  }

  @Post('auth/logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.auth.logout(readCookie(req, SESSION_COOKIE));
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(204).send();
  }

  @Get('me')
  me(@Req() req: Request): AuthUser {
    return this.auth.getUser(readCookie(req, SESSION_COOKIE));
  }

  @Get('me/scores')
  scores(
    @Req() req: Request,
    @Query('type') type: string | undefined,
    @Query('mode') mode: string | undefined,
  ): Promise<ScoreSummary[]> {
    if (type !== 'recent' && type !== 'best') {
      throw new BadRequestException({
        code: 'INVALID_SCORE_LIST',
        message: 'type must be "recent" or "best".',
      });
    }
    return this.auth.getScores(
      readCookie(req, SESSION_COOKIE),
      type satisfies ScoreListType,
      parseRuleset(mode),
    );
  }

  private backToApp(res: Response, config: OAuthConfig, status: string): void {
    const url = new URL(config.appUrl);
    url.searchParams.set('auth', status);
    res.redirect(url.toString());
  }
}
