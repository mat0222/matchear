import { useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { AuthContext } from './authContext.js'
import { auth } from '../lib/firebase.js'
import { DEFAULT_SETTINGS, getPitchById, PITCHES } from '../lib/pitches.js'
import {
  adminConfirmBooking,
  cancelBookingDoc,
  countActiveBookingsForDay,
  createBookingTransaction,
  ensureUserProfile,
  payDepositDoc,
  removeBlockSlot,
  setBlockSlot,
  subscribeAllBookings,
  subscribeAvailability,
  subscribeBookingsForUser,
  subscribePaymentsForUser,
  subscribeUserProfile,
} from '../lib/firestoreApi.js'
import {
  authDelay,
  sanitizeName,
  sanitizePublicUser,
  validateBookingDate,
  validateBookingSlot,
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateWhatsapp,
} from '../lib/security.js'
import { checkRateLimit, clearAttempts, formatRetryMessage, recordAttempt } from '../lib/rateLimit.js'

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return { error: 'EMAIL_EXISTS', message: 'Ese email ya está registrado.' }
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return { error: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos.' }
    case 'auth/weak-password':
      return { error: 'WEAK_PASSWORD', message: 'La contraseña es demasiado débil.' }
    case 'auth/too-many-requests':
      return { error: 'RATE_LIMITED', message: 'Demasiados intentos. Probá más tarde.' }
    case 'auth/operation-not-allowed':
      return {
        error: 'PROVIDER_DISABLED',
        message: 'Este método de acceso no está habilitado en Firebase.',
      }
    default:
      return { error: 'AUTH_ERROR', message: 'No se pudo completar la autenticación.' }
  }
}

