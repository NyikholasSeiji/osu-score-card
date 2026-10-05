import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MODS } from './mods.ts'
import type { Grade } from './types.ts'

/**
 * Rank and mod sprites pulled out of an osu! skin. Keys are `rank:<grade>`
 * and `mod:<acronym>`; anything the skin lacks is simply absent and the card
 * falls back to its built-in icons.
 */
export type SkinAssets = Record<string, Blob>

export interface StoredSkin {
  name: string
  assets: SkinAssets
}

/** A skin ready to render: the same assets, as object URLs. */
export interface Skin {
  name: string
  urls: Record<string, string>
}

export const SkinContext = createContext<Skin | null>(null)

export function useSkin(): Skin | null {
  return useContext(SkinContext)
}

export function rankAsset(skin: Skin | null, grade: Grade): string | undefined {
  return skin?.urls[`rank:${grade}`]
}

export function modAsset(skin: Skin | null, acronym: string): string | undefined {
  return skin?.urls[`mod:${acronym.toUpperCase()}`]
}

export function toSkin(stored: StoredSkin): Skin {
  const urls: Record<string, string> = {}
  for (const [key, blob] of Object.entries(stored.assets)) {
    urls[key] = URL.createObjectURL(blob)
  }
  return { name: stored.name, urls }
}

export function releaseSkin(skin: Skin | null): void {
  if (!skin) return
  for (const url of Object.values(skin.urls)) URL.revokeObjectURL(url)
}

/**
 * The skin currently in use: restored from IndexedDB on mount, swapped by
 * `importFile`, dropped by `remove`. Object URLs of the previous skin are
 * revoked whenever it is replaced.
 */
