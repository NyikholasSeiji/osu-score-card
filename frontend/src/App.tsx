import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react'
import { toPng } from 'html-to-image'
import { ApiError, fetchScoreCard, parseScoreId } from './api.ts'
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
import { StylePanel } from './components/StylePanel.tsx'
import {
  I18nContext,
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  detectLanguage,
  isErrorKey,
  isLanguage,
  translateError,
  useI18n,
  type Language,
  type UiError,
} from './i18n/index.ts'
import {
  DEFAULT_STYLE,
  type CardBlock,
  type CardStyle,
  type ScoreCardData,
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
  const cardRef = useRef<HTMLDivElement>(null)
  const { stageRef, scale, height } = useCardScale(cardRef, [data, style])

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
    setLoading(true)
    setError(null)
    try {
      setData(await fetchScoreCard(id))
      setSelected(null)
    } catch (err) {
      setError(toUiError(err))
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width={32} height={32} />
          <span>
            osu! <b>card generator</b>
          </span>
        </a>
        <div className="topbar__right">
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
          <a
            className="topbar__link"
            href="https://github.com/NyikholasSeiji/osu-score-card"
            target="_blank"
            rel="noreferrer"
          >
            {t.app.github}
          </a>
        </div>
      </header>

      <main className="main">
        <section className={`intro${data ? ' intro--compact' : ''}`}>
          {!data && (
            <>
              <h1>{t.intro.heading}</h1>
              <p>{t.intro.lead}</p>
            </>
          )}
          <form className="search" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.intro.placeholder}
              aria-label={t.intro.inputLabel}
              inputMode="url"
              autoComplete="off"
            />
            <button type="submit" className="button" disabled={loading}>
              {loading ? t.intro.loading : t.intro.generate}
            </button>
          </form>
          {error && (
            <p className="error" role="alert">
              {translateError(t, error)}
            </p>
          )}
        </section>

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
                  className="button"
                  onClick={onExport}
                  disabled={exporting}
                >
                  {exporting ? t.actions.exporting : t.actions.download}
                </button>
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
