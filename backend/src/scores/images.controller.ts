import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

const ALLOWED_IMAGE_HOSTS = new Set([
  'assets.ppy.sh',
  'a.ppy.sh',
  'osu.ppy.sh',
]);

export function parseImageUrl(raw: string | undefined): URL {
  let url: URL;
  try {
    url = new URL(raw ?? '');
  } catch {
    throw new BadRequestException('Invalid image URL.');
  }
  if (url.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
    throw new BadRequestException('Image host not allowed.');
  }
  return url;
}

@Controller('api/images')
export class ImagesController {
  @Get()
  async getImage(
    @Query('url') rawUrl: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const url = parseImageUrl(rawUrl);
    const upstream = await fetch(url, { redirect: 'error' }).catch(() => null);
    const contentType = upstream?.headers.get('content-type') ?? '';
    if (!upstream?.ok || !contentType.startsWith('image/')) {
      throw new BadGatewayException('Could not load the image.');
    }
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(Buffer.from(await upstream.arrayBuffer()));
  }
}
