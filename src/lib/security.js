const PASSWORD_SALT = 'matchear-v1'
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function sanitizeReturnTo(path) {
  if (!path || typeof path !== 'string') return '/canchas'
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return '/canchas'
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
    .replace(/[<>]/g, '')
    .slice(0, 80)
}

export function validatePassword(password) {
  const value = String(password || '')
  if (value.length < 6 || value.length > 128) return null
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
    return hash === user.passwordHash
  }
  if (typeof user.password === 'string') {
    return user.password === password
  }
  return false
}

export function isSessionValid(session) {
  if (!session?.userId || !session.createdAt) return false
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
