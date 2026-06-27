import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeedStore, buildSeedUsers } from '../lib/seed.js'
import {
  hashPassword,
  hashUserPasswordFields,
  isSessionValid,
  normalizeEmail,
  sanitizeName,
  sanitizePublicUser,
  validateEmail,
  validatePassword,
  verifyPassword,
} from '../lib/security.js'
import { STORAGE_KEY, loadStore, saveStore, uid, updateStore } from '../lib/storage.js'

const AuthContext = createContext(null)
const ALLOWED_PAYMENT_METHODS = new Set(['cash', 'card', 'transfer'])
const PITCH_PHOTO =
  'https://images.unsplash.com/photo-1459865269847-f9fc3a4cb5fc?auto=format&fit=crop&w=800&q=80'

function ensureStore() {
  const existing = loadStore()
  if (existing && existing.version === 1) {
    let changed = false
    const next = { ...existing }

    if (!Array.isArray(next.blocks)) {
      next.blocks = []
      changed = true
    }
    if (!next.settings || typeof next.settings !== 'object') {
      next.settings = { slotMinutes: 60, depositAmount: 5000, depositHoldMinutes: 15 }
      changed = true
    }
    if (!isSessionValid(next.session)) {
      next.session = null
      changed = true
    }
    if (Array.isArray(next.pitches)) {
      const migrated = next.pitches.map((p) => ({
        ...p,
        sport: p.sport || 'futbol',
        surface: p.surface || 'sintetico',
        roof: p.roof || 'descubierta',
        photos:
          Array.isArray(p.photos) && p.photos.length > 0 && !p.photos.includes('/hero.jpg')
            ? p.photos
            : [PITCH_PHOTO],
      }))
      if (JSON.stringify(migrated) !== JSON.stringify(next.pitches)) {
        next.pitches = migrated
        changed = true
      }
    }
    if (changed) saveStore(next)
    return next
  }

  const seeded = buildSeedStore()
  seeded.users = buildSeedUsers()
  saveStore(seeded)
  return seeded
}

function findOrCreateGoogleUser(s, { email, name, sub }) {
  const cleanEmail = normalizeEmail(email)
  const existing =
    s.users.find((u) => u.googleId === sub) ||
    s.users.find((u) => u.email.toLowerCase() === cleanEmail)

  if (existing) {
    return {
      ...existing,
      googleId: sub,
      provider: 'google',
      name: sanitizeName(name || existing.name),
    }
  }

  return {
    id: uid('user'),
    role: 'user',
    email: cleanEmail,
    name: sanitizeName(name) || 'Usuario Google',
    googleId: sub,
    provider: 'google',
    createdAt: Date.now(),
  }
}

function applyGoogleLogin(s, profile) {
  const googleUser = findOrCreateGoogleUser(s, profile)
  const users = s.users.some((u) => u.id === googleUser.id)
    ? s.users.map((u) => (u.id === googleUser.id ? googleUser : u))
    : [googleUser, ...s.users]
  return {
    store: {
      ...s,
      users,
      session: { userId: googleUser.id, createdAt: Date.now() },
    },
    user: googleUser,
  }
}

async function migrateStoredPasswords(storeData) {
  let changed = false
  const users = await Promise.all(
    storeData.users.map(async (user) => {
      if (!user.password || user.passwordHash) return user
      changed = true
      return hashUserPasswordFields(user)
    }),
  )
  return changed ? { ...storeData, users } : storeData
}

