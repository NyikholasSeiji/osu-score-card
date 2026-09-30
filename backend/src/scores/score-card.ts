import type { Mod, Score } from 'osu-api-v2-js';

export interface ScoreCardMod {
  acronym: string;
  settings?: Record<string, unknown>;
}

export interface ScoreCard {
  id: number;
  url: string;
  rank: Score.Grade;
  passed: boolean;
  score: {
    classic: number;
    standardised: number;
    legacy: number | null;
  };
  accuracy: number;
  maxCombo: number;
  beatmapMaxCombo: number | null;
  isPerfectCombo: boolean;
  pp: number | null;
  globalRank: number | null;
  endedAt: string;
  client: 'stable' | 'lazer';
  mods: ScoreCardMod[];
  statistics: {
    great: number;
    ok: number;
    meh: number;
    miss: number;
  };
  beatmap: {
    id: number;
    url: string;
    version: string;
    status: string;
    starRating: number;
    starRatingNoMod: number;
    bpm: number;
    lengthSeconds: number;
  };
  beatmapset: {
    id: number;
    title: string;
    titleUnicode: string;
    artist: string;
    artistUnicode: string;
    creator: string;
    coverUrl: string;
    cardUrl: string;
  };
  user: {
    id: number;
    username: string;
    countryCode: string;
    avatarUrl: string;
    coverUrl: string | null;
    profileUrl: string;
  };
}

const DIFFICULTY_NEUTRAL_MODS = new Set(['NF', 'SD', 'PF', 'CL']);

export function affectsDifficulty(mods: Mod[]): boolean {
  return mods.some((mod) => !DIFFICULTY_NEUTRAL_MODS.has(mod.acronym));
}

export function speedMultiplier(mods: Mod[]): number {
  for (const mod of mods) {
    const speedChange = mod.settings?.speed_change;
    if (mod.acronym === 'DT' || mod.acronym === 'NC') {
      return typeof speedChange === 'number' ? speedChange : 1.5;
    }
    if (mod.acronym === 'HT' || mod.acronym === 'DC') {
      return typeof speedChange === 'number' ? speedChange : 0.75;
    }
  }
  return 1;
}

export function toScoreCard(
  score: Score.Extended,
  starRating: number,
): ScoreCard {
  const { beatmap, beatmapset, user } = score;
  const speed = speedMultiplier(score.mods);
  const beatmapMaxCombo = (beatmap as { max_combo?: number }).max_combo;

  return {
    id: score.id,
    url: `https://osu.ppy.sh/scores/${score.id}`,
    rank: score.rank,
    passed: score.passed,
    score: {
      classic: score.classic_total_score,
      standardised: score.total_score,
      legacy: score.legacy_score_id === null ? null : score.legacy_total_score,
    },
    accuracy: score.accuracy,
    maxCombo: score.max_combo,
    beatmapMaxCombo: beatmapMaxCombo ?? null,
    isPerfectCombo: score.is_perfect_combo,
    pp: score.pp,
    globalRank: score.rank_global ?? null,
    endedAt: new Date(score.ended_at).toISOString(),
    client: score.legacy_score_id === null ? 'lazer' : 'stable',
    mods: score.mods.map((mod) =>
      mod.settings && Object.keys(mod.settings).length > 0
        ? { acronym: mod.acronym, settings: mod.settings }
        : { acronym: mod.acronym },
    ),
    statistics: {
      great: score.statistics.great ?? 0,
      ok: score.statistics.ok ?? 0,
      meh: score.statistics.meh ?? 0,
      miss: score.statistics.miss ?? 0,
    },
    beatmap: {
      id: beatmap.id,
      url: beatmap.url,
      version: beatmap.version,
      status: beatmap.status,
      starRating,
      starRatingNoMod: beatmap.difficulty_rating,
      bpm: beatmap.bpm * speed,
      lengthSeconds: Math.round(beatmap.total_length / speed),
    },
    beatmapset: {
      id: beatmapset.id,
      title: beatmapset.title,
      titleUnicode: beatmapset.title_unicode,
      artist: beatmapset.artist,
      artistUnicode: beatmapset.artist_unicode,
      creator: beatmapset.creator,
      coverUrl: beatmapset.covers['cover@2x'],
      cardUrl: beatmapset.covers['card@2x'],
    },
    user: {
      id: user.id,
      username: user.username,
      countryCode: user.country_code,
      avatarUrl: user.avatar_url,
      coverUrl: user.cover?.custom_url ?? user.cover?.url ?? null,
      profileUrl: `https://osu.ppy.sh/users/${user.id}`,
    },
  };
}
