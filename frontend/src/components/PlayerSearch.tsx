import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ApiError, searchPlayers } from '../api.ts'
import { flagUrl } from '../format.ts'
import { useI18n } from '../i18n/index.ts'
import type { Player } from '../types.ts'

interface Props {
  onPick: (player: Player) => void
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

type Results =
  | { state: 'idle' }
  | { state: 'loading'; query: string }
  | { state: 'done'; query: string; players: Player[] }
  | { state: 'error'; query: string }

/** Topbar search: type a username, pick a player from the suggestions. */
export function PlayerSearch({ onPick }: Props) {
  const { t } = useI18n()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results>({ state: 'idle' })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const trimmed = query.trim()
  const searchable = trimmed.length >= MIN_QUERY_LENGTH

  useEffect(() => {
    if (!searchable) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setResults({ state: 'loading', query: trimmed })
      searchPlayers(trimmed, controller.signal)
        .then((players) => {
          setResults({ state: 'done', query: trimmed, players })
          setActive(0)
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          if (err instanceof ApiError && err.code === 'QUERY_TOO_SHORT') {
            setResults({ state: 'idle' })
            return
          }
          setResults({ state: 'error', query: trimmed })
        })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, searchable])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Results from an older query are stale while the debounce timer is pending.
  const current = searchable && results.state !== 'idle' && results.query === trimmed
    ? results
    : null
  const players = current?.state === 'done' ? current.players : []
  const expanded = open && searchable
  const pending = searchable && (!current || current.state === 'loading')

  const pick = (player: Player) => {
    onPick(player)
    setQuery('')
    setResults({ state: 'idle' })
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!expanded || players.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % players.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + players.length) % players.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      pick(players[active])
    }
  }

  return (
    <div className="search search--player" ref={rootRef}>
      <SearchIcon />
      <input
        role="combobox"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={t.topbar.playerSearch}
        aria-label={t.topbar.playerSearch}
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          expanded && players.length > 0 ? `${listId}-${players[active]?.id}` : undefined
        }
        autoComplete="off"
        spellCheck={false}
      />
      {pending && <span className="spinner search__spinner" />}

      {expanded && (
        <div className="suggest" id={listId} role="listbox">
          {current?.state === 'error' && (
            <p className="suggest__status">{t.topbar.searchFailed}</p>
          )}
          {current?.state === 'done' && players.length === 0 && (
            <p className="suggest__status">{t.topbar.noResults}</p>
          )}
          {pending && (
            <p className="suggest__status">{t.topbar.searching}</p>
          )}
          {players.map((player, index) => (
            <button
              key={player.id}
              id={`${listId}-${player.id}`}
              type="button"
              role="option"
              aria-selected={index === active}
              className={`suggest__item${index === active ? ' suggest__item--active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(player)}
            >
              <img
                className="suggest__avatar"
                src={player.avatarUrl}
                alt=""
                width={32}
                height={32}
                loading="lazy"
              />
              <span className="suggest__name">{player.username}</span>
              <img
                className="suggest__country"
                src={flagUrl(player.countryCode)}
                alt={player.countryCode}
                title={player.countryCode}
                width={24}
                height={16}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
