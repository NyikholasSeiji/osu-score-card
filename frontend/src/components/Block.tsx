import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
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
/** Touch: hold this long before the block becomes selected / draggable. */
const LONG_PRESS_MS = 500
/** Touch: moving further than this during the hold is a scroll, not a press. */
const LONG_PRESS_SLOP = 10

/**
 * Wraps a piece of the card. When an editor is present the block can be
 * selected, dragged (stored as an offset) and hidden straight from the card.
 *
 * Mouse and pen act immediately. Touch needs a long press first: a quick tap
 * or a swipe does nothing (the page keeps scrolling), the hold is shown with
 * an animated outline, and only after LONG_PRESS_MS the block is selected and
 * follows the finger.
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
  const press = useRef<{
    pointerId: number
    startX: number
    startY: number
    timer: number
  } | null>(null)
  const [arming, setArming] = useState(false)
  const touchDragging = useRef(false)
  const root = useRef<HTMLDivElement>(null)

  const cancelPress = useCallback(() => {
    if (press.current) {
      window.clearTimeout(press.current.timer)
      press.current = null
    }
    setArming(false)
  }, [])

  useEffect(() => cancelPress, [cancelPress])

  // React registers touch listeners as passive, so the scroll block for an
  // armed touch drag needs a native, non-passive one.
  useEffect(() => {
    const element = root.current
    if (!element) return
    const onTouchMove = (event: TouchEvent) => {
      if (touchDragging.current) event.preventDefault()
    }
    element.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => element.removeEventListener('touchmove', onTouchMove)
  }, [])

  const style = context?.style
  if (style?.hidden.includes(id)) return null

  const offset = style?.offsets[id]
  const classes = ['block', className]
  if (editor) {
    classes.push('block--editable')
    if (editor.selected === id) classes.push('block--selected')
    if (arming) classes.push('block--arming')
  }

  const beginDrag = (pointerId: number, clientX: number, clientY: number) => {
    if (!editor) return
    editor.onSelect(id)
    drag.current = {
      pointerId,
      startX: clientX,
      startY: clientY,
      baseX: offset?.x ?? 0,
      baseY: offset?.y ?? 0,
      moved: false,
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!editor || event.button !== 0) return
    if ((event.target as HTMLElement).closest('.block__tools')) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const { pointerId, clientX, clientY } = event
    if (event.pointerType !== 'touch') {
      beginDrag(pointerId, clientX, clientY)
      return
    }
    cancelPress()
    press.current = {
      pointerId,
      startX: clientX,
      startY: clientY,
      timer: window.setTimeout(() => {
        press.current = null
        setArming(false)
        touchDragging.current = true
        beginDrag(pointerId, clientX, clientY)
      }, LONG_PRESS_MS),
    }
    setArming(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pending = press.current
    if (
      pending &&
      pending.pointerId === event.pointerId &&
      Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY) >
        LONG_PRESS_SLOP
    ) {
      cancelPress()
    }
    const current = drag.current
    if (!editor || !current || current.pointerId !== event.pointerId) return
    const dx = (event.clientX - current.startX) / editor.scale
    const dy = (event.clientY - current.startY) / editor.scale
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    current.moved = true
    editor.onChange(
      {
        ...editor.style,
        offsets: {
          ...editor.style.offsets,
          [id]: {
            x: Math.round(current.baseX + dx),
            y: Math.round(current.baseY + dy),
          },
        },
      },
      `drag:${id}`,
    )
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (press.current?.pointerId === event.pointerId) cancelPress()
    if (drag.current?.pointerId !== event.pointerId) return
    if (drag.current.moved) editor?.endGesture()
    drag.current = null
    touchDragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (press.current?.pointerId === event.pointerId) cancelPress()
  }

  return (
    <div
      ref={root}
      className={classes.join(' ')}
      data-block={id}
      style={
        offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
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
