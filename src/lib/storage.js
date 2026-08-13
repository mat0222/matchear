const KEY = 'matchear:v1'

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? safeParse(raw, null) : null
  } catch {
    return null
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // quota exceeded or private mode
  }
}

export function updateStore(mutator) {
  const current = loadStore()
  const next = mutator(current)
  if (next) saveStore(next)
  return next
}

export function uid(prefix = 'id') {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}_${rand}_${Date.now().toString(16)}`
}

export const STORAGE_KEY = KEY
