import { forwardRef, type CSSProperties } from 'react'
import { proxiedImage } from '../api.ts'
import {
  GRADE_LABEL,
  formatAccuracy,
  formatDate,
  formatInteger,
  formatLength,
  formatStars,
} from '../format.ts'
import type { CardFont, CardStyle, ScoreCardData } from '../types.ts'
import { EditorContext, type CardEditor } from '../editor.ts'
import { Block } from './Block.tsx'

interface ScoreCardProps {
  data: ScoreCardData
  style: CardStyle
  editor?: CardEditor
}

const FONTS: Record<CardFont, string> = {
  sans: "'Inter', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif",
  rounded: "'Nunito', 'Segoe UI', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
}

function backgroundImage(data: ScoreCardData, style: CardStyle): string | null {
  switch (style.background) {
    case 'beatmap':
      return proxiedImage(data.beatmapset.coverUrl)
    case 'user':
      return data.user.coverUrl ? proxiedImage(data.user.coverUrl) : null
    case 'custom':
      return style.customBackground
    case 'solid':
      return null
  }
}

export const ScoreCard = forwardRef<HTMLDivElement, ScoreCardProps>(
  function ScoreCard({ data, style, editor }, ref) {
    const image = backgroundImage(data, style)
    const totalScore =
      style.scoreMode === 'classic' ? data.score.classic : data.score.standardised
    const cssVars = {
      '--accent': style.accentColor,
      '--card-bg': style.backgroundColor,
      '--overlay': style.overlayOpacity,
      '--blur': `${style.blur}px`,
      '--text': style.textColor,
      '--radius': `${style.radius}px`,
      fontFamily: FONTS[style.font],
    } as CSSProperties

    const classes = ['card', `card--${style.layout}`]
    if (editor) classes.push('card--editing')

    const context: CardEditor = editor ?? {
      style,
      onChange: () => {},
      selected: null,
      onSelect: () => {},
      scale: 1,
      readOnly: true,
    }

    return (
      <EditorContext.Provider value={context}>
        <div
          ref={ref}
          className={classes.join(' ')}
          style={cssVars}
          onPointerDown={() => editor?.onSelect(null)}
        >
          <header className="card__header">
            <Block id="header" className="card__heading">
              <h2 className="card__title">
                {data.beatmapset.title}{' '}
                <span className="card__artist">por {data.beatmapset.artist}</span>
              </h2>
              <p className="card__difficulty">
                <span>{data.beatmap.version}</span>
                <span className="card__muted">
                  mapeado por {data.beatmapset.creator}
                </span>
              </p>
            </Block>
            <Block id="starRating" className="card__stars">
              ★ {formatStars(data.beatmap.starRating)}
            </Block>
          </header>

          <section className="card__hero">
            {image && (
              <div
                className="card__hero-bg"
                style={{ backgroundImage: `url("${image}")` }}
              />
            )}
            <div className="card__hero-overlay" />
            <div className="card__hero-content">
              <Block id="grade" className={`card__grade card__grade--${data.rank}`}>
                {GRADE_LABEL[data.rank]}
              </Block>
              <div className="card__score-block">
                {data.mods.length > 0 && (
                  <Block id="mods" className="card__mods">
                    {data.mods.map((mod) => (
                      <span key={mod.acronym} className="card__mod">
                        {mod.acronym}
                      </span>
                    ))}
                  </Block>
                )}
                <Block id="score" className="card__score">
                  {formatInteger(totalScore)}
                </Block>
                <Block id="meta" className="card__meta">
                  <dl>
                    <div>
                      <dt>Jogado por</dt>
                      <dd>{data.user.username}</dd>
                    </div>
                    <div>
                      <dt>Enviado em</dt>
                      <dd>{formatDate(data.endedAt)}</dd>
                    </div>
                    <div>
                      <dt>Jogado no</dt>
                      <dd>{data.client === 'stable' ? 'Stable' : 'Lazer'}</dd>
                    </div>
                    <div>
                      <dt>BPM / duração</dt>
                      <dd>
                        {formatInteger(data.beatmap.bpm)} /{' '}
                        {formatLength(data.beatmap.lengthSeconds)}
                      </dd>
                    </div>
                  </dl>
                </Block>
                {data.globalRank !== null && (
                  <Block id="globalRank" className="card__global-rank">
                    <span>Ranking global</span>
                    <strong>#{formatInteger(data.globalRank)}</strong>
                  </Block>
                )}
              </div>
            </div>
          </section>

          <footer className="card__footer">
            <Block id="player" className="card__player">
              <img
                className="card__avatar"
                src={proxiedImage(data.user.avatarUrl)}
                alt=""
                crossOrigin="anonymous"
              />
              <div>
                <span className="card__country">{data.user.countryCode}</span>
                <strong className="card__username">{data.user.username}</strong>
              </div>
            </Block>
            <div className="card__stats">
              <Block id="accuracy" className="card__stat">
                <Stat label="Precisão" value={formatAccuracy(data.accuracy)} />
              </Block>
              <Block id="combo" className="card__stat">
                <Stat
                  label="Combo máximo"
                  value={`${formatInteger(data.maxCombo)}x`}
                />
              </Block>
              <Block id="pp" className="card__stat">
                <Stat
                  label="PP"
                  value={data.pp === null ? '-' : formatInteger(data.pp)}
                />
              </Block>
              <Block id="statistics" className="card__stat-group">
                <Stat label="Great" value={data.statistics.great} tone="great" />
                <Stat label="Ok" value={data.statistics.ok} tone="ok" />
                <Stat label="Meh" value={data.statistics.meh} tone="meh" />
                <Stat label="Erros" value={data.statistics.miss} tone="miss" />
              </Block>
            </div>
          </footer>
        </div>
      </EditorContext.Provider>
    )
  },
)

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: 'great' | 'ok' | 'meh' | 'miss'
}) {
  return (
    <div className="stat">
      <span className={`stat__label${tone ? ` stat__label--${tone}` : ''}`}>
        {label}
      </span>
      <span className="stat__value">{value}</span>
    </div>
  )
}
