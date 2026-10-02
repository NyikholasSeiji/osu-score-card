import { Module } from '@nestjs/common';
import { OsuModule } from '../osu/osu.module.js';
import { ImagesController } from './images.controller.js';
import { ScoresController } from './scores.controller.js';
import { ScoresService } from './scores.service.js';

@Module({
  imports: [OsuModule],
  controllers: [ScoresController, ImagesController],
  providers: [ScoresService],
})
export class ScoresModule {}
