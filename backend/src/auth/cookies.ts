import type { CookieOptions, Request } from 'express';

export const SESSION_COOKIE = 'osu_session';
export const STATE_COOKIE = 'osu_oauth_state';

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function cookieOptions(
  appUrl: string,
  maxAgeMs: number,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: appUrl.startsWith('https://'),
    path: '/',
    maxAge: maxAgeMs,
  };
}
