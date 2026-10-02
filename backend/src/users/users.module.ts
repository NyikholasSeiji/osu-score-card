import { Module } from '@nestjs/common';
import { OsuModule } from '../osu/osu.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [OsuModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