export function FirebaseAuthProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [myBookingsData, setMyBookingsData] = useState([])
  const [myPaymentsData, setMyPaymentsData] = useState([])
  const [availabilityCache, setAvailabilityCache] = useState({})
  const [adminBookings, setAdminBookings] = useState([])
  const [authError, setAuthError] = useState(null)

  const user = sanitizePublicUser(profile)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (!fbUser) {
        setProfile(null)
        setReady(true)
        return
      }
      try {
        const ensured = await ensureUserProfile(fbUser)
        setProfile(ensured)
        setAuthError(null)
      } catch (err) {
        console.error(err)
        setAuthError('No se pudo cargar el perfil.')
        setProfile(null)
      } finally {
        setReady(true)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setProfile(null)
      return undefined
    }
    return subscribeUserProfile(
      firebaseUser.uid,
      (data) => {
        if (data) setProfile(data)
      },
      (err) => console.error(err),
    )
  }, [firebaseUser?.uid])

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setMyBookingsData([])
      setMyPaymentsData([])
      return undefined
    }
    const unsubB = subscribeBookingsForUser(firebaseUser.uid, setMyBookingsData, console.error)
    const unsubP = subscribePaymentsForUser(firebaseUser.uid, setMyPaymentsData, console.error)
    return () => {
      unsubB()
      unsubP()
    }
  }, [firebaseUser?.uid])

  useEffect(() => {
    if (profile?.role !== 'admin') {
      setAdminBookings([])
      return undefined
    }
    return subscribeAllBookings(setAdminBookings, console.error)
  }, [profile?.role])

  // Expire pending deposits periodically (client-side UX; rules still enforce ownership)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setMyBookingsData((prev) =>
        prev.map((b) =>
          b.status === 'pending_payment' && b.expiresAt && b.expiresAt <= now
            ? { ...b, status: 'cancelled', cancelledAt: now }
            : b,
        ),
      )
      setMyPaymentsData((prev) =>
        prev.map((p) =>
          p.status === 'pending' && p.expiresAt && p.expiresAt <= now ? { ...p, status: 'expired' } : p,
        ),
      )
    }, 15_000)
    return () => clearInterval(interval)
  }, [])

  const api = useMemo(() => {
    return {
      ready,
      user,
      role: user?.role ?? null,
      isAuthed: Boolean(user),
      isAdmin: user?.role === 'admin',
      settings: DEFAULT_SETTINGS,
      authError,
      backend: 'firebase',
      adminBookings,

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
          return { ok: false, error: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos.' }
        }
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
          clearAttempts('login')
          return { ok: true }
        } catch (err) {
          recordAttempt('login')
          await authDelay()
          const mapped = mapFirebaseError(err.code)
          return { ok: false, ...mapped }
        }
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
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, strength.password)
          await updateProfile(cred.user, { displayName: cleanName })
          await ensureUserProfile(cred.user, { name: cleanName })
          clearAttempts('register')
          return { ok: true }
        } catch (err) {
          recordAttempt('register')
          const mapped = mapFirebaseError(err.code)
          return { ok: false, ...mapped }
        }
      },

      async logout() {
        await signOut(auth)
        setProfile(null)
        setMyBookingsData([])
        setMyPaymentsData([])
      },

      listPitches() {
        return PITCHES
      },

      getPitch(id) {
        return getPitchById(id)
      },

      listAvailability({ pitchId, date, slots }) {
        const cacheKey = `${pitchId}|${date}`
        const cached = availabilityCache[cacheKey] || { bookings: [], blocks: [] }
        const taken = new Set(
          cached.bookings.filter((b) => b.status !== 'cancelled').map((b) => b.slot),
        )
        const blocked = new Set(cached.blocks.map((bl) => bl.slot))
        return slots.map((s) => ({
          slot: s,
          status: blocked.has(s) ? 'blocked' : taken.has(s) ? 'occupied' : 'free',
        }))
      },

      /** Suscribe disponibilidad en tiempo real para una cancha/día */
      watchAvailability(pitchId, date, onChange) {
        if (!pitchId || !date) return () => {}
        const cacheKey = `${pitchId}|${date}`
        return subscribeAvailability(
          pitchId,
          date,
          (data) => {
            setAvailabilityCache((prev) => ({ ...prev, [cacheKey]: data }))
            onChange?.(data)
          },
          console.error,
        )
      },

      async createBookingAndPayment({ pitchId, slot, date, paymentMethod, whatsapp }) {
        if (!user || !firebaseUser) return { ok: false, error: 'NO_AUTH' }

        const bookLimit = checkRateLimit(`book:${user.id}`, {
          maxAttempts: 8,
          windowMs: 60 * 60 * 1000,
          lockMs: 30 * 60 * 1000,
        })
        if (!bookLimit.ok) {
          return { ok: false, error: 'RATE_LIMITED', message: formatRetryMessage(bookLimit.retryAfterSec) }
        }

        const pitch = getPitchById(pitchId)
        if (!pitch) return { ok: false, error: 'NO_PITCH' }

        const cleanWhatsapp = validateWhatsapp(whatsapp)
        if (!cleanWhatsapp) return { ok: false, error: 'INVALID_WHATSAPP' }

        const day = validateBookingDate(date)
        const cleanSlot = validateBookingSlot(slot)
        if (!day || !cleanSlot) return { ok: false, error: 'INVALID_SLOT' }

        const activeToday = await countActiveBookingsForDay(user.id, day)
        if (activeToday >= 3) {
          return { ok: false, error: 'DAILY_LIMIT', message: 'Máximo 3 reservas por día.' }
        }

        const result = await createBookingTransaction({
          user,
          pitchId,
          slot: cleanSlot,
          date: day,
          paymentMethod,
          whatsapp: cleanWhatsapp,
          settings: DEFAULT_SETTINGS,
        })
        if (result.ok) recordAttempt(`book:${user.id}`)
        return result
      },

      async payDeposit({ paymentId }) {
        if (!user) return { ok: false }
        return payDepositDoc({ paymentId, userId: user.id })
      },

      async cancelBooking({ bookingId }) {
        if (!user) return { ok: false, error: 'NO_AUTH' }
        return cancelBookingDoc({
          bookingId,
          userId: user.id,
          asAdmin: user.role === 'admin',
        })
      },

      myBookings() {
        if (!user) return []
        const paymentsByBooking = myPaymentsData.reduce((acc, p) => {
          acc[p.bookingId] = acc[p.bookingId] || []
          acc[p.bookingId].push(p)
          return acc
        }, {})
        return [...myBookingsData]
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          .map((b) => ({
            ...b,
            pitch: getPitchById(b.pitchId),
            payments: paymentsByBooking[b.id] || [],
          }))
      },

      listAdminBookings() {
        return adminBookings.map((b) => ({
          ...b,
          pitch: getPitchById(b.pitchId),
        }))
      },

      async adminConfirm({ bookingId }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        return adminConfirmBooking(bookingId)
      },

      async adminCancel({ bookingId }) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        return cancelBookingDoc({ bookingId, userId: user.id, asAdmin: true })
      },

      async adminBlockSlot(payload) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        return setBlockSlot(payload)
      },

      async adminUnblockSlot(payload) {
        if (user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' }
        return removeBlockSlot(payload)
      },
    }
  }, [
    ready,
    user,
    authError,
    firebaseUser,
    myBookingsData,
    myPaymentsData,
    availabilityCache,
    adminBookings,
  ])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}
