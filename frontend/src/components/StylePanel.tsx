import type { ChangeEvent, ReactNode } from 'react'
import {
  CARD_BLOCKS,
  type BackgroundSource,
  type CardBlock,
  type CardFont,
  type CardStyle,
  type ScoreCardData,
} from '../types.ts'
import {
  hideBlock,
  readImageAsDataUrl,
  showBlock,
  withCustomBackground,
} from '../editor.ts'
import { plural, useI18n } from '../i18n/index.ts'

interface StylePanelProps {
  data: ScoreCardData
  style: CardStyle
  selected: CardBlock | null
  onChange: (style: CardStyle) => void
  onSelect: (block: CardBlock | null) => void
}

const BACKGROUNDS: BackgroundSource[] = ['beatmap', 'user', 'custom', 'solid']
const FONTS: CardFont[] = ['sans', 'rounded', 'mono']

const ACCENT_PRESETS = [
  '#ff66aa',
  '#ff9f43',
  '#ffd166',
  '#88da20',
  '#4cc9f0',
  '#b36ae0',
  '#ffffff',
]

export function StylePanel({
  data,
  style,
  selected,
  onChange,
  onSelect,
}: StylePanelProps) {
  const { t } = useI18n()
  const update = (patch: Partial<CardStyle>) => onChange({ ...style, ...patch })

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onChange(withCustomBackground(style, await readImageAsDataUrl(file)))
  }

  const backgrounds = BACKGROUNDS.filter(
    (source) =>
      (source !== 'user' || data.user.coverUrl) &&
      (source !== 'custom' || style.customBackground),
  )

  const moved = Object.keys(style.offsets).length

  return (
    <aside className="panel">
      <p className="panel__hint">
        {rich(t.panel.hint, {
          delete: <kbd>Delete</kbd>,
          close: <b>✕</b>,
        })}
      </p>

      <details className="panel__section" open>
        <summary>{t.panel.background}</summary>
        <div className="panel__body">
          <div className="panel__chips">
            {backgrounds.map((source) => (
              <button
                key={source}
                type="button"
                className={`chip${style.background === source ? ' chip--active' : ''}`}
                onClick={() => update({ background: source })}
              >
                {t.panel.backgrounds[source]}
              </button>
            ))}
            <label className="chip chip--file">
              {t.panel.upload}
              <input type="file" accept="image/*" onChange={onUpload} />
            </label>
          </div>
          <p className="panel__note">
            {rich(t.panel.pasteHint, {
              shortcut: (
                <>
                  <kbd>Ctrl</kbd>+<kbd>V</kbd>
                </>
              ),
            })}
          </p>
          {style.background === 'solid' && (
            <label className="panel__row">
              <span>{t.panel.backgroundColor}</span>
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
              />
            </label>
          )}
          <label>
            <span>
              {t.panel.darken} · {Math.round(style.overlayOpacity * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={0.9}
              step={0.05}
              value={style.overlayOpacity}
              onChange={(e) => update({ overlayOpacity: Number(e.target.value) })}
            />
          </label>
          <label>
            <span>
              {t.panel.blur} · {style.blur}px
            </span>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={style.blur}
              onChange={(e) => update({ blur: Number(e.target.value) })}
            />
          </label>
        </div>
      </details>

      <details className="panel__section" open>
        <summary>{t.panel.appearance}</summary>
        <div className="panel__body">
          <div className="panel__row">
            <span>{t.panel.accent}</span>
            <div className="swatches">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`swatch${style.accentColor === color ? ' swatch--active' : ''}`}
                  style={{ background: color }}
                  aria-label={color}
                  onClick={() => update({ accentColor: color })}
                />
              ))}
              <input
                type="color"
                value={style.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
              />
            </div>
          </div>
          <label className="panel__row">
            <span>{t.panel.textColor}</span>
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => update({ textColor: e.target.value })}
            />
          </label>
          <label className="panel__row">
            <span>{t.panel.font}</span>
            <select
              value={style.font}
              onChange={(e) => update({ font: e.target.value as CardFont })}
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {t.panel.fonts[font]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              {t.panel.radius} · {style.radius}px
            </span>
            <input
              type="range"
              min={0}
              max={32}
              step={2}
              value={style.radius}
              onChange={(e) => update({ radius: Number(e.target.value) })}
            />
          </label>
          <label className="panel__row">
            <span>{t.panel.layout}</span>
            <select
              value={style.layout}
              onChange={(e) =>
                update({ layout: e.target.value as CardStyle['layout'] })
              }
            >
              <option value="classic">{t.panel.layouts.classic}</option>
              <option value="compact">{t.panel.layouts.compact}</option>
            </select>
          </label>
          <label className="panel__row">
            <span>{t.panel.scoreMode}</span>
            <select
              value={style.scoreMode}
              onChange={(e) =>
                update({ scoreMode: e.target.value as CardStyle['scoreMode'] })
              }
            >
              <option value="classic">{t.panel.scoreModes.classic}</option>
              <option value="standardised">
                {t.panel.scoreModes.standardised}
              </option>
            </select>
          </label>
        </div>
      </details>

      <details className="panel__section" open>
        <summary>{t.panel.blocks}</summary>
        <div className="panel__body">
          <ul className="blocks">
            {CARD_BLOCKS.map((block) => {
              const hidden = style.hidden.includes(block)
              return (
                <li
                  key={block}
                  className={`blocks__item${selected === block ? ' blocks__item--selected' : ''}${hidden ? ' blocks__item--hidden' : ''}`}
                >
                  <button
                    type="button"
                    className="blocks__name"
                    onClick={() => onSelect(hidden ? null : block)}
                  >
                    {t.block.labels[block]}
                  </button>
                  <button
                    type="button"
                    className="blocks__toggle"
                    title={hidden ? t.panel.show : t.panel.hide}
                    aria-pressed={!hidden}
                    onClick={() =>
                      onChange(
                        hidden ? showBlock(style, block) : hideBlock(style, block),
                      )
                    }
                  >
                    {hidden ? t.panel.show : t.panel.hide}
                  </button>
                </li>
              )
            })}
          </ul>
          {moved > 0 && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => update({ offsets: {} })}
            >
              {plural(t.panel.resetOffsets, moved)}
            </button>
          )}
        </div>
      </details>
    </aside>
  )
}

/** Splits a template on `{name}` placeholders and swaps in React nodes. */
function rich(template: string, values: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const match = /^\{(\w+)\}$/.exec(part)
    if (!match) return part
    return <span key={index}>{values[match[1]] ?? part}</span>
  })
}
