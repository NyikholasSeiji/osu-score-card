import type { ChangeEvent } from 'react'
import {
  BLOCK_LABELS,
  CARD_BLOCKS,
  type BackgroundSource,
  type CardBlock,
  type CardFont,
  type CardStyle,
  type ScoreCardData,
} from '../types.ts'
import { hideBlock, showBlock } from '../editor.ts'

interface StylePanelProps {
  data: ScoreCardData
  style: CardStyle
  selected: CardBlock | null
  onChange: (style: CardStyle) => void
  onSelect: (block: CardBlock | null) => void
}

const BACKGROUND_LABELS: Record<BackgroundSource, string> = {
  beatmap: 'Capa do mapa',
  user: 'Capa do perfil',
  custom: 'Imagem enviada',
  solid: 'Cor sólida',
}

const FONT_LABELS: Record<CardFont, string> = {
  sans: 'Moderna',
  rounded: 'Arredondada',
  mono: 'Monoespaçada',
}

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
  const update = (patch: Partial<CardStyle>) => onChange({ ...style, ...patch })

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () =>
      update({ background: 'custom', customBackground: String(reader.result) })
    reader.readAsDataURL(file)
  }

  const backgrounds = (Object.keys(BACKGROUND_LABELS) as BackgroundSource[]).filter(
    (source) =>
      (source !== 'user' || data.user.coverUrl) &&
      (source !== 'custom' || style.customBackground),
  )

  const moved = Object.keys(style.offsets).length

  return (
    <aside className="panel">
      <p className="panel__hint">
        Clique num bloco do card para selecioná-lo, arraste para mover e use
        <kbd>Delete</kbd> ou o <b>✕</b> para escondê-lo.
      </p>

      <details className="panel__section" open>
        <summary>Fundo</summary>
        <div className="panel__body">
          <div className="panel__chips">
            {backgrounds.map((source) => (
              <button
                key={source}
                type="button"
                className={`chip${style.background === source ? ' chip--active' : ''}`}
                onClick={() => update({ background: source })}
              >
                {BACKGROUND_LABELS[source]}
              </button>
            ))}
            <label className="chip chip--file">
              Enviar imagem…
              <input type="file" accept="image/*" onChange={onUpload} />
            </label>
          </div>
          {style.background === 'solid' && (
            <label className="panel__row">
              <span>Cor de fundo</span>
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
              />
            </label>
          )}
          <label>
            <span>Escurecer · {Math.round(style.overlayOpacity * 100)}%</span>
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
            <span>Desfoque · {style.blur}px</span>
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
        <summary>Aparência</summary>
        <div className="panel__body">
          <div className="panel__row">
            <span>Cor de destaque</span>
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
            <span>Cor do texto</span>
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => update({ textColor: e.target.value })}
            />
          </label>
          <label className="panel__row">
            <span>Fonte</span>
            <select
              value={style.font}
              onChange={(e) => update({ font: e.target.value as CardFont })}
            >
              {(Object.keys(FONT_LABELS) as CardFont[]).map((font) => (
                <option key={font} value={font}>
                  {FONT_LABELS[font]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Cantos arredondados · {style.radius}px</span>
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
            <span>Layout</span>
            <select
              value={style.layout}
              onChange={(e) =>
                update({ layout: e.target.value as CardStyle['layout'] })
              }
            >
              <option value="classic">Clássico (960px)</option>
              <option value="compact">Compacto (640px)</option>
            </select>
          </label>
          <label className="panel__row">
            <span>Pontuação</span>
            <select
              value={style.scoreMode}
              onChange={(e) =>
                update({ scoreMode: e.target.value as CardStyle['scoreMode'] })
              }
            >
              <option value="classic">Clássica</option>
              <option value="standardised">Padronizada (lazer)</option>
            </select>
          </label>
        </div>
      </details>

      <details className="panel__section" open>
        <summary>Blocos</summary>
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
                    {BLOCK_LABELS[block]}
                  </button>
                  <button
                    type="button"
                    className="blocks__toggle"
                    title={hidden ? 'Mostrar' : 'Esconder'}
                    aria-pressed={!hidden}
                    onClick={() =>
                      onChange(
                        hidden ? showBlock(style, block) : hideBlock(style, block),
                      )
                    }
                  >
                    {hidden ? 'Mostrar' : 'Esconder'}
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
              Recolocar {moved === 1 ? '1 bloco' : `${moved} blocos`} no lugar
            </button>
          )}
        </div>
      </details>
    </aside>
  )
}
