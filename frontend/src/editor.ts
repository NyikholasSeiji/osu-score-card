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
