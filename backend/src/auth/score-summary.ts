import type { Score } from 'osu-api-v2-js';

/** A lightweight row for the score picker; the full card is fetched on selection. */
export interface ScoreSummary {
  id: number;
  rank: Score.Grade;
  score: { classic: number; standardised: number };
  accuracy: number;
  maxCombo: number;
  pp: number | null;
  endedAt: string;
  client: 'stable' | 'lazer';
  mods: string[];
  beatmap: {
    id: number;
    version: string;
    starRating: number;
  };
  beatmapset: {
    id: number;
    title: string;
    artist: string;
    listUrl: string;
  };
}

export function toScoreSummary(
  score: Score.WithUserBeatmapBeatmapset,
): ScoreSummary {
  return {
    id: score.id,
    rank: score.rank,
    score: {
      classic: score.classic_total_score,
      standardised: score.total_score,
    },
    accuracy: score.accuracy,
    maxCombo: score.max_combo,
    pp: score.pp,
    endedAt: new Date(score.ended_at).toISOString(),
    client: score.legacy_score_id === null ? 'lazer' : 'stable',
    mods: score.mods.map((mod) => mod.acronym),
    beatmap: {
      id: score.beatmap.id,
      version: score.beatmap.version,
      starRating: score.beatmap.difficulty_rating,
    },
    beatmapset: {
      id: score.beatmapset.id,
      title: score.beatmapset.title,
      artist: score.beatmapset.artist,
      listUrl: score.beatmapset.covers['list@2x'],
    },
  };
}
