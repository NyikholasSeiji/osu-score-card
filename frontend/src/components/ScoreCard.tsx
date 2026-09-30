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
import type { CardField, CardStyle, ScoreCardData } from '../types.ts'

interface ScoreCardProps {
  data: ScoreCardData
  style: CardStyle
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
  function ScoreCard({ data, style }, ref) {
    const visible = (field: CardField) => !style.hidden.includes(field)
    const image = backgroundImage(data, style)
    const totalScore =
      style.scoreMode === 'classic' ? data.score.classic : data.score.standardised
    const cssVars = {
      '--accent': style.accentColor,
      '--card-bg': style.backgroundColor,
      '--overlay': style.overlayOpacity,
      '--blur': `${style.blur}px`,
    } as CSSProperties

    return (
      <div ref={ref} className={`card card--${style.layout}`} style={cssVars}>
        <header className="card__header">
          <h2 className="card__title">
            {data.beatmapset.title}{' '}
            <span className="card__artist">por {data.beatmapset.artist}</span>
          </h2>
          <p className="card__difficulty">
            {visible('starRating') && (
              <span className="card__stars">
                ★ {formatStars(data.beatmap.starRating)}
              </span>
            )}
            <span>{data.beatmap.version}</span>
            <span className="card__muted">
              mapeado por {data.beatmapset.creator}
            </span>
          </p>
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
            <div className={`card__grade card__grade--${data.rank}`}>
              {GRADE_LABEL[data.rank]}
            </div>
            <div className="card__score-block">
              {visible('mods') && data.mods.length > 0 && (
                <div className="card__mods">
                  {data.mods.map((mod) => (
                    <span key={mod.acronym} className="card__mod">
                      {mod.acronym}
                    </span>
                  ))}
                </div>
              )}
              <div className="card__score">{formatInteger(totalScore)}</div>
              <dl className="card__meta">
                {visible('player') && (
                  <>
                    <dt>Jogado por</dt>
                    <dd>{data.user.username}</dd>
                  </>
                )}
                {visible('date') && (
                  <>
                    <dt>Enviado em</dt>
                    <dd>{formatDate(data.endedAt)}</dd>
                  </>
                )}
                {visible('client') && (
                  <>
                    <dt>Jogado no</dt>
                    <dd>{data.client === 'stable' ? 'Stable' : 'Lazer'}</dd>
                  </>
                )}
                {visible('beatmapInfo') && (
                  <>
                    <dt>BPM / duração</dt>
                    <dd>
                      {formatInteger(data.beatmap.bpm)} /{' '}
                      {formatLength(data.beatmap.lengthSeconds)}
                    </dd>
                  </>
                )}
              </dl>
              {visible('globalRank') && data.globalRank !== null && (
                <div className="card__global-rank">
                  <span>Ranking global</span>
                  <strong>#{formatInteger(data.globalRank)}</strong>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="card__footer">
          {visible('player') && (
            <div className="card__player">
              <img
                className="card__avatar"
                src={proxiedImage(data.user.avatarUrl)}
                alt=""
              />
              <div>
                <span className="card__country">{data.user.countryCode}</span>
                <strong className="card__username">{data.user.username}</strong>
              </div>
            </div>
          )}
          <div className="card__stats">
            <Stat label="Precisão" value={formatAccuracy(data.accuracy)} />
            <Stat
              label="Combo máximo"
              value={`${formatInteger(data.maxCombo)}x`}
            />
            {visible('pp') && (
              <Stat
                label="PP"
                value={data.pp === null ? '-' : formatInteger(data.pp)}
              />
            )}
            {visible('statistics') && (
              <>
                <Stat label="Great" value={data.statistics.great} tone="great" />
                <Stat label="Ok" value={data.statistics.ok} tone="ok" />
                <Stat label="Meh" value={data.statistics.meh} tone="meh" />
                <Stat label="Erros" value={data.statistics.miss} tone="miss" />
              </>
            )}
          </div>
        </footer>
      </div>
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
    <div className="card__stat">
      <span className={`card__stat-label${tone ? ` card__stat-label--${tone}` : ''}`}>
        {label}
      </span>
      <span className="card__stat-value">{value}</span>
    </div>
  )
}
