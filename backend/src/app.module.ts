import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ScoresModule } from './scores/scores.module.js';

@Module({
  imports: [ScoresModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
