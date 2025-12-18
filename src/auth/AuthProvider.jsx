import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeedStore } from '../lib/seed.js'
import { loadStore, saveStore, uid, updateStore } from '../lib/storage.js'

const AuthContext = createContext(null)

function ensureStore() {
  const existing = loadStore()
  if (existing && existing.version === 1) {
    // lightweight migrations inside v1
    let changed = false
    const next = { ...existing }
    if (!Array.isArray(next.blocks)) {
      next.blocks = []
      changed = true
    }
    if (!next.settings || typeof next.settings !== 'object') {
      next.settings = { slotMinutes: 60, depositAmount: 5000, depositHoldMinutes: 15 }
      changed = true
    } else {
      if (!next.settings.slotMinutes) {
        next.settings.slotMinutes = 60
        changed = true
      }
      if (typeof next.settings.depositAmount !== 'number') {
        next.settings.depositAmount = 5000
        changed = true
      }
      if (typeof next.settings.depositHoldMinutes !== 'number') {
        next.settings.depositHoldMinutes = 15
        changed = true
      }
    }
    if (Array.isArray(next.pitches)) {
      let pitchesChanged = false
      const migrated = next.pitches.map((p) => {
        const patch = {}
        if (!p.sport) patch.sport = 'futbol'
        if (!p.surface) patch.surface = 'sintetico'
        if (!p.roof) patch.roof = 'descubierta'
        if (!Array.isArray(p.photos) || p.photos.length === 0) patch.photos = ['/hero.jpg']
        if (Object.keys(patch).length > 0) pitchesChanged = true
        return Object.keys(patch).length > 0 ? { ...p, ...patch } : p
      })
      if (pitchesChanged) {
        next.pitches = migrated
        changed = true
      }
    }
    if (changed) saveStore(next)
    return next
  }
  const seeded = buildSeedStore()
  saveStore(seeded)
  return seeded
}

