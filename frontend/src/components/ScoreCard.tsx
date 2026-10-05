import { forwardRef, type CSSProperties } from 'react'
import { proxiedImage } from '../api.ts'
import { getFormatters } from '../format.ts'
import type { CardFont, CardStyle, ScoreCardData } from '../types.ts'
import { EditorContext, type CardEditor } from '../editor.ts'
import { interpolate, useI18n } from '../i18n/index.ts'
import { Block } from './Block.tsx'
import { ModIcon, RankIcon } from './Icons.tsx'

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
    const { t } = useI18n()
    const fmt = getFormatters(t.locale)
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

    const meta = (
      <Block id="meta" className="card__meta">
        <dl>
          <div>
            <dt>{t.card.playedBy}</dt>
            <dd>{data.user.username}</dd>
          </div>
          <div>
            <dt>{t.card.submittedOn}</dt>
            <dd>{fmt.date(data.endedAt)}</dd>
          </div>
          <div>
            <dt>{t.card.playedOn}</dt>
            <dd>{data.client === 'stable' ? 'Stable' : 'Lazer'}</dd>
          </div>
          <div>
            <dt>{t.card.bpmLength}</dt>
            <dd>
              {fmt.integer(data.beatmap.bpm)} /{' '}
              {fmt.length(data.beatmap.lengthSeconds)}
            </dd>
          </div>
        </dl>
      </Block>
    )

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
                <span className="card__artist">
                  {interpolate(t.card.by, { artist: data.beatmapset.artist })}
                </span>
              </h2>
              <p className="card__difficulty">
                <span>{data.beatmap.version}</span>
                <span className="card__muted">
                  {interpolate(t.card.mappedBy, {
                    creator: data.beatmapset.creator,
                  })}
                </span>
              </p>
            </Block>
            <Block id="starRating" className="card__stars">
              ★ {fmt.stars(data.beatmap.starRating)}
            </Block>
          </header>

          <section className="card__hero">
            {image && style.blur > 0 && (
              <div
                className="card__hero-bg card__hero-bg--bleed"
                style={{ backgroundImage: `url("${image}")` }}
              />
            )}
            {image && (
              <div
                className="card__hero-bg"
                style={{ backgroundImage: `url("${image}")` }}
              />
            )}
            <div className="card__hero-overlay" />
            <div className="card__hero-content">
              <Block id="grade" className={`card__grade card__grade--${data.rank}`}>
                <RankIcon grade={data.rank} />
              </Block>
              <div className="card__score-block">
                {data.mods.length > 0 && (
                  <Block id="mods" className="card__mods">
                    {data.mods.map((mod) => (
                      <ModIcon key={mod.acronym} acronym={mod.acronym} />
                    ))}
                  </Block>
                )}
                <Block id="score" className="card__score">
                  {fmt.integer(totalScore)}
                </Block>
                {style.layout === 'classic' && meta}
                {data.globalRank !== null && (
                  <Block id="globalRank" className="card__global-rank">
                    <span>{t.card.globalRank}</span>
                    <strong>#{fmt.integer(data.globalRank)}</strong>
                  </Block>
                )}
              </div>
              {style.layout === 'compact' && meta}
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
                <Stat label={t.card.accuracy} value={fmt.accuracy(data.accuracy)} />
              </Block>
              <Block id="combo" className="card__stat">
                <Stat
                  label={t.card.maxCombo}
                  value={`${fmt.integer(data.maxCombo)}x`}
                />
              </Block>
              <Block id="pp" className="card__stat">
                <Stat
                  label={t.card.pp}
                  value={data.pp === null ? '-' : fmt.integer(data.pp)}
                />
              </Block>
              <Block id="statistics" className="card__stat-group">
                <Stat label={t.card.great} value={data.statistics.great} tone="great" />
                <Stat label={t.card.ok} value={data.statistics.ok} tone="ok" />
                <Stat label={t.card.meh} value={data.statistics.meh} tone="meh" />
                <Stat label={t.card.miss} value={data.statistics.miss} tone="miss" />
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