export function AuthProvider({ children }) {
  const [store, setStore] = useState(() => ensureStore())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const current = loadStore() ?? ensureStore()
    migrateStoredPasswords(current).then((next) => {
      if (cancelled) return
      if (next !== current) saveStore(next)
      setStore(next)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const next = updateStore((cur) => {
        const s = cur ?? ensureStore()
        let changed = false

        if (!isSessionValid(s.session)) {
          changed = true
          s.session = null
        }

        const nextPayments = s.payments.map((p) => {
          if (p.status !== 'pending' || !p.expiresAt || p.expiresAt > now) return p
          changed = true
          return { ...p, status: 'expired' }
        })

        const nextBookings = s.bookings.map((b) => {
          if (b.status !== 'pending_payment' || !b.expiresAt || b.expiresAt > now) return b
          changed = true
          return { ...b, status: 'cancelled', cancelledAt: now }
        })

        if (!changed) return s
        return { ...s, payments: nextPayments, bookings: nextBookings, session: s.session }
      })
      if (next) setStore(next)
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && e.key !== STORAGE_KEY) return
      const next = loadStore()
      if (next) setStore(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const rawUser = store.session
    ? store.users.find((u) => u.id === store.session.userId) || null
    : null
  const user = sanitizePublicUser(rawUser)

  const api = useMemo(() => {
    return {
      ready,
      user,
      role: user?.role ?? null,
      isAuthed: Boolean(user),
      settings: store.settings ?? { depositAmount: 5000, depositHoldMinutes: 15 },

      async login(email, password) {
        const cleanEmail = validateEmail(email)
        const cleanPassword = validatePassword(password)
        if (!cleanEmail || !cleanPassword) return { ok: false }

        const s = loadStore() ?? ensureStore()
        const found = s.users.find((u) => u.email === cleanEmail)
        if (!found || found.provider === 'google') return { ok: false }

        const valid = await verifyPassword(cleanPassword, found)
        if (!valid) return { ok: false }

        const userRecord =
          found.password && !found.passwordHash ? await hashUserPasswordFields(found) : found

        const next = updateStore((cur) => {
          const st = cur ?? ensureStore()
          const users = st.users.map((u) => (u.id === userRecord.id ? userRecord : u))
          return {
            ...st,
            users,
            session: { userId: userRecord.id, createdAt: Date.now() },
          }
        })
        setStore(next)
        const nextUser = next?.session
          ? sanitizePublicUser(next.users.find((u) => u.id === next.session.userId))
          : null
        return { ok: Boolean(nextUser), user: nextUser }
      },

      async register({ name, email, password }) {
        const cleanEmail = validateEmail(email)
        const cleanPassword = validatePassword(password)
        const cleanName = sanitizeName(name)
        if (!cleanEmail || !cleanPassword || !cleanName) return { ok: false }

        const passwordHash = await hashPassword(cleanPassword)
        let created = false

        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          if (s.users.some((u) => u.email === cleanEmail)) return s
          const userId = uid('user')
          created = true
          const newUser = {
            id: userId,
            role: 'user',
            email: cleanEmail,
            passwordHash,
            name: cleanName,
            provider: 'email',
            createdAt: Date.now(),
          }
          return {
            ...s,
            users: [newUser, ...s.users],
            session: { userId, createdAt: Date.now() },
          }
        })
        setStore(next)
        const nextUser = created && next?.session
          ? sanitizePublicUser(next.users.find((u) => u.id === next.session.userId))
          : null
        return { ok: created && Boolean(nextUser), user: nextUser }
      },

      loginWithGoogle({ email, name, sub }) {
        if (!email || !sub) return { ok: false }
        let matchedUser = null
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const result = applyGoogleLogin(s, { email, name, sub })
          matchedUser = result.user
          return result.store
        })
        setStore(next)
        return { ok: Boolean(matchedUser), user: sanitizePublicUser(matchedUser) }
      },

      loginWithGoogleDemo() {
        let matchedUser = null
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const result = applyGoogleLogin(s, {
            email: 'demo@gmail.com',
            name: 'Usuario Google',
            sub: 'google_demo_matchear',
          })
          matchedUser = result.user
          return result.store
        })
        setStore(next)
        return { ok: Boolean(matchedUser), user: sanitizePublicUser(matchedUser) }
      },

      logout() {
        const next = updateStore((cur) => ({ ...(cur ?? ensureStore()), session: null }))
        setStore(next)
      },

      listPitches() {
        return store.pitches
      },

      getPitch(id) {
        if (!id || typeof id !== 'string') return null
        return store.pitches.find((p) => p.id === id) || null
      },

      listAvailability({ pitchId, date, slots }) {
        const taken = new Set(
          store.bookings
            .filter((b) => b.pitchId === pitchId && b.date === date && b.status !== 'cancelled')
            .map((b) => b.slot),
        )
        const blocked = new Set(
          (store.blocks || [])
            .filter((bl) => bl.pitchId === pitchId && bl.date === date)
            .map((bl) => bl.slot),
        )
        return slots.map((s) => ({
          slot: s,
          status: blocked.has(s) ? 'blocked' : taken.has(s) ? 'occupied' : 'free',
        }))
      },

      createBookingAndPayment({ pitchId, slot, date, paymentMethod }) {
        if (!user) return { ok: false, error: 'NO_AUTH' }
        const pitch = store.pitches.find((p) => p.id === pitchId)
        if (!pitch) return { ok: false, error: 'NO_PITCH' }

        const method = paymentMethod?.method || paymentMethod
        const mode = paymentMethod?.mode === 'full' ? 'full' : 'deposit'
        if (!ALLOWED_PAYMENT_METHODS.has(method)) return { ok: false, error: 'INVALID_METHOD' }

        const day = date || new Date().toISOString().slice(0, 10)
        const now = Date.now()
        const bookingId = uid('book')
        const paymentId = uid('pay')
        const depositAmount = store.settings?.depositAmount ?? 5000
        const holdMinutes = store.settings?.depositHoldMinutes ?? 15
        const expiresAt = now + holdMinutes * 60 * 1000
        const amount = mode === 'deposit' ? depositAmount : pitch.price

        let success = false
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const isTaken = s.bookings.some(
            (b) =>
              b.pitchId === pitchId &&
              b.date === day &&
              b.slot === slot &&
              b.status !== 'cancelled',
          )
          const isBlocked = (s.blocks || []).some(
            (bl) => bl.pitchId === pitchId && bl.date === day && bl.slot === slot,
          )
          if (isTaken || isBlocked) return s

          success = true
          return {
            ...s,
            bookings: [
              {
                id: bookingId,
                pitchId,
                userId: user.id,
                date: day,
                slot,
                status: mode === 'deposit' ? 'pending_payment' : 'confirmed',
                paymentMode: mode,
                expiresAt: mode === 'deposit' ? expiresAt : null,
                createdAt: now,
              },
              ...s.bookings,
            ],
            payments: [
              {
                id: paymentId,
                bookingId,
                pitchId,
                userId: user.id,
                method,
                mode,
                amount,
                status: mode === 'deposit' ? 'pending' : 'paid',
                expiresAt: mode === 'deposit' ? expiresAt : null,
                createdAt: now,
              },
              ...s.payments,
            ],
          }
        })
        setStore(next)
        if (!success) return { ok: false, error: 'NOT_AVAILABLE' }
        return { ok: true, bookingId, paymentId, expiresAt }
      },

      payDeposit({ paymentId }) {
        if (!user) return { ok: false }
        const now = Date.now()
        let success = false
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const payment = s.payments.find((p) => p.id === paymentId)
          if (!payment || payment.userId !== user.id || payment.status !== 'pending') return s
          if (payment.expiresAt && payment.expiresAt <= now) {
            return {
              ...s,
              payments: s.payments.map((p) =>
                p.id === paymentId ? { ...p, status: 'expired' } : p,
              ),
            }
          }
          success = true
          return {
            ...s,
            payments: s.payments.map((p) =>
              p.id === paymentId ? { ...p, status: 'paid', paidAt: now } : p,
            ),
            bookings: s.bookings.map((b) =>
              b.id === payment.bookingId ? { ...b, status: 'reserved', paidAt: now } : b,
            ),
          }
        })
        setStore(next)
        return { ok: success }
      },

      myBookings() {
        if (!user) return []
        const paymentsByBooking = store.payments.reduce((acc, p) => {
          acc[p.bookingId] = acc[p.bookingId] || []
          acc[p.bookingId].push(p)
          return acc
        }, {})
        return store.bookings
          .filter((b) => b.userId === user.id)
          .map((b) => ({
            ...b,
            pitch: store.pitches.find((p) => p.id === b.pitchId) || null,
            payments: paymentsByBooking[b.id] || [],
          }))
      },
    }
  }, [store, user, ready])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
