import { useEffect, useState } from 'react'
import { proxiedImage } from '../api.ts'
import { GRADE_LABEL, getFormatters } from '../format.ts'
import { translateError, useI18n, type UiError } from '../i18n/index.ts'
import { RULESETS, type Ruleset, type ScoreListType, type ScoreSummary } from '../types.ts'
import { RULESET_LABEL } from '../rulesets.ts'
import { ModeIcon } from './Icons.tsx'

interface Props {
  /** Loads one list; the component caches each type until it is remounted. */
  fetchScores: (type: ScoreListType) => Promise<ScoreSummary[]>
  onPick: (score: ScoreSummary) => void
  mode: Ruleset
  onModeChange: (mode: Ruleset) => void
  picking: number | null
  toUiError: (err: unknown) => UiError
}

const LIST_TYPES: ScoreListType[] = ['recent', 'best']

/** Lists a player's recent/best plays so one can be turned into a card. */
export function ScorePicker({
  fetchScores,
  onPick,
  mode,
  onModeChange,
  picking,
  toUiError,
}: Props) {
  const { t } = useI18n()
  const fmt = getFormatters(t.locale)
  const [type, setType] = useState<ScoreListType>('recent')
  const [lists, setLists] = useState<Partial<Record<string, ScoreSummary[]>>>(
    {},
  )
  const [error, setError] = useState<UiError | null>(null)

  const listKey = `${mode}:${type}`
  const scores = lists[listKey]

  useEffect(() => {
    if (scores) return
    let cancelled = false
    fetchScores(type)
      .then((list) => {
        if (!cancelled) setLists((prev) => ({ ...prev, [listKey]: list }))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toUiError(err))
      })
    return () => {
      cancelled = true
    }
  }, [type, listKey, scores, fetchScores, toUiError])

  return (
    <section className="picker" aria-label={t.auth.picker}>
      <div className="picker__tabs" role="tablist">
        {LIST_TYPES.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === type}
            className={`chip${item === type ? ' chip--active' : ''}`}
            onClick={() => {
              setType(item)
              setError(null)
            }}
          >
            {t.auth[item]}
          </button>
        ))}
        <div className="picker__modes" role="group" aria-label={t.player.mode}>
          {RULESETS.map((item) => (
            <button
              key={item}
              type="button"
              className={`mode-chip${item === mode ? ' mode-chip--active' : ''}`}
              aria-pressed={item === mode}
              title={RULESET_LABEL[item]}
              onClick={() => {
                onModeChange(item)
                setError(null)
              }}
            >
              <ModeIcon ruleset={item} />
              <span>{RULESET_LABEL[item]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {translateError(t, error)}
        </p>
      )}
      {!error && !scores && <p className="picker__status">{t.player.loading}</p>}
      {scores && scores.length === 0 && (
        <p className="picker__status">{t.player.empty}</p>
      )}

      {scores && scores.length > 0 && (
        <ul className="picker__list">
          {scores.map((score) => (
            <li key={score.id}>
              <button
                type="button"
                className="play"
                onClick={() => onPick(score)}
                disabled={picking !== null}
                aria-busy={picking === score.id}
                title={t.auth.use}
              >
                <img
                  className="play__cover"
                  src={proxiedImage(score.beatmapset.listUrl)}
                  alt=""
                  loading="lazy"
                />
                <span className={`play__grade card__grade--${score.rank}`}>
                  {GRADE_LABEL[score.rank]}
                </span>
                <span className="play__info">
                  <span className="play__title">
                    {score.beatmapset.title}{' '}
                    <span className="play__version">
                      [{score.beatmap.version}]
                    </span>
                  </span>
                  <span className="play__sub">
                    {score.beatmapset.artist} · {fmt.stars(score.beatmap.starRating)}★
                    {score.mods.length > 0 && ` · +${score.mods.join('')}`}
                  </span>
                </span>
                <span className="play__stats">
                  <b>{score.pp === null ? '—' : `${fmt.integer(score.pp)}pp`}</b>
                  <span>{fmt.accuracy(score.accuracy)}</span>
                  <span className="play__date">
                    {fmt.shortDate(score.endedAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
