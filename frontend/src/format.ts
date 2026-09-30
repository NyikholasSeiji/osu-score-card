import type { Grade } from './types.ts'

const integer = new Intl.NumberFormat('pt-BR')
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export const formatInteger = (value: number) => integer.format(Math.round(value))

export const formatAccuracy = (accuracy: number) =>
  `${(accuracy * 100).toFixed(2).replace('.', ',')}%`

export const formatStars = (stars: number) => stars.toFixed(2).replace('.', ',')

export const formatDate = (iso: string) => dateTime.format(new Date(iso))

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
