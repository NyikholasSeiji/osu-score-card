import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serves the built frontend from the same origin as /api (production).
  const staticDir = process.env.STATIC_DIR;
  if (staticDir) {
    app.useStaticAssets(resolve(staticDir));
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