export function useSkinStore() {
  const [skin, setSkin] = useState<Skin | null>(null)
  const [busy, setBusy] = useState(false)
  const current = useRef<Skin | null>(null)

  const replace = useCallback((next: Skin | null) => {
    releaseSkin(current.current)
    current.current = next
    setSkin(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadStoredSkin().then((stored) => {
      if (!cancelled && stored) replace(toSkin(stored))
    })
    return () => {
      cancelled = true
    }
  }, [replace])

  const importFile = useCallback(
    async (file: File) => {
      setBusy(true)
      try {
        const stored = await importSkin(file)
        replace(toSkin(stored))
        await saveStoredSkin(stored)
      } finally {
        setBusy(false)
      }
    },
    [replace],
  )

  const remove = useCallback(async () => {
    replace(null)
    await clearStoredSkin()
  }, [replace])

  return { skin, busy, importFile, remove }
}

export type SkinErrorCode = 'SKIN_UNSUPPORTED' | 'SKIN_INVALID' | 'SKIN_EMPTY'

export class SkinError extends Error {
  readonly code: SkinErrorCode

  constructor(code: SkinErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

// ---------- Which files we want ----------

const RANK_FILES: Record<string, Grade> = {
  'ranking-xh': 'XH',
  'ranking-x': 'X',
  'ranking-sh': 'SH',
  'ranking-s': 'S',
  'ranking-a': 'A',
  'ranking-b': 'B',
  'ranking-c': 'C',
  'ranking-d': 'D',
}

const MOD_FILES: Record<string, string> = Object.fromEntries(
  Object.entries(MODS)
    .filter(([, mod]) => mod.skinFile)
    .map(([acronym, mod]) => [`selection-mod-${mod.skinFile}`, acronym]),
)

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

interface Wanted {
  key: string
  type: string
  /** Higher wins when a skin ships several candidates (`@2x`, nested folders). */
  score: number
}

/** Maps a path inside the archive to the asset it would provide, if any. */
export function classifyAsset(path: string): Wanted | null {
  const parts = path.split('/')
  const name = parts[parts.length - 1].toLowerCase()
  const match = /^(.+?)(@2x)?\.([a-z0-9]+)$/.exec(name)
  if (!match) return null
  const [, base, hd, ext] = match
  const type = IMAGE_TYPES[ext]
  if (!type) return null
  const rank = RANK_FILES[base]
  const mod = MOD_FILES[base]
  const key = rank ? `rank:${rank}` : mod ? `mod:${mod}` : null
  if (!key) return null
  return { key, type, score: (hd ? 10 : 0) - parts.length }
}

// ---------- Minimal ZIP reader (.osk is a plain zip) ----------

interface ZipEntry {
  name: string
  method: number
  compressedSize: number
  localOffset: number
}

const EOCD_SIG = 0x06054b50
const CEN_SIG = 0x02014b50
const LOC_SIG = 0x04034b50
const ZIP64_LOCATOR_SIG = 0x07064b50
const ZIP64_EOCD_SIG = 0x06064b50

async function readCentralDirectory(file: Blob): Promise<ZipEntry[]> {
  const tailSize = Math.min(file.size, 65_557 + 20)
  const tail = new DataView(await file.slice(file.size - tailSize).arrayBuffer())
  let eocd = -1
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tail.getUint32(i, true) === EOCD_SIG) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new SkinError('SKIN_INVALID', 'Not a zip archive')

  let count = tail.getUint16(eocd + 10, true)
  let size = tail.getUint32(eocd + 12, true)
  let offset = tail.getUint32(eocd + 16, true)

  if (
    (count === 0xffff || size === 0xffffffff || offset === 0xffffffff) &&
    eocd >= 20 &&
    tail.getUint32(eocd - 20, true) === ZIP64_LOCATOR_SIG
  ) {
    const zip64Offset = Number(tail.getBigUint64(eocd - 12, true))
    const z = new DataView(
      await file.slice(zip64Offset, zip64Offset + 56).arrayBuffer(),
    )
    if (z.getUint32(0, true) !== ZIP64_EOCD_SIG) {
      throw new SkinError('SKIN_INVALID', 'Bad zip64 directory')
    }
    count = Number(z.getBigUint64(32, true))
    size = Number(z.getBigUint64(40, true))
    offset = Number(z.getBigUint64(48, true))
  }

  const dir = new DataView(await file.slice(offset, offset + size).arrayBuffer())
  const bytes = new Uint8Array(dir.buffer)
  const utf8 = new TextDecoder()
  const entries: ZipEntry[] = []
  let p = 0
  for (let i = 0; i < count && p + 46 <= dir.byteLength; i++) {
    if (dir.getUint32(p, true) !== CEN_SIG) break
    const method = dir.getUint16(p + 10, true)
    const compressedSize = dir.getUint32(p + 20, true)
    const nameLength = dir.getUint16(p + 28, true)
    const extraLength = dir.getUint16(p + 30, true)
    const commentLength = dir.getUint16(p + 32, true)
    const localOffset = dir.getUint32(p + 42, true)
    const name = utf8.decode(bytes.subarray(p + 46, p + 46 + nameLength))
    entries.push({ name, method, compressedSize, localOffset })
    p += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

async function readEntry(file: Blob, entry: ZipEntry, type: string): Promise<Blob> {
  const header = new DataView(
    await file.slice(entry.localOffset, entry.localOffset + 30).arrayBuffer(),
  )
  if (header.getUint32(0, true) !== LOC_SIG) {
    throw new SkinError('SKIN_INVALID', `Bad local header for ${entry.name}`)
  }
  const start =
    entry.localOffset + 30 + header.getUint16(26, true) + header.getUint16(28, true)
  const raw = file.slice(start, start + entry.compressedSize)
  if (entry.method === 0) return new Blob([raw], { type })
  if (entry.method !== 8) {
    throw new SkinError('SKIN_UNSUPPORTED', `Unsupported compression ${entry.method}`)
  }
  const stream = raw.stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Blob([await new Response(stream).arrayBuffer()], { type })
}

/**
 * Pulls only the rank/mod sprites out of a `.osk` (or any zip of a skin
 * folder). Reads the central directory and just the entries it needs, so even
 * big skins never have to be loaded whole into memory.
 */
export async function importSkin(file: File): Promise<StoredSkin> {
  if (typeof DecompressionStream === 'undefined') {
    throw new SkinError('SKIN_UNSUPPORTED', 'DecompressionStream is not available')
  }
  const entries = await readCentralDirectory(file)
  const picked = new Map<string, { entry: ZipEntry; wanted: Wanted }>()
  for (const entry of entries) {
    const wanted = classifyAsset(entry.name)
    if (!wanted || entry.compressedSize === 0) continue
    const current = picked.get(wanted.key)
    if (!current || wanted.score > current.wanted.score) {
      picked.set(wanted.key, { entry, wanted })
    }
  }
  if (picked.size === 0) throw new SkinError('SKIN_EMPTY', 'No rank or mod sprites')

  const assets: SkinAssets = {}
  await Promise.all(
    [...picked.values()].map(async ({ entry, wanted }) => {
      assets[wanted.key] = await readEntry(file, entry, wanted.type)
    }),
  )
  return { name: file.name.replace(/\.(osk|zip)$/i, ''), assets }
}

// ---------- Persistence (IndexedDB keeps the blobs between visits) ----------

const DB_NAME = 'osu-score-card'
const STORE = 'skin'
const KEY = 'current'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function run<T>(
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const request = op(tx.objectStore(STORE))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
      }),
  )
}

export async function loadStoredSkin(): Promise<StoredSkin | null> {
  if (typeof indexedDB === 'undefined') return null
  try {
    const stored = await run<StoredSkin | undefined>('readonly', (s) => s.get(KEY))
    return stored ?? null
  } catch {
    return null
  }
}

export async function saveStoredSkin(skin: StoredSkin): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    await run('readwrite', (s) => s.put(skin, KEY))
  } catch {
    // Private mode or a full quota: the skin still works for this visit.
  }
}

export async function clearStoredSkin(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    await run('readwrite', (s) => s.delete(KEY))
  } catch {
    // Nothing to clear.
  }
}
