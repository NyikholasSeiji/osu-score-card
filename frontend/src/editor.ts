import { createContext } from 'react'
import type { CardBlock, CardStyle } from './types.ts'

export interface CardEditor {
  style: CardStyle
  /**
   * Replaces the style. Changes that share a `gesture` (a drag, a slider
   * sweep) collapse into a single undo step until `endGesture` is called or a
   * change with another gesture arrives.
   */
  onChange: (style: CardStyle, gesture?: string) => void
  endGesture: () => void
  selected: CardBlock | null
  onSelect: (block: CardBlock | null) => void
  /** Visual scale applied to the card preview; drags are divided by it. */
  scale: number
  /** Render hidden/offset state without any editing affordances. */
  readOnly?: boolean
}

export const EditorContext = createContext<CardEditor | null>(null)

// ---------- Undo / redo ----------

export interface StyleHistory {
  past: CardStyle[]
  present: CardStyle
  future: CardStyle[]
  gesture: string | null
}

const HISTORY_LIMIT = 100

export function sameStyle(a: CardStyle, b: CardStyle): boolean {
  if (a === b) return true
  return (Object.keys(a) as (keyof CardStyle)[]).every(
    (key) => a[key] === b[key] || JSON.stringify(a[key]) === JSON.stringify(b[key]),
  )
}

export function initialHistory(present: CardStyle): StyleHistory {
  return { past: [], present, future: [], gesture: null }
}

export function pushStyle(
  history: StyleHistory,
  next: CardStyle,
  gesture?: string,
): StyleHistory {
  if (sameStyle(history.present, next)) return history
  if (gesture && history.gesture === gesture) {
    return { ...history, present: next, future: [] }
  }
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    gesture: gesture ?? null,
  }
}

export function endGesture(history: StyleHistory): StyleHistory {
  return history.gesture ? { ...history, gesture: null } : history
}

export function undoStyle(history: StyleHistory): StyleHistory {
  const previous = history.past.at(-1)
  if (!previous) return history
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    gesture: null,
  }
}

export function redoStyle(history: StyleHistory): StyleHistory {
  const [next, ...future] = history.future
  if (!next) return history
  return {
    past: [...history.past, history.present],
    present: next,
    future,
    gesture: null,
  }
}

export function hideBlock(style: CardStyle, block: CardBlock): CardStyle {
  return style.hidden.includes(block)
    ? style
    : { ...style, hidden: [...style.hidden, block] }
}

export function showBlock(style: CardStyle, block: CardBlock): CardStyle {
  return { ...style, hidden: style.hidden.filter((b) => b !== block) }
}

export function resetOffset(style: CardStyle, block: CardBlock): CardStyle {
  const offsets = { ...style.offsets }
  delete offsets[block]
  return { ...style, offsets }
}

export function withCustomBackground(
  style: CardStyle,
  dataUrl: string,
): CardStyle {
  return { ...style, background: 'custom', customBackground: dataUrl }
}

/** First image found in a clipboard or drag-and-drop payload, if any. */
export function imageFromTransfer(transfer: DataTransfer | null): File | null {
  if (!transfer) return null
  for (const item of transfer.items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile()
    }
  }
  for (const file of transfer.files) {
    if (file.type.startsWith('image/')) return file
  }
  return null
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
