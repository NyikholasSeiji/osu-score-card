import { useState } from 'react'
import { GRADE_LABEL } from '../format.ts'
import { modInfo } from '../mods.ts'
import type { Grade } from '../types.ts'

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
