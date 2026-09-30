import { BadRequestException } from '@nestjs/common';
import { parseImageUrl } from './images.controller.js';

describe('parseImageUrl', () => {
  it('accepts osu! asset hosts over https', () => {
    expect(
      parseImageUrl('https://assets.ppy.sh/beatmaps/984684/covers/cover.jpg')
        .hostname,
    ).toBe('assets.ppy.sh');
    expect(parseImageUrl('https://a.ppy.sh/9899907').hostname).toBe('a.ppy.sh');
  });

  it('rejects other hosts, protocols and invalid URLs', () => {
    expect(() => parseImageUrl('https://example.com/a.png')).toThrow(
      BadRequestException,
    );
    expect(() => parseImageUrl('http://a.ppy.sh/1')).toThrow(
      BadRequestException,
    );
    expect(() => parseImageUrl('nope')).toThrow(BadRequestException);
    expect(() => parseImageUrl(undefined)).toThrow(BadRequestException);
  });
});
