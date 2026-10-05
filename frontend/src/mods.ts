/** Mod categories as osu!lazer groups them; each one gets its own colour. */
export type ModKind =
  | 'reduction'
  | 'increase'
  | 'automation'
  | 'conversion'
  | 'fun'
  | 'system'

export interface ModInfo {
  name: string
  kind: ModKind
  /** Name of the `selection-mod-*` sprite in an osu!stable skin, when one exists. */
  skinFile?: string
}

export const MODS: Record<string, ModInfo> = {
  EZ: { name: 'Easy', kind: 'reduction', skinFile: 'easy' },
  NF: { name: 'No Fail', kind: 'reduction', skinFile: 'nofail' },
  HT: { name: 'Half Time', kind: 'reduction', skinFile: 'halftime' },
  DC: { name: 'Daycore', kind: 'reduction' },

  HR: { name: 'Hard Rock', kind: 'increase', skinFile: 'hardrock' },
  SD: { name: 'Sudden Death', kind: 'increase', skinFile: 'suddendeath' },
  PF: { name: 'Perfect', kind: 'increase', skinFile: 'perfect' },
  DT: { name: 'Double Time', kind: 'increase', skinFile: 'doubletime' },
  NC: { name: 'Nightcore', kind: 'increase', skinFile: 'nightcore' },
  HD: { name: 'Hidden', kind: 'increase', skinFile: 'hidden' },
  FL: { name: 'Flashlight', kind: 'increase', skinFile: 'flashlight' },
  BL: { name: 'Blinds', kind: 'increase' },
  ST: { name: 'Strict Tracking', kind: 'increase' },
  AC: { name: 'Accuracy Challenge', kind: 'increase' },

  TP: { name: 'Target Practice', kind: 'conversion', skinFile: 'target' },
  DA: { name: 'Difficulty Adjust', kind: 'conversion' },
  CL: { name: 'Classic', kind: 'conversion' },
  RD: { name: 'Random', kind: 'conversion', skinFile: 'random' },
  MR: { name: 'Mirror', kind: 'conversion', skinFile: 'mirror' },
  AL: { name: 'Alternate', kind: 'conversion' },
  SG: { name: 'Single Tap', kind: 'conversion' },

  AT: { name: 'Autoplay', kind: 'automation', skinFile: 'autoplay' },
  CN: { name: 'Cinema', kind: 'automation', skinFile: 'cinema' },
  RX: { name: 'Relax', kind: 'automation', skinFile: 'relax' },
  AP: { name: 'Autopilot', kind: 'automation', skinFile: 'relax2' },
  SO: { name: 'Spun Out', kind: 'automation', skinFile: 'spunout' },

  TR: { name: 'Transform', kind: 'fun' },
  WG: { name: 'Wiggle', kind: 'fun' },
  SI: { name: 'Spin In', kind: 'fun' },
  GR: { name: 'Grow', kind: 'fun' },
  DF: { name: 'Deflate', kind: 'fun' },
  WU: { name: 'Wind Up', kind: 'fun' },
  WD: { name: 'Wind Down', kind: 'fun' },
  TC: { name: 'Traceable', kind: 'fun' },
  BR: { name: 'Barrel Roll', kind: 'fun' },
  AD: { name: 'Approach Different', kind: 'fun' },
  MU: { name: 'Muted', kind: 'fun' },
  NS: { name: 'No Scope', kind: 'fun' },
  MG: { name: 'Magnetised', kind: 'fun' },
  RP: { name: 'Repel', kind: 'fun' },
  AS: { name: 'Adaptive Speed', kind: 'fun' },
  FR: { name: 'Freeze Frame', kind: 'fun' },
  BU: { name: 'Bubbles', kind: 'fun' },
  SY: { name: 'Synesthesia', kind: 'fun' },
  DP: { name: 'Depth', kind: 'fun' },
  BM: { name: 'Bloom', kind: 'fun' },

  TD: { name: 'Touch Device', kind: 'system', skinFile: 'touchdevice' },
  SV2: { name: 'Score V2', kind: 'system', skinFile: 'scorev2' },
}

/** Metadata for a mod acronym; unknown acronyms fall back to a neutral badge. */
export function modInfo(acronym: string): ModInfo {
  return MODS[acronym.toUpperCase()] ?? { name: acronym, kind: 'system' }
}
