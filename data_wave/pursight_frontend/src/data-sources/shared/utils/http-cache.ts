// Lightweight GET cache with in-memory + sessionStorage persistence and TTL
// Safe for idempotent GET requests only. Do not use for POST/PUT/PATCH/DELETE.

type CacheEntry = {
  expiry: number
  data: any
}

const memoryCache: Map<string, CacheEntry> = new Map()

const storageKey = (key: string) => `httpcache:${key}`

const now = () => Date.now()

function readStorage(key: string): CacheEntry | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.sessionStorage.getItem(storageKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.expiry !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function writeStorage(key: string, entry: CacheEntry) {
  try {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(storageKey(key), JSON.stringify(entry))
  } catch {}
}

export async function cachedGet(url: string, opts?: { ttlMs?: number; headers?: Record<string, string> }): Promise<any> {
  const ttlMs = opts?.ttlMs ?? 60_000 // default 60s
  const key = url

  // Memory cache first
  const mem = memoryCache.get(key)
  if (mem && mem.expiry > now()) {
    return mem.data
  }

  // Session storage next
  const stored = readStorage(key)
  if (stored && stored.expiry > now()) {
    // re-hydrate memory
    memoryCache.set(key, stored)
    return stored.data
  }

  // Fetch fresh
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.headers || {})
    }
  })
  if (!res.ok) {
    // On failure, attempt to return stale if available
    if (stored) return stored.data
    if (mem) return mem.data
    throw new Error(`GET ${url} failed: ${res.status}`)
  }
  const data = await res.json()
  const entry: CacheEntry = { expiry: now() + ttlMs, data }
  memoryCache.set(key, entry)
  writeStorage(key, entry)
  return data
}

export function invalidateGet(url: string) {
  memoryCache.delete(url)
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(storageKey(url))
  } catch {}
}


