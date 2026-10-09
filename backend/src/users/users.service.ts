import { Injectable, Logger } from '@nestjs/common';
import { APIError, Ruleset } from 'osu-api-v2-js';
import { OsuClient } from '../osu/osu-client.js';
import { ScoreSummary, toScoreSummary } from '../auth/score-summary.js';
import { Player, toPlayer } from './player.js';

export type ScoreListType = 'recent' | 'best';

const SEARCH_LIMIT = 8;
const SCORE_LIST_LIMIT = 50;

/** Public player data: search by name and list anyone's recent/best plays. */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly osu: OsuClient) {}

  async search(query: string): Promise<Player[]> {
    const api = this.osu.get();
    try {
      const { data } = await api.searchUser(query);
      return data.slice(0, SEARCH_LIMIT).map(toPlayer);
    } catch (error) {
      this.logger.warn(
        `User search failed, falling back to exact lookup: ${String(error)}`,
      );
    }
    try {
      return [toPlayer(await api.getUser(query, Ruleset.osu))];
    } catch (error) {
      if (error instanceof APIError && error.response?.status_code === 404) {
        return [];
      }
      throw this.osu.toHttpException(error, {
        code: 'PLAYER_NOT_FOUND',
        message: 'Player not found.',
      });
    }
  }

  async getScores(
    userId: number,
    type: ScoreListType,
    ruleset: Ruleset,
  ): Promise<ScoreSummary[]> {
    try {
      const scores = await this.osu
        .get()
        .getUserScores(
          userId,
          type,
          ruleset,
          { lazer: true, fails: false },
          { limit: SCORE_LIST_LIMIT },
        );
      return scores.map(toScoreSummary);
    } catch (error) {
      throw this.osu.toHttpException(error, {
        code: 'PLAYER_NOT_FOUND',
        message: 'Player not found.',
      });
    }
  }
}
