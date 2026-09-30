import { createContext, useContext } from 'react'
import { en, type Messages } from './en.ts'
import { ptBR } from './pt-BR.ts'

export type Language = 'en' | 'pt-BR'

export const LANGUAGES: Record<Language, Messages> = {
  en,
  'pt-BR': ptBR,
}

export const DEFAULT_LANGUAGE: Language = 'en'
export const LANGUAGE_STORAGE_KEY = 'osu-score-card:lang'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in LANGUAGES
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isLanguage(stored)) return stored
  const preferred = navigator.languages.find((tag) =>
    tag.toLowerCase().startsWith('pt'),
  )
  return preferred ? 'pt-BR' : DEFAULT_LANGUAGE
}

/** Replaces `{name}` placeholders with the given values. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

export function plural(
  forms: { one: string; other: string },
  count: number,
): string {
  return interpolate(count === 1 ? forms.one : forms.other, { count })
}

export type ErrorKey = keyof Messages['errors']

/** A user-facing error that is only turned into text at render time. */
export type UiError =
  | { key: ErrorKey; values?: Record<string, string | number> }
  | { text: string }

export function isErrorKey(value: unknown): value is ErrorKey {
  return typeof value === 'string' && value in en.errors
}

export function translateError(t: Messages, error: UiError): string {
  return 'text' in error
    ? error.text
    : interpolate(t.errors[error.key], error.values ?? {})
}

export interface I18n {
  lang: Language
  setLang: (lang: Language) => void
  t: Messages
}

export const I18nContext = createContext<I18n>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  t: LANGUAGES[DEFAULT_LANGUAGE],
})

export function useI18n(): I18n {
  return useContext(I18nContext)
}
