import type { ScoreCardData } from './types.ts'

/** Error returned by the backend, carrying a stable `code` for translation. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null

  constructor(message: string, status: number, code: string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function parseScoreId(input: string): number | null {
  const value = input.trim()
  if (/^\d+$/.test(value)) return Number(value)
  const match = value.match(/osu\.ppy\.sh\/scores\/(\d+)(?:[/?#]|$)/)
  return match ? Number(match[1]) : null
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body: { message?: unknown; code?: unknown } = await response
      .json()
      .catch(() => ({}))
    throw new ApiError(
      typeof body.message === 'string'
        ? body.message
        : `Request failed with status ${response.status}.`,
      response.status,
      typeof body.code === 'string' ? body.code : null,
    )
  }
  return response.json() as Promise<T>
}

export function fetchScoreCard(id: number): Promise<ScoreCardData> {
  return request(`/api/scores/${id}`)
}

export function proxiedImage(url: string): string {
  return `/api/images?url=${encodeURIComponent(url)}`
}
