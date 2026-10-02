import type { User } from 'osu-api-v2-js';

/** The bits of a player the frontend needs to show a search result. */
export interface Player {
  id: number;
  username: string;
  countryCode: string;
  avatarUrl: string;
}

export function toPlayer(user: User): Player {
  return {
    id: user.id,
    username: user.username,
    countryCode: user.country_code,
    avatarUrl: user.avatar_url,
  };
}
