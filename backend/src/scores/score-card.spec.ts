import { readFileSync } from 'node:fs';
import type { Score } from 'osu-api-v2-js';
import {
  affectsDifficulty,
  speedMultiplier,
  toScoreCard,
} from './score-card.js';

const fixture = JSON.parse(
  readFileSync(
    new URL('../../test/fixtures/score-1485666113.json', import.meta.url),
    'utf8',
  ),
) as Score.Extended;

describe('toScoreCard', () => {
  it('maps a stable osu! standard score to the card shape', () => {
    const card = toScoreCard(fixture, 7.02);

    expect(card).toMatchObject({
      id: 1485666113,
      url: 'https://osu.ppy.sh/scores/1485666113',
      rank: 'SH',
      score: { classic: 2109807, standardised: 1237293, legacy: 1828324 },
      accuracy: 0.993994,
      maxCombo: 273,
      beatmapMaxCombo: 274,
      pp: 485.152,
      globalRank: 1083,
      endedAt: '2022-02-13T22:32:11.000Z',
      client: 'stable',
      mods: [{ acronym: 'DT' }, { acronym: 'HD' }, { acronym: 'CL' }],
      statistics: { great: 220, ok: 2, meh: 0, miss: 0 },
      user: { username: 'Dunha', countryCode: 'BR' },
      beatmapset: { artist: 'Victorious Cast', creator: 'SquareTude' },
    });
    expect(card.beatmap.version).toBe('I Think You Could Use a Mint');
    expect(card.beatmap.starRating).toBe(7.02);
    expect(card.beatmap.starRatingNoMod).toBeCloseTo(5.10226);
    expect(card.beatmap.bpm).toBeCloseTo(fixture.beatmap.bpm * 1.5);
  });

  it('marks lazer scores and hides the legacy score', () => {
    const card = toScoreCard(
      { ...fixture, legacy_score_id: null, legacy_total_score: 0 },
      5.1,
    );
    expect(card.client).toBe('lazer');
    expect(card.score.legacy).toBeNull();
  });
});

describe('speedMultiplier', () => {
  it('uses defaults and lazer speed_change settings', () => {
    expect(speedMultiplier([{ acronym: 'HD' }])).toBe(1);
    expect(speedMultiplier([{ acronym: 'NC' }])).toBe(1.5);
    expect(speedMultiplier([{ acronym: 'HT' }])).toBe(0.75);
    expect(
      speedMultiplier([{ acronym: 'DT', settings: { speed_change: 1.3 } }]),
    ).toBe(1.3);
  });
});

describe('affectsDifficulty', () => {
  it('ignores mods that never change star rating', () => {
    expect(affectsDifficulty([])).toBe(false);
    expect(affectsDifficulty([{ acronym: 'NF' }, { acronym: 'CL' }])).toBe(
      false,
    );
    expect(affectsDifficulty([{ acronym: 'HR' }])).toBe(true);
  });
});
