export type Grade = 'XH' | 'X' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface ScoreCardMod {
  acronym: string
  settings?: Record<string, unknown>
}

export interface ScoreCardData {
  id: number
  url: string
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
  statistics: {
    great: number
    ok: number
    meh: number
    miss: number
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

export type BackgroundSource = 'beatmap' | 'user' | 'custom' | 'solid'

export type CardField =
  | 'starRating'
  | 'mods'
  | 'pp'
  | 'globalRank'
  | 'date'
  | 'client'
  | 'player'
  | 'statistics'
  | 'beatmapInfo'

export interface CardStyle {
  background: BackgroundSource
  customBackground: string | null
  backgroundColor: string
  overlayOpacity: number
  blur: number
  accentColor: string
  layout: 'classic' | 'compact'
  scoreMode: 'classic' | 'standardised'
  hidden: CardField[]
}

export const DEFAULT_STYLE: CardStyle = {
  background: 'beatmap',
  customBackground: null,
  backgroundColor: '#2a2226',
  overlayOpacity: 0.45,
  blur: 0,
  accentColor: '#ff66aa',
  layout: 'classic',
  scoreMode: 'classic',
  hidden: [],
}
