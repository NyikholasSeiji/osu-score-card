import { readFileSync } from 'node:fs';
import type { Score } from 'osu-api-v2-js';
import { toScoreSummary } from './score-summary.js';

const fixture = JSON.parse(
  readFileSync(
    new URL('../../test/fixtures/score-1485666113.json', import.meta.url),
    'utf8',
  ),
) as Score.WithUserBeatmapBeatmapset;

describe('toScoreSummary', () => {
  it('keeps only what the score picker needs', () => {
    expect(toScoreSummary(fixture)).toEqual({
      id: 1485666113,
      rank: 'SH',
      score: { classic: 2109807, standardised: 1237293 },
      accuracy: 0.993994,
      maxCombo: 273,
      pp: 485.152,
      endedAt: '2022-02-13T22:32:11.000Z',
      client: 'stable',
      mods: ['DT', 'HD', 'CL'],
      beatmap: {
        id: fixture.beatmap.id,
        version: 'I Think You Could Use a Mint',
        starRating: fixture.beatmap.difficulty_rating,
      },
      beatmapset: {
        id: fixture.beatmapset.id,
        title: fixture.beatmapset.title,
        artist: 'Victorious Cast',
        listUrl: fixture.beatmapset.covers['list@2x'],
      },
    });
  });
});
