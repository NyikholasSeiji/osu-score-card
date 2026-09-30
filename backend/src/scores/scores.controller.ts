import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ScoreCard } from './score-card.js';
import { ScoresService } from './scores.service.js';

@Controller('api/scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get(':id')
  getScore(@Param('id', ParseIntPipe) id: number): Promise<ScoreCard> {
    return this.scoresService.getScoreCard(id);
  }
}
