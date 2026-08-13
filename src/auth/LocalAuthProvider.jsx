import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'
import { buildSeedStore, buildSeedUsers } from '../lib/seed.js'
import {
  authDelay,
  createSessionToken,
  hashPassword,
  hashUserPasswordFields,
  isSessionValid,
  sanitizeName,
  sanitizePublicUser,
  validateBookingDate,
  validateBookingSlot,
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateWhatsapp,
  verifyPassword,
} from '../lib/security.js'
import { checkRateLimit, clearAttempts, formatRetryMessage, recordAttempt } from '../lib/rateLimit.js'
import { STORAGE_KEY, loadStore, saveStore, uid, updateStore } from '../lib/storage.js'

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

export function LocalAuthProvider({ children }) {
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
      isAdmin: user?.role === 'admin',
      settings: store.settings ?? { depositAmount: 5000, depositHoldMinutes: 15 },
      backend: 'local',
      adminBookings: [],

      async login(email, password) {
        const limit = checkRateLimit('login', { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 })
        if (!limit.ok) {
          return { ok: false, error: 'RATE_LIMITED', message: formatRetryMessage(limit.retryAfterSec) }
        }

        const cleanEmail = validateEmail(email)
        const cleanPassword = validatePassword(password)
        if (!cleanEmail || !cleanPassword) {
          recordAttempt('login')
          await authDelay()
          return { ok: false, error: 'INVALID_CREDENTIALS' }
        }

        const s = loadStore() ?? ensureStore()
        const found = s.users.find((u) => u.email === cleanEmail)
        if (!found) {
          recordAttempt('login')
          await authDelay()
          return { ok: false, error: 'INVALID_CREDENTIALS' }
        }

        const valid = await verifyPassword(cleanPassword, found)
        if (!valid) {
          recordAttempt('login')
          await authDelay()
          return { ok: false, error: 'INVALID_CREDENTIALS' }
        }

        clearAttempts('login')
        const userRecord =
          found.password && !found.passwordHash ? await hashUserPasswordFields(found) : found

        const next = updateStore((cur) => {
          const st = cur ?? ensureStore()
          const users = st.users.map((u) => (u.id === userRecord.id ? userRecord : u))
          return {
            ...st,
            users,
            session: {
              userId: userRecord.id,
              createdAt: Date.now(),
              token: createSessionToken(),
            },
          }
        })
        setStore(next)
        const nextUser = next?.session
          ? sanitizePublicUser(next.users.find((u) => u.id === next.session.userId))
          : null
        return { ok: Boolean(nextUser), user: nextUser }
      },

      async register({ name, email, password }) {
        const limit = checkRateLimit('register', { maxAttempts: 3, windowMs: 60 * 60 * 1000, lockMs: 60 * 60 * 1000 })
        if (!limit.ok) {
          return { ok: false, error: 'RATE_LIMITED', message: formatRetryMessage(limit.retryAfterSec) }
        }

        const cleanEmail = validateEmail(email)
        const strength = validatePasswordStrength(password)
        const cleanName = sanitizeName(name)
        if (!cleanEmail || !strength.ok || !cleanName) {
          recordAttempt('register')
          return {
            ok: false,
            error: strength.ok ? 'INVALID_INPUT' : 'WEAK_PASSWORD',
            message: strength.ok ? 'Revisá los datos ingresados.' : strength.error,
          }
        }

        const passwordHash = await hashPassword(strength.password)
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
            session: {
              userId,
              createdAt: Date.now(),
              token: createSessionToken(),
            },
          }
        })
        setStore(next)
        if (!created) {
          recordAttempt('register')
          return { ok: false, error: 'EMAIL_EXISTS', message: 'Ese email ya está registrado.' }
        }
        clearAttempts('register')
        const nextUser = next?.session
          ? sanitizePublicUser(next.users.find((u) => u.id === next.session.userId))
          : null
        return { ok: Boolean(nextUser), user: nextUser }
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

      createBookingAndPayment({ pitchId, slot, date, paymentMethod, whatsapp }) {
        if (!user) return { ok: false, error: 'NO_AUTH' }
        if (!isSessionValid(store.session) || store.session.userId !== user.id) {
          return { ok: false, error: 'NO_AUTH' }
        }

        const bookLimit = checkRateLimit(`book:${user.id}`, {
          maxAttempts: 8,
          windowMs: 60 * 60 * 1000,
          lockMs: 30 * 60 * 1000,
        })
        if (!bookLimit.ok) {
          return { ok: false, error: 'RATE_LIMITED', message: formatRetryMessage(bookLimit.retryAfterSec) }
        }

        if (!pitchId || typeof pitchId !== 'string' || pitchId.length > 64) {
          return { ok: false, error: 'NO_PITCH' }
        }
        const pitch = store.pitches.find((p) => p.id === pitchId)
        if (!pitch) return { ok: false, error: 'NO_PITCH' }

        const method = paymentMethod?.method || paymentMethod
        const mode = paymentMethod?.mode === 'full' ? 'full' : 'deposit'
        if (!ALLOWED_PAYMENT_METHODS.has(method)) return { ok: false, error: 'INVALID_METHOD' }
        const cleanWhatsapp = validateWhatsapp(whatsapp)
        if (!cleanWhatsapp) return { ok: false, error: 'INVALID_WHATSAPP' }

        const day = validateBookingDate(date)
        const cleanSlot = validateBookingSlot(slot)
        if (!day || !cleanSlot) return { ok: false, error: 'INVALID_SLOT' }

        const activeBookingsToday = store.bookings.filter(
          (b) => b.userId === user.id && b.date === day && b.status !== 'cancelled',
        ).length
        if (activeBookingsToday >= 3) {
          return { ok: false, error: 'DAILY_LIMIT', message: 'Máximo 3 reservas por día.' }
        }

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
          if (!isSessionValid(s.session) || s.session.userId !== user.id) return s

          const isTaken = s.bookings.some(
            (b) =>
              b.pitchId === pitchId &&
              b.date === day &&
              b.slot === cleanSlot &&
              b.status !== 'cancelled',
          )
          const isBlocked = (s.blocks || []).some(
            (bl) => bl.pitchId === pitchId && bl.date === day && bl.slot === cleanSlot,
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
                slot: cleanSlot,
                whatsapp: cleanWhatsapp,
                paymentMethod: method,
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
        recordAttempt(`book:${user.id}`)
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

      cancelBooking({ bookingId }) {
        if (!user) return { ok: false, error: 'NO_AUTH' }
        let success = false
        let cancelledBooking = null

        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const booking = s.bookings.find((b) => b.id === bookingId)
          if (!booking || booking.userId !== user.id || booking.status === 'cancelled') return s

          success = true
          cancelledBooking = { ...booking, status: 'cancelled', cancelledAt: Date.now() }
          return {
            ...s,
            bookings: s.bookings.map((b) => (b.id === bookingId ? cancelledBooking : b)),
            payments: s.payments.map((p) => {
              if (p.bookingId !== bookingId) return p
              if (p.status === 'pending') return { ...p, status: 'cancelled' }
              if (p.status === 'paid') return { ...p, status: 'refund_pending' }
              return p
            }),
          }
        })
        setStore(next)
        return { ok: success, booking: cancelledBooking }
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

      listAdminBookings() {
        if (user?.role !== 'admin') return []
        const paymentsByBooking = store.payments.reduce((acc, p) => {
          acc[p.bookingId] = acc[p.bookingId] || []
          acc[p.bookingId].push(p)
          return acc
        }, {})
        return store.bookings.map((b) => ({
          ...b,
          pitch: store.pitches.find((p) => p.id === b.pitchId) || null,
          payments: paymentsByBooking[b.id] || [],
        }))
      },

      async adminConfirm({ bookingId }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          return {
            ...s,
            bookings: s.bookings.map((b) =>
              b.id === bookingId ? { ...b, status: 'confirmed' } : b,
            ),
            payments: s.payments.map((p) =>
              p.bookingId === bookingId && p.status === 'pending'
                ? { ...p, status: 'paid', paidAt: Date.now() }
                : p,
            ),
          }
        })
        setStore(next)
        return { ok: true }
      },

      async adminCancel({ bookingId }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        let success = false
        let cancelledBooking = null
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const booking = s.bookings.find((b) => b.id === bookingId)
          if (!booking || booking.status === 'cancelled') return s
          success = true
          cancelledBooking = { ...booking, status: 'cancelled', cancelledAt: Date.now() }
          return {
            ...s,
            bookings: s.bookings.map((b) => (b.id === bookingId ? cancelledBooking : b)),
            payments: s.payments.map((p) => {
              if (p.bookingId !== bookingId) return p
              if (p.status === 'pending') return { ...p, status: 'cancelled' }
              if (p.status === 'paid') return { ...p, status: 'refund_pending' }
              return p
            }),
          }
        })
        setStore(next)
        return { ok: success, booking: cancelledBooking }
      },

      async adminBlockSlot({ pitchId, date, slot, reason = '' }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const blocks = s.blocks || []
          if (blocks.some((b) => b.pitchId === pitchId && b.date === date && b.slot === slot)) return s
          return {
            ...s,
            blocks: [...blocks, { id: uid('block'), pitchId, date, slot, reason, createdAt: Date.now() }],
          }
        })
        setStore(next)
        return { ok: true }
      },

      async adminUnblockSlot({ pitchId, date, slot }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          return {
            ...s,
            blocks: (s.blocks || []).filter(
              (b) => !(b.pitchId === pitchId && b.date === date && b.slot === slot),
            ),
          }
        })
        setStore(next)
        return { ok: true }
      },

      watchAvailability() {
        return () => {}
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
