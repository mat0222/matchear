const KEY = 'matchear:v1'

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function loadStore() {
  const raw = localStorage.getItem(KEY)
  return raw ? safeParse(raw, null) : null
}

export function saveStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function updateStore(mutator) {
  const current = loadStore()
  const next = mutator(current)
  saveStore(next)
  return next
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}



