import type { Grade } from './types.ts'

export interface Formatters {
  integer: (value: number) => string
  accuracy: (accuracy: number) => string
  stars: (stars: number) => string
  date: (iso: string) => string
  length: (seconds: number) => string
}

const cache = new Map<string, Formatters>()

export function getFormatters(locale: string): Formatters {
  const cached = cache.get(locale)
  if (cached) return cached

  const integer = new Intl.NumberFormat(locale)
  const decimals = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const formatters: Formatters = {
    integer: (value) => integer.format(Math.round(value)),
    accuracy: (accuracy) => `${decimals.format(accuracy * 100)}%`,
    stars: (stars) => decimals.format(stars),
    date: (iso) => dateTime.format(new Date(iso)),
    length: formatLength,
  }
  cache.set(locale, formatters)
  return formatters
}

export function formatLength(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export const GRADE_LABEL: Record<Grade, string> = {
  XH: 'SS',
  X: 'SS',
  SH: 'S',
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
}
