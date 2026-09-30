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

/** Every block of the card that can be hidden or dragged around. */
export type CardBlock =
  | 'header'
  | 'starRating'
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

export const BLOCK_LABELS: Record<CardBlock, string> = {
  header: 'Título do mapa',
  starRating: 'Estrelas',
  grade: 'Rank',
  mods: 'Mods',
  score: 'Pontuação',
  meta: 'Data, cliente e BPM',
  globalRank: 'Ranking global',
  player: 'Jogador',
  accuracy: 'Precisão',
  combo: 'Combo',
  pp: 'PP',
  statistics: 'Great/Ok/Meh/Erros',
}

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
