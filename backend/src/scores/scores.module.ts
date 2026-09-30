import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller.js';
import { ScoresController } from './scores.controller.js';
import { ScoresService } from './scores.service.js';

@Module({
  controllers: [ScoresController, ImagesController],
  providers: [ScoresService],
})
export class ScoresModule {}
