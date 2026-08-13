const PASSWORD_SALT = 'matchear-v1'
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const SLOT_RE = /^([01]\d|2[0-3]):00$/

export function sanitizeReturnTo(path) {
  if (!path || typeof path !== 'string') return '/canchas'
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return '/canchas'
  if (path.length > 200) return '/canchas'
  if (/[<>"']/.test(path)) return '/canchas'
  return path
}

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .slice(0, 254)
}

export function validateEmail(email) {
  const clean = normalizeEmail(email)
  return EMAIL_RE.test(clean) ? clean : null
}

export function sanitizeName(name) {
  return String(name || '')
    .trim()
    .replace(/[<>"'`\\]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}

export function validateWhatsapp(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return null
  return digits
}

/** Login: mínimo 6 (compatibilidad cuentas demo existentes) */
export function validatePassword(password) {
  const value = String(password || '')
  if (value.length < 6 || value.length > 128) return null
  return value
}

/**
 * Registro: más estricta — 8+ caracteres, al menos una letra y un número.
 * @returns {{ ok: true, password: string } | { ok: false, error: string }}
 */
export function validatePasswordStrength(password) {
  const value = String(password || '')
  if (value.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (value.length > 128) return { ok: false, error: 'Contraseña demasiado larga.' }
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value)) {
    return { ok: false, error: 'La contraseña debe incluir al menos una letra.' }
  }
  if (!/\d/.test(value)) {
    return { ok: false, error: 'La contraseña debe incluir al menos un número.' }
  }
  if (/\s/.test(value)) {
    return { ok: false, error: 'La contraseña no puede tener espacios.' }
  }
  return { ok: true, password: value }
}

export function validateBookingDate(date) {
  if (!ISO_DAY_RE.test(String(date || ''))) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T12:00:00`)
  if (Number.isNaN(target.getTime())) return null
  const diffDays = Math.round((target - today) / (24 * 60 * 60 * 1000))
  if (diffDays < 0 || diffDays > 6) return null
  return date
}

export function validateBookingSlot(slot) {
  const value = String(slot || '')
  if (!SLOT_RE.test(value)) return null
  const hour = Number(value.slice(0, 2))
  if (hour < 9 || hour > 21) return null
  return value
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(`${PASSWORD_SALT}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password, user) {
  if (!user) return false
  if (user.passwordHash) {
    const hash = await hashPassword(password)
    return timingSafeEqual(hash, user.passwordHash)
  }
  if (typeof user.password === 'string') {
    return timingSafeEqual(password, user.password)
  }
  return false
}

function timingSafeEqual(a, b) {
  const left = String(a)
  const right = String(b)
  const len = Math.max(left.length, right.length)
  let mismatch = left.length === right.length ? 0 : 1
  for (let i = 0; i < len; i += 1) {
    mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0)
  }
  return mismatch === 0
}

export function createSessionToken() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function isSessionValid(session) {
  if (!session?.userId || !session.createdAt || !session.token) return false
  if (typeof session.token !== 'string' || session.token.length < 32) return false
  return Date.now() - session.createdAt < SESSION_MAX_AGE_MS
}

export function sanitizePublicUser(user) {
  if (!user) return null
  const { password, passwordHash, ...safe } = user
  return safe
}

export async function hashUserPasswordFields(user) {
  if (!user?.password || user.passwordHash) return user
  const passwordHash = await hashPassword(user.password)
  const { password, ...rest } = user
  return { ...rest, passwordHash }
}

/** Pequeña demora fija ante fallos de login (anti fuerza bruta) */
export function authDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
