import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
  deleteDoc,
} from 'firebase/firestore'
import { ADMIN_EMAIL, db } from './firebase.js'
import { DEFAULT_SETTINGS, getPitchById } from './pitches.js'
import { sanitizeName } from './security.js'

const ALLOWED_PAYMENT_METHODS = new Set(['cash', 'card', 'transfer'])

function mapDoc(snap) {
  return { id: snap.id, ...snap.data() }
}

export async function ensureUserProfile(firebaseUser, { name } = {}) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  const email = String(firebaseUser.email || '').toLowerCase()
  const displayName =
    sanitizeName(name || firebaseUser.displayName) || email.split('@')[0] || 'Usuario'

  if (!snap.exists()) {
    const profile = {
      email,
      name: displayName,
      role: 'user',
      provider: firebaseUser.providerData?.[0]?.providerId || 'password',
      createdAt: Date.now(),
    }
    await setDoc(ref, profile)
    // Bootstrap admin: solo si el doc no existía y el email coincide.
    // Las reglas de Firestore deben permitir este update SOLO para ese email (ver firestore.rules).
    if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
      try {
        await updateDoc(ref, { role: 'admin' })
        return { id: firebaseUser.uid, ...profile, role: 'admin' }
      } catch {
        return { id: firebaseUser.uid, ...profile }
      }
    }
    return { id: firebaseUser.uid, ...profile }
  }

  const data = snap.data()
  const patch = {}
  if (displayName && displayName !== data.name) patch.name = displayName
  if (email && email !== data.email) patch.email = email
  if (Object.keys(patch).length) await updateDoc(ref, patch)
  return { id: firebaseUser.uid, ...data, ...patch }
}

export function subscribeUserProfile(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null)
        return
      }
      onData({ id: snap.id, ...snap.data() })
    },
    onError,
  )
}

export function subscribeBookingsForUser(uid, onData, onError) {
  const q = query(collection(db, 'bookings'), where('userId', '==', uid))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapDoc)),
    onError,
  )
}

export function subscribePaymentsForUser(uid, onData, onError) {
  const q = query(collection(db, 'payments'), where('userId', '==', uid))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapDoc)),
    onError,
  )
}

export function subscribeAvailability(pitchId, date, onData, onError) {
  const locksQ = query(
    collection(db, 'slotLocks'),
    where('pitchId', '==', pitchId),
    where('date', '==', date),
  )
  const blocksQ = query(
    collection(db, 'blocks'),
    where('pitchId', '==', pitchId),
    where('date', '==', date),
  )

  let locks = []
  let blocks = []

  const emit = () => {
    const bookings = locks
      .filter((l) => !l.blocked)
      .map((l) => ({ slot: l.slot, status: 'occupied' }))
    onData({ bookings, blocks })
  }

  const unsubLocks = onSnapshot(
    locksQ,
    (snap) => {
      locks = snap.docs.map(mapDoc)
      emit()
    },
    onError,
  )
  const unsubBlocks = onSnapshot(
    blocksQ,
    (snap) => {
      blocks = snap.docs.map(mapDoc)
      emit()
    },
    onError,
  )

  return () => {
    unsubLocks()
    unsubBlocks()
  }
}

export function subscribeAllBookings(onData, onError) {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(150))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapDoc)),
    onError,
  )
}

export async function createBookingTransaction({
  user,
  pitchId,
  slot,
  date,
  paymentMethod,
  whatsapp,
  settings = DEFAULT_SETTINGS,
}) {
  const pitch = getPitchById(pitchId)
  if (!pitch) return { ok: false, error: 'NO_PITCH' }

  const method = paymentMethod?.method || paymentMethod
  const mode = paymentMethod?.mode === 'full' ? 'full' : 'deposit'
  if (!ALLOWED_PAYMENT_METHODS.has(method)) return { ok: false, error: 'INVALID_METHOD' }

  const now = Date.now()
  const depositAmount = settings.depositAmount ?? 5000
  const holdMinutes = settings.depositHoldMinutes ?? 15
  const expiresAt = now + holdMinutes * 60 * 1000
  const amount = mode === 'deposit' ? depositAmount : pitch.price
  const bookingStatus = mode === 'deposit' ? 'pending_payment' : 'confirmed'

  const lockId = `${pitchId}_${date}_${slot}`
  const lockRef = doc(db, 'slotLocks', lockId)
  const bookingRef = doc(collection(db, 'bookings'))
  const paymentRef = doc(collection(db, 'payments'))

  try {
    await runTransaction(db, async (tx) => {
      const lockSnap = await tx.get(lockRef)
      if (lockSnap.exists()) throw new Error('NOT_AVAILABLE')

      const dayBookingsQ = query(
        collection(db, 'bookings'),
        where('userId', '==', user.id),
        where('date', '==', date),
      )
      // Note: cannot query inside transaction easily for count — check via getDocs outside
      // We do daily limit check before transaction in AuthProvider.

      tx.set(lockRef, {
        bookingId: bookingRef.id,
        userId: user.id,
        pitchId,
        date,
        slot,
        createdAt: now,
      })

      tx.set(bookingRef, {
        pitchId,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.name || '',
        date,
        slot,
        whatsapp,
        paymentMethod: method,
        paymentMode: mode,
        amount,
        status: bookingStatus,
        expiresAt: mode === 'deposit' ? expiresAt : null,
        createdAt: now,
        updatedAt: now,
      })

      tx.set(paymentRef, {
        bookingId: bookingRef.id,
        pitchId,
        userId: user.id,
        method,
        mode,
        amount,
        status: mode === 'deposit' ? 'pending' : 'paid',
        expiresAt: mode === 'deposit' ? expiresAt : null,
        createdAt: now,
        paidAt: mode === 'full' ? now : null,
      })
    })

    return { ok: true, bookingId: bookingRef.id, paymentId: paymentRef.id, expiresAt }
  } catch (err) {
    if (err?.message === 'NOT_AVAILABLE') return { ok: false, error: 'NOT_AVAILABLE' }
    console.error(err)
    return { ok: false, error: 'SERVER_ERROR', message: 'No se pudo crear la reserva.' }
  }
}

