import { useRef, useState, type FormEvent } from 'react'
import { toPng } from 'html-to-image'
import { fetchScoreCard, parseScoreId } from './api.ts'
import { ScoreCard } from './components/ScoreCard.tsx'
import { StylePanel } from './components/StylePanel.tsx'
import { DEFAULT_STYLE, type CardStyle, type ScoreCardData } from './types.ts'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [data, setData] = useState<ScoreCardData | null>(null)
  const [style, setStyle] = useState<CardStyle>(DEFAULT_STYLE)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const id = parseScoreId(input)
    if (id === null) {
      setError('Cole um link como https://osu.ppy.sh/scores/1485666113 ou só o ID.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await fetchScoreCard(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const onExport = async () => {
    if (!cardRef.current || !data) return
    setExporting(true)
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2 })
      const link = document.createElement('a')
      link.href = url
      link.download = `osu-score-${data.id}.png`
      link.click()
    } catch (err) {
      setError(`Falha ao exportar a imagem: ${String(err)}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className="app">
      <h1 className="app__title">osu! score card</h1>
      <form className="search" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://osu.ppy.sh/scores/1485666113"
          aria-label="Link ou ID do score"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Gerar card'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {data && (
        <div className="editor">
          <div className="editor__preview">
            <ScoreCard ref={cardRef} data={data} style={style} />
            <div className="editor__actions">
              <button type="button" onClick={onExport} disabled={exporting}>
                {exporting ? 'Exportando…' : 'Baixar PNG'}
              </button>
              <button type="button" onClick={() => setStyle(DEFAULT_STYLE)}>
                Restaurar estilo
              </button>
              <a href={data.url} target="_blank" rel="noreferrer">
                Ver no osu!
              </a>
            </div>
          </div>
          <StylePanel data={data} style={style} onChange={setStyle} />
        </div>
      )}
    </main>
  )
}

export default App
