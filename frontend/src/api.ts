import type {
  AuthUser,
  Player,
  ScoreCardData,
  ScoreListType,
  ScoreSummary,
} from './types.ts'

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

export const LOGIN_URL = '/api/auth/osu'

/** Resolves to `null` when there is no active osu! session. */
export async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await request<AuthUser>('/api/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

export function fetchMyScores(type: ScoreListType): Promise<ScoreSummary[]> {
  return request(`/api/me/scores?type=${type}`)
}

export function searchPlayers(
  query: string,
  signal?: AbortSignal,
): Promise<Player[]> {
  return request(`/api/users/search?q=${encodeURIComponent(query)}`, { signal })
}

export function fetchPlayerScores(
  playerId: number,
  type: ScoreListType,
): Promise<ScoreSummary[]> {
  return request(`/api/users/${playerId}/scores?type=${type}`)
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', { method: 'POST' })
  if (!response.ok) {
    throw new ApiError('Logout failed.', response.status, null)
  }
}

export function proxiedImage(url: string): string {
  return `/api/images?url=${encodeURIComponent(url)}`
}
