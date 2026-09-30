import type { ScoreCardData } from './types.ts'

export function parseScoreId(input: string): number | null {
  const value = input.trim()
  if (/^\d+$/.test(value)) return Number(value)
  const match = value.match(/osu\.ppy\.sh\/scores\/(\d+)(?:[/?#]|$)/)
  return match ? Number(match[1]) : null
}

export async function fetchScoreCard(id: number): Promise<ScoreCardData> {
  const response = await fetch(`/api/scores/${id}`)
  if (!response.ok) {
    const body: { message?: unknown } = await response.json().catch(() => ({}))
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : `Erro ${response.status} ao buscar o score.`,
    )
  }
  return response.json()
}

export function proxiedImage(url: string): string {
  return `/api/images?url=${encodeURIComponent(url)}`
}
