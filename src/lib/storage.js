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
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const STORAGE_KEY = KEY
