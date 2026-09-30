import type { ChangeEvent } from 'react'
import type {
  BackgroundSource,
  CardField,
  CardStyle,
  ScoreCardData,
} from '../types.ts'

interface StylePanelProps {
  data: ScoreCardData
  style: CardStyle
  onChange: (style: CardStyle) => void
}

const FIELD_LABELS: Record<CardField, string> = {
  starRating: 'Estrelas',
  mods: 'Mods',
  pp: 'PP',
  globalRank: 'Ranking global',
  date: 'Data',
  client: 'Cliente (Stable/Lazer)',
  player: 'Jogador',
  statistics: 'Great/Ok/Meh/Erros',
  beatmapInfo: 'BPM e duração',
}

const BACKGROUND_LABELS: Record<BackgroundSource, string> = {
  beatmap: 'Capa do mapa',
  user: 'Capa do perfil',
  custom: 'Imagem enviada',
  solid: 'Cor sólida',
}

export function StylePanel({ data, style, onChange }: StylePanelProps) {
  const update = (patch: Partial<CardStyle>) => onChange({ ...style, ...patch })

  const toggleField = (field: CardField) =>
    update({
      hidden: style.hidden.includes(field)
        ? style.hidden.filter((f) => f !== field)
        : [...style.hidden, field],
    })

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

  return (
    <aside className="panel">
      <fieldset>
        <legend>Fundo</legend>
        <select
          value={style.background}
          onChange={(e) => update({ background: e.target.value as BackgroundSource })}
        >
          {backgrounds.map((source) => (
            <option key={source} value={source}>
              {BACKGROUND_LABELS[source]}
            </option>
          ))}
        </select>
        <label className="panel__file">
          Enviar imagem
          <input type="file" accept="image/*" onChange={onUpload} />
        </label>
        {style.background === 'solid' && (
          <label>
            Cor de fundo
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
            />
          </label>
        )}
        <label>
          Escurecer ({Math.round(style.overlayOpacity * 100)}%)
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
          Desfoque ({style.blur}px)
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={style.blur}
            onChange={(e) => update({ blur: Number(e.target.value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Aparência</legend>
        <label>
          Cor de destaque
          <input
            type="color"
            value={style.accentColor}
            onChange={(e) => update({ accentColor: e.target.value })}
          />
        </label>
        <label>
          Layout
          <select
            value={style.layout}
            onChange={(e) =>
              update({ layout: e.target.value as CardStyle['layout'] })
            }
          >
            <option value="classic">Clássico</option>
            <option value="compact">Compacto</option>
          </select>
        </label>
        <label>
          Pontuação
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
      </fieldset>

      <fieldset>
        <legend>Mostrar</legend>
        {(Object.keys(FIELD_LABELS) as CardField[]).map((field) => (
          <label key={field} className="panel__check">
            <input
              type="checkbox"
              checked={!style.hidden.includes(field)}
              onChange={() => toggleField(field)}
            />
            {FIELD_LABELS[field]}
          </label>
        ))}
      </fieldset>
    </aside>
  )
}
