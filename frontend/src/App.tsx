import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react'
import { toPng } from 'html-to-image'
import {
  ApiError,
  LOGIN_URL,
  fetchMe,
  fetchScoreCard,
  logout,
  parseScoreId,
} from './api.ts'
import {
  hideBlock,
  imageFromTransfer,
  readImageAsDataUrl,
  resetOffset,
  showBlock,
  withCustomBackground,
  type CardEditor,
} from './editor.ts'
import { ScoreCard } from './components/ScoreCard.tsx'
import { ScorePicker } from './components/ScorePicker.tsx'
import { StylePanel } from './components/StylePanel.tsx'
import { getFormatters } from './format.ts'
import {
  I18nContext,
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  detectLanguage,
  interpolate,
  isErrorKey,
  isLanguage,
  translateError,
  useI18n,
  type Language,
  type UiError,
} from './i18n/index.ts'
import {
  DEFAULT_STYLE,
  type AuthUser,
  type CardBlock,
  type CardStyle,
  type ScoreCardData,
  type ScoreSummary,
} from './types.ts'
import './App.css'

const isEditorNode = (node: HTMLElement) =>
  node.classList?.contains('block__tools') ?? false

function toUiError(err: unknown): UiError {
  if (err instanceof ApiError) {
    if (isErrorKey(err.code)) return { key: err.code }
    return { key: 'request', values: { status: err.status } }
  }
  return { text: err instanceof Error ? err.message : String(err) }
}

const AUTH_STATUS = ['denied', 'failed', 'state'] as const
type AuthStatus = (typeof AUTH_STATUS)[number]

/** Reads and strips the `?auth=` flag the OAuth callback redirects back with. */
function consumeAuthStatus(): AuthStatus | 'ok' | null {
  const url = new URL(window.location.href)
  const value = url.searchParams.get('auth')
  if (value === null) return null
  url.searchParams.delete('auth')
  window.history.replaceState(null, '', url)
  if (value === 'ok') return 'ok'
  return (AUTH_STATUS as readonly string[]).includes(value)
    ? (value as AuthStatus)
    : 'failed'
}

function App() {
  const [lang, setLangState] = useState<Language>(detectLanguage)
  const t = LANGUAGES[lang]

  const setLang = (next: Language) => {
    setLangState(next)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
  }

  useEffect(() => {
    document.documentElement.lang = t.locale
    document.title = t.app.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.app.description)
  }, [t])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <Generator />
    </I18nContext.Provider>
  )
}

