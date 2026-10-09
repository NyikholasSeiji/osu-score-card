import { Injectable, Logger } from '@nestjs/common';
import { Ruleset } from 'osu-api-v2-js';
import { OsuClient } from '../osu/osu-client.js';
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

  constructor(private readonly osu: OsuClient) {}

  async getScoreCard(scoreId: number): Promise<ScoreCard> {
    const cached = this.cache.get(scoreId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.card;
    }

    const api = this.osu.get();
    const score = await api.getScore(scoreId).catch((error: unknown) => {
      throw this.osu.toHttpException(error, {
        code: 'SCORE_NOT_FOUND',
        message: 'Score not found.',
      });
    });

    // A convert (e.g. an osu! map played in taiko) has a star rating of its
    // own, so the beatmap's value only holds for the native ruleset + no mods.
    const isConvert = Ruleset[score.beatmap.mode] !== score.ruleset_id;
    let starRating = score.beatmap.difficulty_rating;
    if (isConvert || affectsDifficulty(score.mods)) {
      try {
        const attributes = await api.getBeatmapDifficultyAttributes(
          score.beatmap,
          score.mods,
          score.ruleset_id,
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

  private remember(scoreId: number, card: ScoreCard): void {
    if (this.cache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(scoreId, { expiresAt: Date.now() + CACHE_TTL_MS, card });
  }
}
