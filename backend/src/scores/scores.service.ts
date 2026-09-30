import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { API, APIError, Ruleset } from 'osu-api-v2-js';
import { affectsDifficulty, ScoreCard, toScoreCard } from './score-card.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

@Injectable()
export class ScoresService {
  private readonly logger = new Logger(ScoresService.name);
  private readonly cache = new Map<
    number,
    { expiresAt: number; card: ScoreCard }
  >();
  private api?: API;

  async getScoreCard(scoreId: number): Promise<ScoreCard> {
    const cached = this.cache.get(scoreId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.card;
    }

    const api = this.getApi();
    const score = await api.getScore(scoreId).catch((error: unknown) => {
      throw this.toHttpException(error, {
        code: 'SCORE_NOT_FOUND',
        message: 'Score not found.',
      });
    });

    if (score.ruleset_id !== Ruleset.osu) {
      throw new UnprocessableEntityException({
        code: 'UNSUPPORTED_RULESET',
        message: 'Only osu! standard scores are supported for now.',
      });
    }

    let starRating = score.beatmap.difficulty_rating;
    if (affectsDifficulty(score.mods)) {
      try {
        const attributes = await api.getBeatmapDifficultyAttributesOsu(
          score.beatmap,
          score.mods,
        );
        starRating = attributes.star_rating;
      } catch (error) {
        this.logger.warn(
          `Could not fetch modded star rating for beatmap ${score.beatmap.id}: ${String(error)}`,
        );
      }
    }

    const card = toScoreCard(score, starRating);
    this.remember(scoreId, card);
    return card;
  }

  private getApi(): API {
    if (!this.api) {
      const clientId = Number(process.env.OSU_CLIENT_ID);
      const clientSecret = process.env.OSU_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new ServiceUnavailableException({
          code: 'OSU_CREDENTIALS_MISSING',
          message:
            'osu! API credentials are not configured (OSU_CLIENT_ID and OSU_CLIENT_SECRET).',
        });
      }
      this.api = new API(clientId, clientSecret);
    }
    return this.api;
  }

  private remember(scoreId: number, card: ScoreCard): void {
    if (this.cache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(scoreId, { expiresAt: Date.now() + CACHE_TTL_MS, card });
  }

  private toHttpException(
    error: unknown,
    notFound: { code: string; message: string },
  ): Error {
    if (error instanceof APIError && error.response?.status_code === 404) {
      return new NotFoundException(notFound);
    }
    this.logger.error(`osu! API request failed: ${String(error)}`);
    return new BadGatewayException({
      code: 'OSU_API_FAILED',
      message: 'Could not reach the osu! API.',
    });
  }
}
