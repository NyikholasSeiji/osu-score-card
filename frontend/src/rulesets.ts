import type { Ruleset, ScoreCardData } from './types.ts'

export type StatKey = keyof ScoreCardData['statistics']
export type StatTone = 'perfect' | 'great' | 'good' | 'ok' | 'meh' | 'miss'

export interface StatColumn {
  key: StatKey
  tone: StatTone
}

/** Which hit counts each game mode shows on the card, in osu!'s order. */
export const RULESET_STATS: Record<Ruleset, StatColumn[]> = {
  osu: [
    { key: 'great', tone: 'great' },
    { key: 'ok', tone: 'ok' },
    { key: 'meh', tone: 'meh' },
    { key: 'miss', tone: 'miss' },
  ],
  taiko: [
    { key: 'great', tone: 'great' },
    { key: 'ok', tone: 'ok' },
    { key: 'miss', tone: 'miss' },
  ],
  fruits: [
    { key: 'great', tone: 'great' },
    { key: 'largeTickHit', tone: 'ok' },
    { key: 'smallTickHit', tone: 'meh' },
    { key: 'miss', tone: 'miss' },
  ],
  mania: [
    { key: 'perfect', tone: 'perfect' },
    { key: 'great', tone: 'great' },
    { key: 'good', tone: 'good' },
    { key: 'ok', tone: 'ok' },
    { key: 'meh', tone: 'meh' },
    { key: 'miss', tone: 'miss' },
  ],
}

/** Official names; the same in every language. */
export const RULESET_LABEL: Record<Ruleset, string> = {
  osu: 'osu!',
  taiko: 'osu!taiko',
  fruits: 'osu!catch',
  mania: 'osu!mania',
}

const MODE_STORAGE_KEY = 'osu-card.mode'

export function loadMode(): Ruleset {
  const stored = localStorage.getItem(MODE_STORAGE_KEY)
  return stored && isRuleset(stored) ? stored : 'osu'
}

export function saveMode(mode: Ruleset): void {
  localStorage.setItem(MODE_STORAGE_KEY, mode)
}

export function isRuleset(value: string): value is Ruleset {
  return value === 'osu' || value === 'taiko' || value === 'fruits' || value === 'mania'
}