function Generator() {
  const { lang, setLang, t } = useI18n()
  const [input, setInput] = useState('')
  const [data, setData] = useState<ScoreCardData | null>(null)
  const [style, setStyle] = useState<CardStyle>(DEFAULT_STYLE)
  const [selected, setSelected] = useState<CardBlock | null>(null)
  const [error, setError] = useState<UiError | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dropping, setDropping] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authStatus] = useState(consumeAuthStatus)
  const [authNotice, setAuthNotice] = useState<AuthStatus | null>(
    authStatus && authStatus !== 'ok' ? authStatus : null,
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [picking, setPicking] = useState<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { stageRef, scale, height } = useCardScale(cardRef, [data, style])

  useEffect(() => {
    fetchMe()
      .then((me) => {
        setUser(me)
        if (me && authStatus === 'ok') setPickerOpen(true)
      })
      .catch(() => setUser(null))
  }, [authStatus])

  const loadCard = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchScoreCard(id))
      setSelected(null)
      return true
    } catch (err) {
      setError(toUiError(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const onPick = async (score: ScoreSummary) => {
    setPicking(score.id)
    setAuthNotice(null)
    const ok = await loadCard(score.id)
    setPicking(null)
    if (ok) {
      setInput(`https://osu.ppy.sh/scores/${score.id}`)
      setPickerOpen(false)
    }
  }

  const onLogout = async () => {
    try {
      await logout()
    } catch (err) {
      setError(toUiError(err))
      return
    }
    setUser(null)
    setPickerOpen(false)
  }

  const applyImageFile = async (file: File) => {
    try {
      const dataUrl = await readImageAsDataUrl(file)
      setStyle((s) => withCustomBackground(s, dataUrl))
    } catch (err) {
      setError({ key: 'imageFailed', values: { error: String(err) } })
    }
  }

  useEffect(() => {
    if (!data) return
    const onPaste = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement).matches('input, textarea')) return
      const file = imageFromTransfer(event.clipboardData)
      if (!file) return
      event.preventDefault()
      void applyImageFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [data])

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDropping(true)
  }

  const onDrop = (event: DragEvent) => {
    setDropping(false)
    const file = imageFromTransfer(event.dataTransfer)
    if (!file) return
    event.preventDefault()
    void applyImageFile(file)
  }

  useEffect(() => {
    if (!selected) return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches('input, select, textarea')) return
      const block = selected
      const nudge = (dx: number, dy: number) => {
        event.preventDefault()
        setStyle((s) => {
          const current = s.offsets[block] ?? { x: 0, y: 0 }
          return {
            ...s,
            offsets: {
              ...s.offsets,
              [block]: { x: current.x + dx, y: current.y + dy },
            },
          }
        })
      }
      const step = event.shiftKey ? 10 : 1
      switch (event.key) {
        case 'Escape':
          setSelected(null)
          break
        case 'Delete':
        case 'Backspace':
          setStyle((s) => hideBlock(s, block))
          setSelected(null)
          break
        case 'ArrowLeft':
          nudge(-step, 0)
          break
        case 'ArrowRight':
          nudge(step, 0)
          break
        case 'ArrowUp':
          nudge(0, -step)
          break
        case 'ArrowDown':
          nudge(0, step)
          break
        case '0':
          setStyle((s) => resetOffset(s, block))
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const id = parseScoreId(input)
    if (id === null) {
      setError({ key: 'invalidInput' })
      return
    }
    setAuthNotice(null)
    await loadCard(id)
  }

  const onExport = async () => {
    if (!cardRef.current || !data) return
    setExporting(true)
    setSelected(null)
    await new Promise((resolve) => setTimeout(resolve, 50))
    try {
      const url = await toPng(cardRef.current, {
        pixelRatio: 2,
        filter: (node) => !isEditorNode(node as HTMLElement),
      })
      const link = document.createElement('a')
      link.href = url
      link.download = `osu-score-${data.id}.png`
      link.click()
    } catch (err) {
      setError({ key: 'exportFailed', values: { error: String(err) } })
    } finally {
      setExporting(false)
    }
  }

  const editor: CardEditor | undefined = exporting
    ? undefined
    : { style, onChange: setStyle, selected, onSelect: setSelected, scale }

  const changed = JSON.stringify(style) !== JSON.stringify(DEFAULT_STYLE)

  const fmt = getFormatters(t.locale)
  const togglePicker = () => setPickerOpen((open) => !open)

  const account = user ? (
    <div className="account">
      <img
        className="account__avatar"
        src={user.avatarUrl}
        alt=""
        width={36}
        height={36}
      />
      <span className="account__name">
        <span className="sr-only">{t.auth.loggedInAs} </span>
        {user.username}
      </span>
      <button type="button" className="account__logout" onClick={onLogout}>
        {t.auth.logout}
      </button>
    </div>
  ) : (
    <a className="button button--login" href={LOGIN_URL}>
      <OsuIcon />
      {t.auth.login}
    </a>
  )

  const language = (
    <label className="lang">
      <span className="sr-only">{t.app.language}</span>
      <select
        value={lang}
        onChange={(e) => {
          if (isLanguage(e.target.value)) setLang(e.target.value)
        }}
        aria-label={t.app.language}
      >
        {(Object.keys(LANGUAGES) as Language[]).map((code) => (
          <option key={code} value={code}>
            {LANGUAGES[code].name}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <span>
            osu!<b>card</b>
          </span>
        </a>

        <nav className="nav" aria-label={t.nav.home}>
          <a
            className={`nav__item${pickerOpen ? '' : ' nav__item--active'}`}
            href="/"
          >
            <HomeIcon />
            {t.nav.home}
          </a>
          {user ? (
            <button
              type="button"
              className={`nav__item${pickerOpen ? ' nav__item--active' : ''}`}
              aria-expanded={pickerOpen}
              onClick={togglePicker}
            >
              <ListIcon />
              {t.nav.myPlays}
            </button>
          ) : (
            <a className="nav__item" href={LOGIN_URL}>
              <ListIcon />
              {t.nav.myPlays}
              <span className="nav__badge">osu!</span>
            </a>
          )}
          <a
            className="nav__item"
            href="https://github.com/NyikholasSeiji/osu-score-card"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon />
            {t.nav.github}
          </a>
        </nav>

        <div className="sidebar__footer">
          {language}
          {account}
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <form className="search" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.intro.placeholder}
              aria-label={t.intro.inputLabel}
              inputMode="url"
              autoComplete="off"
            />
            <button
              type="submit"
              className="search__go"
              disabled={loading}
              aria-label={t.intro.generate}
              title={t.intro.generate}
            >
              {loading ? <span className="spinner" /> : <ArrowIcon />}
            </button>
          </form>
          <div className="topbar__right">
            {language}
            {account}
          </div>
        </header>

        <main className="main">
          {authNotice && (
            <p className="error" role="alert">
              {t.auth[authNotice]}
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {translateError(t, error)}
            </p>
          )}

          <section className="hero">
            <div className="hero__body">
              <p className="hero__label">
                <span className="hero__dot" />
                {data ? t.intro.readyLabel : t.intro.startLabel}
              </p>
              {data ? (
                <>
                  <h1 className="hero__title">
                    {data.beatmapset.title}
                    <span className="hero__sub">
                      {' '}
                      [{data.beatmap.version}] · {data.user.username}
                    </span>
                  </h1>
                  <div className="hero__actions">
                    <button
                      type="button"
                      className="button"
                      onClick={onExport}
                      disabled={exporting}
                    >
                      <DownloadIcon />
                      {exporting ? t.actions.exporting : t.actions.download}
                    </button>
                    <span className="hero__mono">
                      {interpolate(t.intro.scoreId, { id: data.id })} ·{' '}
                      {fmt.shortDate(data.endedAt)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="hero__title">{t.intro.heading}</h1>
                  <p className="hero__lead">{t.intro.lead}</p>
                  <div className="hero__actions">
                    {user ? (
                      <button
                        type="button"
                        className="button"
                        aria-expanded={pickerOpen}
                        onClick={togglePicker}
                      >
                        <ListIcon />
                        {pickerOpen ? t.auth.hide : t.auth.show}
                      </button>
                    ) : (
                      <a className="button" href={LOGIN_URL}>
                        <OsuIcon />
                        {t.auth.login}
                      </a>
                    )}
                    <span className="hero__mono">{t.intro.startHint}</span>
                  </div>
                </>
              )}
            </div>
            <div className="hero__aside">
              {data ? (
                <Ring value={data.accuracy} label={fmt.accuracy(data.accuracy)} />
              ) : (
                <img src="/favicon.svg" alt="" width={96} height={96} />
              )}
            </div>
          </section>

          {user && pickerOpen && (
            <section className="section">
              <h2 className="section__title">{t.auth.picker}</h2>
              <ScorePicker
                onPick={onPick}
                picking={picking}
                toUiError={toUiError}
              />
            </section>
          )}

          {data && (
            <section className="editor">
              <div
                className={`editor__preview${dropping ? ' editor__preview--dropping' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={() => setDropping(false)}
                onDrop={onDrop}
              >
                <div className="stage" ref={stageRef} style={{ height }}>
                  <div
                    className="stage__inner"
                    style={{ transform: `scale(${scale})` }}
                  >
                    <ScoreCard
                      ref={cardRef}
                      data={data}
                      style={style}
                      editor={editor}
                    />
                  </div>
                </div>

                {style.hidden.length > 0 && (
                  <div className="hidden-blocks">
                    <span>{t.actions.hidden}</span>
                    {style.hidden.map((block) => (
                      <button
                        key={block}
                        type="button"
                        className="chip"
                        onClick={() => setStyle((s) => showBlock(s, block))}
                      >
                        {t.block.labels[block]} +
                      </button>
                    ))}
                  </div>
                )}

                <div className="editor__actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => {
                      setStyle(DEFAULT_STYLE)
                      setSelected(null)
                    }}
                    disabled={!changed}
                  >
                    {t.actions.reset}
                  </button>
                  <a
                    className="button button--ghost"
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.actions.viewOnOsu}
                  </a>
                </div>
              </div>

              <StylePanel
                data={data}
                style={style}
                selected={selected}
                onChange={setStyle}
                onSelect={setSelected}
              />
            </section>
          )}
        </main>

        <footer className="footer">{t.app.footer}</footer>
      </div>
    </div>
  )
}

/** Accuracy ring, the loaded score's headline number. */
function Ring({ value, label }: { value: number; label: string }) {
  const degrees = Math.round(Math.min(1, Math.max(0, value)) * 360)
  return (
    <div
      className="ring"
      style={{ ['--ring' as string]: `${degrees}deg` }}
      role="img"
      aria-label={label}
    >
      <span>{label}</span>
    </div>
  )
}

const icon = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function HomeIcon() {
  return (
    <svg {...icon}>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg {...icon}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg {...icon}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg {...icon}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg {...icon}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
    </svg>
  )
}

function OsuIcon() {
  return (
    <svg {...icon} strokeWidth={2.5}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

/**
 * Keeps the card at its real pixel size (so the PNG is always the same) and
 * scales the preview down to fit the available width.
 */
function useCardScale(
  cardRef: React.RefObject<HTMLDivElement | null>,
  deps: unknown[],
) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const card = cardRef.current
    if (!stage || !card) return
    const measure = () => {
      const available = stage.clientWidth
      const next = Math.min(1, available / card.offsetWidth)
      setScale(next)
      setHeight(card.offsetHeight * next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    observer.observe(card)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { stageRef, scale, height }
}

export default App
