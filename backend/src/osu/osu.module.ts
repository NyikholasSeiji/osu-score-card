import { Module } from '@nestjs/common';
import { OsuClient } from './osu-client.js';

@Module({
  providers: [OsuClient],
  exports: [OsuClient],
})
export class OsuModule {}
