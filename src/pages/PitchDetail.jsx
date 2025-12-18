import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar.jsx'
import { Footer } from '../components/Footer.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { buildHourlySlots } from '../lib/slots.js'
import { Countdown } from '../components/Countdown.jsx'

const SLOTS = buildHourlySlots({ startHour: 9, endHour: 22 })

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo' },
  { id: 'card', label: 'Tarjeta' },
  { id: 'transfer', label: 'Transferencia' },
]

function isoDay(d) {
  return d.toISOString().slice(0, 10)
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function prettyDay(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatARS(value) {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `$${value}`
  }
}

export function PitchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPitch, isAuthed, createBookingAndPayment, listAvailability, payDeposit, store } =
    useAuth()

  const pitch = getPitch(id)
  const [day, setDay] = useState(() => isoDay(new Date()))
  const [slot, setSlot] = useState(SLOTS[0])
  const [payMode, setPayMode] = useState('deposit') // 'deposit' | 'full'
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id)
  const [status, setStatus] = useState(null)
  const [pending, setPending] = useState(null) // { paymentId, expiresAt } | null

  if (!pitch) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Cancha no encontrada
          </h1>
          <Link
            to="/canchas"
            className="mt-6 inline-flex rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            Volver
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const onReserve = () => {
    const returnTo = `/canchas/${pitch.id}?slot=${encodeURIComponent(slot)}&method=${encodeURIComponent(method)}`
    if (!isAuthed) {
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }
    const res = createBookingAndPayment({
      pitchId: pitch.id,
      slot,
      paymentMethod: { method, mode: payMode },
    })
    if (!res.ok) {
      setStatus('err')
      return
    }
    if (payMode === 'deposit') {
      setPending({ paymentId: res.paymentId, expiresAt: res.expiresAt })
      setStatus('pending')
      return
    }
    setStatus('ok')
  }

  const availability = listAvailability({ pitchId: pitch.id, date: day, slots: SLOTS })
  const selectedStatus = availability.find((a) => a.slot === slot)?.status
  const canReserve = selectedStatus === 'free'
  const depositAmount = store.settings?.depositAmount ?? 5000
  const holdMinutes = store.settings?.depositHoldMinutes ?? 15
  const total = payMode === 'deposit' ? depositAmount : pitch.price
  const photos = useMemo(() => {
    const arr = Array.isArray(pitch.photos) ? pitch.photos.filter(Boolean) : []
    return arr.length ? arr : ['/hero.jpg']
  }, [pitch.photos])
  const [lightbox, setLightbox] = useState(null) // index | null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <Link
            to="/canchas"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a canchas
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/10 ring-1 ring-black/5">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-10 text-white">
                <div className="text-sm font-semibold opacity-90">
                  {pitch.size} • {pitch.players} jugadores
                </div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                  {pitch.name}
                </h1>
                <p className="mt-3 max-w-2xl text-white/90">{pitch.description}</p>
              </div>

              <div className="px-8 py-8">
                <div className="mb-8">
                  <div className="text-sm font-extrabold text-slate-900">
                    Fotos
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {photos.slice(0, 6).map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => setLightbox(idx)}
                        className="group relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-black/5"
                      >
                        <img
                          src={src}
                          alt={`Foto ${idx + 1} de ${pitch.name}`}
                          className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-6">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Precio por turno
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                      {formatARS(pitch.price)}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      Duración: 1 hora
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Incluye iluminación LED y acceso a vestuarios (según disponibilidad).
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-6">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Disponibilidad (tiempo real)
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                        const d = isoDay(addDays(new Date(`${day}T00:00:00`), i))
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDay(d)}
                            className={
                              d === day
                                ? 'rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white'
                                : 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-black/5 hover:bg-slate-100'
                            }
                          >
                            {prettyDay(d)}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availability.map((a) => (
                        <button
                          key={a.slot}
                          type="button"
                          onClick={() => setSlot(a.slot)}
                          disabled={a.status !== 'free'}
                          className={[
                            'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/5',
                            a.slot === slot && a.status === 'free'
                              ? 'bg-emerald-600 text-white'
                              : a.status === 'free'
                                ? 'bg-white text-slate-700 hover:bg-slate-100'
                                : a.status === 'occupied'
                                  ? 'bg-slate-200 text-slate-500 line-through cursor-not-allowed'
                                  : 'bg-amber-100 text-amber-700 cursor-not-allowed',
                          ].join(' ')}
                        >
                          {a.slot}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" /> libre
                      </span>
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-slate-400" /> ocupado
                      </span>
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
                  <div className="text-sm font-extrabold text-slate-900">
                    Pago (seña fija o total)
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPayMode('deposit')}
                      className={
                        payMode === 'deposit'
                          ? 'rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'
                          : 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                      }
                    >
                      Seña ({formatARS(depositAmount)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMode('full')}
                      className={
                        payMode === 'full'
                          ? 'rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'
                          : 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                      }
                    >
                      Total ({formatARS(pitch.price)})
                    </button>
                  </div>

                  <div className="mt-6 text-sm font-extrabold text-slate-900">
                    Método
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={
                          m.id === method
                            ? 'rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'
                            : 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                        }
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-xl shadow-black/10 ring-1 ring-black/5">
              <div className="text-sm font-extrabold text-slate-900">
                Reserva tu turno
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cancha</span>
                  <span className="font-semibold">{pitch.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Horario</span>
                  <span className="font-semibold">{slot}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pago</span>
                  <span className="font-semibold">
                    {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Total</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatARS(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onReserve}
                disabled={!canReserve}
                className="mt-6 w-full rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 active:bg-rose-600"
              >
                {payMode === 'deposit' ? 'Reservar (seña)' : 'Reservar'}
              </button>
              {!canReserve ? (
                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Ese horario no está disponible. Elegí otro.
                </div>
              ) : null}

              {!isAuthed ? (
                <p className="mt-3 text-xs text-slate-500">
                  Para reservar, necesitás{' '}
                  <Link
                    className="font-semibold text-rose-600 hover:underline"
                    to={`/login?returnTo=${encodeURIComponent(`/canchas/${pitch.id}`)}`}
                  >
                    iniciar sesión
                  </Link>{' '}
                  o{' '}
                  <Link
                    className="font-semibold text-rose-600 hover:underline"
                    to={`/register?returnTo=${encodeURIComponent(`/canchas/${pitch.id}`)}`}
                  >
                    registrarte
                  </Link>
                  .
                </p>
              ) : null}

              {status === 'pending' && pending ? (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Turno reservado en espera. Pagá la seña antes de{' '}
                  <Countdown expiresAt={pending.expiresAt} /> o se libera automáticamente.
                  <button
                    type="button"
                    onClick={() => {
                      payDeposit({ paymentId: pending.paymentId })
                      setStatus('ok')
                      setPending(null)
                    }}
                    className="mt-3 w-full rounded-full bg-rose-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-400"
                  >
                    Pagar seña ahora (simulado)
                  </button>
                  <div className="mt-3 text-[11px] text-amber-900/70">
                    Ventana de pago: {holdMinutes} min.
                  </div>
                </div>
              ) : null}

              {status === 'ok' ? (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                  ¡Reserva confirmada! (simulado)
                </div>
              ) : null}
              {status === 'err' ? (
                <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  No se pudo reservar. Intentá de nuevo.
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {lightbox !== null ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightbox]}
              alt={`Foto ${lightbox + 1} de ${pitch.name}`}
              className="max-h-[80vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/20"
            >
              Cerrar
            </button>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setLightbox((i) => (i === 0 ? photos.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/20"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox((i) => (i === photos.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/20"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}


