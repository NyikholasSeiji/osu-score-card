import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import type { ScoreSummary } from '../auth/score-summary.js';
import { parseRuleset } from '../osu/ruleset.js';
import type { Player } from './player.js';
import { UsersService } from './users.service.js';
import type { ScoreListType } from './users.service.js';

const MIN_QUERY_LENGTH = 2;

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('search')
  search(@Query('q') q: string | undefined): Promise<Player[]> {
    const query = q?.trim() ?? '';
    if (query.length < MIN_QUERY_LENGTH) {
      throw new BadRequestException({
        code: 'QUERY_TOO_SHORT',
        message: `Type at least ${MIN_QUERY_LENGTH} characters.`,
      });
    }
    return this.users.search(query);
  }

  @Get(':id/scores')
  scores(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type: string | undefined,
    @Query('mode') mode: string | undefined,
  ): Promise<ScoreSummary[]> {
    if (type !== 'recent' && type !== 'best') {
      throw new BadRequestException({
        code: 'INVALID_SCORE_LIST',
        message: 'type must be "recent" or "best".',
      });
    }
    return this.users.getScores(
      id,
      type satisfies ScoreListType,
      parseRuleset(mode),
    );
  }
}