export async function countActiveBookingsForDay(userId, date) {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('date', '==', date),
  )
  const snap = await getDocs(q)
  return snap.docs.filter((d) => d.data().status !== 'cancelled').length
}

export async function payDepositDoc({ paymentId, userId }) {
  const paymentRef = doc(db, 'payments', paymentId)
  const snap = await getDoc(paymentRef)
  if (!snap.exists()) return { ok: false }
  const payment = snap.data()
  if (payment.userId !== userId || payment.status !== 'pending') return { ok: false }
  if (payment.expiresAt && payment.expiresAt <= Date.now()) {
    await updateDoc(paymentRef, { status: 'expired' })
    return { ok: false, error: 'EXPIRED' }
  }

  const now = Date.now()
  await updateDoc(paymentRef, { status: 'paid', paidAt: now })
  await updateDoc(doc(db, 'bookings', payment.bookingId), {
    status: 'reserved',
    paidAt: now,
    updatedAt: now,
  })
  return { ok: true }
}

export async function cancelBookingDoc({ bookingId, userId, asAdmin = false }) {
  const bookingRef = doc(db, 'bookings', bookingId)
  const snap = await getDoc(bookingRef)
  if (!snap.exists()) return { ok: false, error: 'NOT_FOUND' }
  const booking = snap.data()
  if (!asAdmin && booking.userId !== userId) return { ok: false, error: 'FORBIDDEN' }
  if (booking.status === 'cancelled') return { ok: false, error: 'ALREADY_CANCELLED' }

  const now = Date.now()
  const cancelled = { ...booking, id: bookingId, status: 'cancelled', cancelledAt: now }
  await updateDoc(bookingRef, { status: 'cancelled', cancelledAt: now, updatedAt: now })

  const lockId = `${booking.pitchId}_${booking.date}_${booking.slot}`
  try {
    await deleteDoc(doc(db, 'slotLocks', lockId))
  } catch {
    // lock may already be gone
  }

  const paymentsQ = query(collection(db, 'payments'), where('bookingId', '==', bookingId))
  const paymentsSnap = await getDocs(paymentsQ)
  await Promise.all(
    paymentsSnap.docs.map((p) => {
      const status = p.data().status
      if (status === 'pending') return updateDoc(p.ref, { status: 'cancelled' })
      if (status === 'paid') return updateDoc(p.ref, { status: 'refund_pending' })
      return Promise.resolve()
    }),
  )

  return { ok: true, booking: cancelled }
}

export async function adminConfirmBooking(bookingId) {
  const ref = doc(db, 'bookings', bookingId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { ok: false }
  const booking = snap.data()
  if (booking.status === 'cancelled') return { ok: false }

  const now = Date.now()
  await updateDoc(ref, { status: 'confirmed', updatedAt: now })

  const paymentsQ = query(collection(db, 'payments'), where('bookingId', '==', bookingId))
  const paymentsSnap = await getDocs(paymentsQ)
  await Promise.all(
    paymentsSnap.docs.map((p) => {
      if (p.data().status === 'pending') {
        return updateDoc(p.ref, { status: 'paid', paidAt: now })
      }
      return Promise.resolve()
    }),
  )
  return { ok: true }
}

export async function setBlockSlot({ pitchId, date, slot, reason = '' }) {
  const id = `${pitchId}_${date}_${slot}`
  await setDoc(doc(db, 'blocks', id), {
    pitchId,
    date,
    slot,
    reason,
    createdAt: Date.now(),
  })
  // Also lock the slot so bookings cannot take it
  await setDoc(doc(db, 'slotLocks', id), {
    bookingId: null,
    blocked: true,
    pitchId,
    date,
    slot,
    createdAt: Date.now(),
  })
  return { ok: true }
}

export async function removeBlockSlot({ pitchId, date, slot }) {
  const id = `${pitchId}_${date}_${slot}`
  try {
    await deleteDoc(doc(db, 'blocks', id))
  } catch {
    /* ignore */
  }
  try {
    const lockRef = doc(db, 'slotLocks', id)
    const lock = await getDoc(lockRef)
    if (lock.exists() && lock.data().blocked) await deleteDoc(lockRef)
  } catch {
    /* ignore */
  }
  return { ok: true }
}