export function AuthProvider({ children }) {
  const [store, setStore] = useState(() => ensureStore())

  // Auto-cancel pending deposit holds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const next = updateStore((cur) => {
        const s = cur ?? ensureStore()
        const payments = Array.isArray(s.payments) ? s.payments : []
        const bookings = Array.isArray(s.bookings) ? s.bookings : []

        let changed = false
        const expiredPaymentIds = new Set()

        const nextPayments = payments.map((p) => {
          if (p.status !== 'pending') return p
          if (!p.expiresAt) return p
          if (p.expiresAt > now) return p
          expiredPaymentIds.add(p.id)
          changed = true
          return { ...p, status: 'expired' }
        })

        const nextBookings = bookings.map((b) => {
          if (b.status !== 'pending_payment') return b
          if (!b.expiresAt) return b
          if (b.expiresAt > now) return b
          // expire booking when hold ends
          changed = true
          return { ...b, status: 'cancelled', cancelledAt: now }
        })

        if (!changed) return s
        return { ...s, payments: nextPayments, bookings: nextBookings }
      })
      setStore(next)
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && e.key !== 'matchear:v1') return
      const next = loadStore()
      if (next) setStore(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const session = store.session
  const user = session
    ? store.users.find((u) => u.id === session.userId) || null
    : null

  const api = useMemo(() => {
    return {
      store,
      user,
      role: user?.role ?? null,
      isAuthed: Boolean(user),
      login(email, password) {
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const found = s.users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
          )
          if (!found || found.password !== password) return s
          return {
            ...s,
            session: { userId: found.id, createdAt: Date.now() },
          }
        })
        setStore(next)
        const nextUser =
          next.session && next.users.find((u) => u.id === next.session.userId)
        return { ok: Boolean(nextUser), user: nextUser || null }
      },
      register({ name, email, password }) {
        const cleanEmail = email.toLowerCase().trim()
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const exists = s.users.some((u) => u.email.toLowerCase() === cleanEmail)
          if (exists) return s
          const userId = uid('user')
          const newUser = {
            id: userId,
            role: 'user',
            email: cleanEmail,
            password,
            name: name?.trim() || 'Usuario',
            createdAt: Date.now(),
          }
          return {
            ...s,
            users: [newUser, ...s.users],
            session: { userId, createdAt: Date.now() },
          }
        })
        setStore(next)
        const nextUser =
          next.session && next.users.find((u) => u.id === next.session.userId)
        return { ok: Boolean(nextUser), user: nextUser || null }
      },
      logout() {
        const next = updateStore((cur) => ({ ...(cur ?? ensureStore()), session: null }))
        setStore(next)
      },
      // Domain APIs
      listPitches() {
        return store.pitches
      },
      getPitch(id) {
        return store.pitches.find((p) => p.id === id) || null
      },
      upsertPitch(pitch) {
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const normalized = {
            sport: pitch.sport || 'futbol',
            surface: pitch.surface || 'sintetico',
            roof: pitch.roof || 'descubierta',
            photos:
              Array.isArray(pitch.photos) && pitch.photos.length > 0
                ? pitch.photos
                : ['/hero.jpg'],
            ...pitch,
          }
          const idx = s.pitches.findIndex((p) => p.id === pitch.id)
          const nextPitches =
            idx === -1
              ? [normalized, ...s.pitches]
              : s.pitches.map((p) => (p.id === pitch.id ? { ...p, ...normalized } : p))
          return { ...s, pitches: nextPitches }
        })
        setStore(next)
      },
      deletePitch(id) {
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          return { ...s, pitches: s.pitches.filter((p) => p.id !== id) }
        })
        setStore(next)
      },
      listAvailability({ pitchId, date, slots }) {
        const day = date // 'YYYY-MM-DD'
        const taken = new Set(
          store.bookings
            .filter((b) => b.pitchId === pitchId && b.date === day && b.status !== 'cancelled')
            .map((b) => b.slot),
        )
        const blocked = new Set(
          (store.blocks || [])
            .filter((bl) => bl.pitchId === pitchId && bl.date === day)
            .map((bl) => bl.slot),
        )
        return slots.map((s) => ({
          slot: s,
          status: blocked.has(s) ? 'blocked' : taken.has(s) ? 'occupied' : 'free',
        }))
      },
      listBlocks({ pitchId, date }) {
        const day = date
        return (store.blocks || []).filter(
          (b) => b.pitchId === pitchId && (day ? b.date === day : true),
        )
      },
      toggleBlock({ pitchId, date, slot, reason }) {
        const now = Date.now()
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const blocks = s.blocks || []
          const existing = blocks.find(
            (b) => b.pitchId === pitchId && b.date === date && b.slot === slot,
          )
          if (existing) {
            return { ...s, blocks: blocks.filter((b) => b.id !== existing.id) }
          }
          const block = {
            id: uid('block'),
            pitchId,
            date,
            slot,
            reason: reason || 'mantenimiento',
            createdAt: now,
          }
          return { ...s, blocks: [block, ...blocks] }
        })
        setStore(next)
      },
      createBookingAndPayment({ pitchId, slot, paymentMethod }) {
        if (!user) return { ok: false, error: 'NO_AUTH' }
        const pitch = store.pitches.find((p) => p.id === pitchId)
        if (!pitch) return { ok: false, error: 'NO_PITCH' }

        const now = Date.now()
        const bookingId = `book_${now}_${Math.random().toString(16).slice(2)}`
        const paymentId = `pay_${now}_${Math.random().toString(16).slice(2)}`
        const mode = paymentMethod?.mode || 'full' // 'full' | 'deposit'
        const method = paymentMethod?.method || paymentMethod
        const depositAmount = store.settings?.depositAmount ?? 5000
        const holdMinutes = store.settings?.depositHoldMinutes ?? 15
        const expiresAt = now + holdMinutes * 60 * 1000
        const amount = mode === 'deposit' ? depositAmount : pitch.price

        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const date = new Date().toISOString().slice(0, 10)
          const isTaken = s.bookings.some(
            (b) =>
              b.pitchId === pitchId &&
              b.date === date &&
              b.slot === slot &&
              b.status !== 'cancelled',
          )
          const isBlocked = (s.blocks || []).some(
            (bl) => bl.pitchId === pitchId && bl.date === date && bl.slot === slot,
          )
          if (isTaken || isBlocked) return s
          const booking = {
            id: bookingId,
            pitchId,
            userId: user.id,
            date,
            slot,
            status: mode === 'deposit' ? 'pending_payment' : 'confirmed',
            paymentMode: mode,
            expiresAt: mode === 'deposit' ? expiresAt : null,
            createdAt: now,
          }
          const payment = {
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
          }
          return {
            ...s,
            bookings: [booking, ...s.bookings],
            payments: [payment, ...s.payments],
          }
        })
        setStore(next)
        return next === store
          ? { ok: false, error: 'NOT_AVAILABLE' }
          : { ok: true, bookingId, paymentId, expiresAt }
      },
      payDeposit({ paymentId }) {
        const now = Date.now()
        const next = updateStore((cur) => {
          const s = cur ?? ensureStore()
          const payment = s.payments.find((p) => p.id === paymentId)
          if (!payment || payment.status !== 'pending') return s
          if (payment.expiresAt && payment.expiresAt <= now) {
            // payment already expired
            return {
              ...s,
              payments: s.payments.map((p) =>
                p.id === paymentId ? { ...p, status: 'expired' } : p,
              ),
            }
          }
          const nextPayments = s.payments.map((p) =>
            p.id === paymentId ? { ...p, status: 'paid', paidAt: now } : p,
          )
          const nextBookings = s.bookings.map((b) =>
            b.id === payment.bookingId
              ? { ...b, status: 'reserved', paidAt: now }
              : b,
          )
          return { ...s, payments: nextPayments, bookings: nextBookings }
        })
        setStore(next)
        return { ok: true }
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
      stats() {
        const payments = store.payments
        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        const byMethod = payments.reduce((acc, p) => {
          acc[p.method] = (acc[p.method] || 0) + 1
          return acc
        }, {})
        const bookingsCount = store.bookings.length
        const pitchesCount = store.pitches.length
        return { totalRevenue, byMethod, bookingsCount, pitchesCount }
      },
    }
  }, [store, user])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}


