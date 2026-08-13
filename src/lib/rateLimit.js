const RATE_KEY = 'matchear:rate-limits'

function readAll() {
  try {
    return JSON.parse(sessionStorage.getItem(RATE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data) {
  try {
    sessionStorage.setItem(RATE_KEY, JSON.stringify(data))
  } catch {
    // private mode / quota
  }
}

/**
 * Rate limit + bloqueo temporal (anti fuerza bruta).
 * @returns {{ ok: true } | { ok: false, retryAfterSec: number, error: string }}
 */
export function checkRateLimit(bucket, { maxAttempts = 5, windowMs = 15 * 60 * 1000, lockMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now()
  const all = readAll()
  const entry = all[bucket] || { attempts: [], lockedUntil: 0 }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000),
      error: 'RATE_LIMITED',
    }
  }

  entry.attempts = (entry.attempts || []).filter((t) => now - t < windowMs)

  if (entry.attempts.length >= maxAttempts) {
    entry.lockedUntil = now + lockMs
    entry.attempts = []
    all[bucket] = entry
    writeAll(all)
    return {
      ok: false,
      retryAfterSec: Math.ceil(lockMs / 1000),
      error: 'RATE_LIMITED',
    }
  }

  return { ok: true, remaining: maxAttempts - entry.attempts.length }
}

export function recordAttempt(bucket) {
  const now = Date.now()
  const all = readAll()
  const entry = all[bucket] || { attempts: [], lockedUntil: 0 }
  entry.attempts = [...(entry.attempts || []), now]
  all[bucket] = entry
  writeAll(all)
}

export function clearAttempts(bucket) {
  const all = readAll()
  delete all[bucket]
  writeAll(all)
}

export function formatRetryMessage(retryAfterSec) {
  const min = Math.max(1, Math.ceil(retryAfterSec / 60))
  return `Demasiados intentos. Probá de nuevo en ${min} min.`
}
