import { useState } from 'react'
import { GRADE_LABEL } from '../format.ts'
import { modInfo } from '../mods.ts'
import type { Grade, Ruleset } from '../types.ts'

/**
 * Rank letter in a fixed box. When `src` is given (a skin asset) the image is
 * shown instead; if it fails to load the built-in letter comes back.
 */
export function RankIcon({ grade, src }: { grade: Grade; src?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const label = GRADE_LABEL[grade]
  if (src && failedSrc !== src) {
    return (
      <span className="grade-icon grade-icon--image" role="img" aria-label={label}>
        <img
          className="grade-icon__img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      </span>
    )
  }
  return (
    <span className={`grade-icon grade-icon--${grade}`} role="img" aria-label={label}>
      <span className="grade-icon__text">{label}</span>
    </span>
  )
}

/** Minimal game-mode glyphs in the spirit of osu!'s own mode icons. */
export function ModeIcon({ ruleset }: { ruleset: Ruleset }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: `mode-icon mode-icon--${ruleset}`,
  }
  switch (ruleset) {
    case 'osu':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'taiko':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
          <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9" />
        </svg>
      )
    case 'fruits':
      return (
        <svg {...common}>
          <path d="M12 8c-4.5 0-7 3-7 6.5S8 21 12 21s7-3 7-6.5S16.5 8 12 8Z" />
          <path d="M12 8V5" />
          <path d="M12 5c1.5-2 4-2.5 5.5-2-0.5 2-2.5 3.5-5.5 3Z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'mania':
      return (
        <svg {...common}>
          <path d="M5 4v16" />
          <path d="M9.7 4v16" />
          <path d="M14.3 4v16" />
          <path d="M19 4v16" />
          <path d="M8 14.5h3.4M12.6 9h3.4M3.3 10h3.4M17.3 15h3.4" strokeWidth="3" />
        </svg>
      )
  }
}

/** Mod badge coloured by its lazer category, or the skin's sprite when available. */
export function ModIcon({ acronym, src }: { acronym: string; src?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const info = modInfo(acronym)
  if (src && failedSrc !== src) {
    return (
      <span className="mod-icon mod-icon--image" role="img" aria-label={info.name} title={info.name}>
        <img
          className="mod-icon__img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      </span>
    )
  }
  return (
    <span className={`mod-icon mod-icon--${info.kind}`} title={info.name}>
      {acronym}
    </span>
  )
}
