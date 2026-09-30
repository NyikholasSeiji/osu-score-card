import { createContext } from 'react'
import type { CardBlock, CardStyle } from './types.ts'

export interface CardEditor {
  style: CardStyle
  onChange: (style: CardStyle) => void
  selected: CardBlock | null
  onSelect: (block: CardBlock | null) => void
  /** Visual scale applied to the card preview; drags are divided by it. */
  scale: number
  /** Render hidden/offset state without any editing affordances. */
  readOnly?: boolean
}

export const EditorContext = createContext<CardEditor | null>(null)

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
