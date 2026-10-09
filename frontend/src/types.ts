export type Grade = 'XH' | 'X' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

/** Game modes as the osu! API names them (`fruits` is osu!catch). */
export type Ruleset = 'osu' | 'taiko' | 'fruits' | 'mania'

export const RULESETS: Ruleset[] = ['osu', 'taiko', 'fruits', 'mania']

export interface ScoreCardMod {
  acronym: string
  settings?: Record<string, unknown>
}

export interface ScoreCardData {
  id: number
  url: string
  ruleset: Ruleset
  rank: Grade
  passed: boolean
  score: {
    classic: number
    standardised: number
    legacy: number | null
  }
  accuracy: number
  maxCombo: number
  beatmapMaxCombo: number | null
  isPerfectCombo: boolean
  pp: number | null
  globalRank: number | null
  endedAt: string
  client: 'stable' | 'lazer'
  mods: ScoreCardMod[]
  /** Hit counts; which ones matter depends on the ruleset (zero otherwise). */
  statistics: {
    perfect: number
    great: number
    good: number
    ok: number
    meh: number
    miss: number
    largeTickHit: number
    largeTickMiss: number
    smallTickHit: number
    smallTickMiss: number
  }
  beatmap: {
    id: number
    url: string
    version: string
    status: string
    starRating: number
    starRatingNoMod: number
    bpm: number
    lengthSeconds: number
  }
  beatmapset: {
    id: number
    title: string
    titleUnicode: string
    artist: string
    artistUnicode: string
    creator: string
    coverUrl: string
    cardUrl: string
  }
  user: {
    id: number
    username: string
    countryCode: string
    avatarUrl: string
    coverUrl: string | null
    profileUrl: string
  }
}

/** An osu! player, as returned by `GET /api/users/search`. */
export interface Player {
  id: number
  username: string
  countryCode: string
  avatarUrl: string
}

/** The logged-in osu! player, as returned by `GET /api/me`. */
export type AuthUser = Player

export type ScoreListType = 'recent' | 'best'

/** One row of the score picker (`GET /api/me/scores`, `GET /api/users/:id/scores`). */
export interface ScoreSummary {
  id: number
  ruleset: Ruleset
  rank: Grade
  score: { classic: number; standardised: number }
  accuracy: number
  maxCombo: number
  pp: number | null
  endedAt: string
  client: 'stable' | 'lazer'
  mods: string[]
  beatmap: { id: number; version: string; starRating: number }
  beatmapset: { id: number; title: string; artist: string; listUrl: string }
}

export type BackgroundSource = 'beatmap' | 'user' | 'custom' | 'solid'

/** Every block of the card that can be hidden or dragged around. */
export type CardBlock =
  | 'header'
  | 'starRating'
  | 'mode'
  | 'grade'
  | 'mods'
  | 'score'
  | 'meta'
  | 'globalRank'
  | 'player'
  | 'accuracy'
  | 'combo'
  | 'pp'
  | 'statistics'

export const CARD_BLOCKS: CardBlock[] = [
  'header',
  'starRating',
  'mode',
  'grade',
  'mods',
  'score',
  'meta',
  'globalRank',
  'player',
  'accuracy',
  'combo',
  'pp',
  'statistics',
]

export interface Offset {
  x: number
  y: number
}

export type CardFont = 'sans' | 'rounded' | 'mono'

export interface CardStyle {
  background: BackgroundSource
  customBackground: string | null
  backgroundColor: string
  overlayOpacity: number
  blur: number
  accentColor: string
  textColor: string
  font: CardFont
  radius: number
  layout: 'classic' | 'compact'
  scoreMode: 'classic' | 'standardised'
  hidden: CardBlock[]
  offsets: Partial<Record<CardBlock, Offset>>
}

export const DEFAULT_STYLE: CardStyle = {
  background: 'beatmap',
  customBackground: null,
  backgroundColor: '#2a2226',
  overlayOpacity: 0.45,
  blur: 0,
  accentColor: '#ff66aa',
  textColor: '#ffffff',
  font: 'sans',
  radius: 16,
  layout: 'classic',
  scoreMode: 'classic',
  hidden: [],
  offsets: {},
}
