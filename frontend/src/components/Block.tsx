import {
  useContext,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { EditorContext, hideBlock, resetOffset } from '../editor.ts'
import { useI18n } from '../i18n/index.ts'
import type { CardBlock } from '../types.ts'

interface BlockProps {
  id: CardBlock
  className?: string
  children: ReactNode
}

const DRAG_THRESHOLD = 3

/**
 * Wraps a piece of the card. When an editor is present the block can be
 * selected, dragged (stored as an offset) and hidden straight from the card.
 */
export function Block({ id, className, children }: BlockProps) {
  const context = useContext(EditorContext)
  const { t } = useI18n()
  const editor = context && !context.readOnly ? context : null
  const drag = useRef<{
    pointerId: number
    startX: number
    startY: number
    baseX: number
    baseY: number
    moved: boolean
  } | null>(null)

  const style = context?.style
  if (style?.hidden.includes(id)) return null

  const offset = style?.offsets[id]
  const classes = ['block', className]
  if (editor) {
    classes.push('block--editable')
    if (editor.selected === id) classes.push('block--selected')
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!editor || event.button !== 0) return
    if ((event.target as HTMLElement).closest('.block__tools')) return
    event.stopPropagation()
    editor.onSelect(id)
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset?.x ?? 0,
      baseY: offset?.y ?? 0,
      moved: false,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!editor || !current || current.pointerId !== event.pointerId) return
    const dx = (event.clientX - current.startX) / editor.scale
    const dy = (event.clientY - current.startY) / editor.scale
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    current.moved = true
    editor.onChange({
      ...editor.style,
      offsets: {
        ...editor.style.offsets,
        [id]: {
          x: Math.round(current.baseX + dx),
          y: Math.round(current.baseY + dy),
        },
      },
    })
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div
      className={classes.join(' ')}
      data-block={id}
      style={
        offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
      {editor && editor.selected === id && (
        <div
          className="block__tools"
          role="toolbar"
          aria-label={t.block.labels[id]}
        >
          <span className="block__name">{t.block.labels[id]}</span>
          {offset && (
            <button
              type="button"
              title={t.block.resetPosition}
              onClick={() => editor.onChange(resetOffset(editor.style, id))}
            >
              ↺
            </button>
          )}
          <button
            type="button"
            title={t.block.hide}
            onClick={() => {
              editor.onChange(hideBlock(editor.style, id))
              editor.onSelect(null)
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
