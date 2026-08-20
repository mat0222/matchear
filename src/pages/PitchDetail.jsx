import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { Countdown } from '../components/Countdown'
import { useAuth } from '../auth/AuthProvider'
import { validateWhatsapp } from '../lib/security'
import { inputClass, labelClass } from '../lib/form'
import { buildHourlySlots } from '../lib/slots'
import { addDays, formatARS, isoDay, prettyDay } from '../lib/time'
import { openBlankTab, openWhatsappToOwner } from '../lib/whatsapp'

const SLOTS = buildHourlySlots({ startHour: 9, endHour: 22 })

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', desc: 'Pagás en el complejo' },
  { id: 'card', label: 'Tarjeta', desc: 'Débito o crédito' },
  { id: 'transfer', label: 'Transferencia', desc: 'CBU / alias del club' },
]

export default function PitchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getPitch,
    isAuthed,
    createBookingAndPayment,
    listAvailability,
    refreshAvailability,
    payDeposit,
    settings,
  } = useAuth()

  const pitch = getPitch(id)
  const [day, setDay] = useState(() => isoDay(new Date()))
  const [slot, setSlot] = useState(SLOTS[0])
  const [payMode, setPayMode] = useState('deposit')
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id)
  const [whatsapp, setWhatsapp] = useState('')
  const [status, setStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmationUrl, setConfirmationUrl] = useState('')
  const [pending, setPending] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [availTick, setAvailTick] = useState(0)

  const dayOptions = useMemo(
    () => Array.from({ length: 7 }, (_, i) => isoDay(addDays(new Date(), i))),
    [],
  )

  useEffect(() => {
    if (!pitch?.id || !refreshAvailability) return undefined

    let cancelled = false
    const load = () =>
      refreshAvailability(pitch.id, day).then(() => {
        if (!cancelled) setAvailTick((n) => n + 1)
      })
    load()
    const interval = window.setInterval(load, 30000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [pitch?.id, day, refreshAvailability])

  const availability = pitch
    ? listAvailability({ pitchId: pitch.id, date: day, slots: SLOTS })
    : []
  void availTick
  const selectedStatus = availability.find((a) => a.slot === slot)?.status
  const canReserve = selectedStatus === 'free'
  const depositAmount = settings.depositAmount ?? 5000
  const holdMinutes = settings.depositHoldMinutes ?? 15
  const total = payMode === 'deposit' ? depositAmount : pitch?.price || 0

  async function onReserve() {
    if (!pitch || submitting) return
    setErrorMessage('')
    setConfirmationUrl('')
    const returnTo = `/canchas/${pitch.id}`
    if (!isAuthed) {
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }

    setSubmitting(true)

    if (!validateWhatsapp(whatsapp)) {
      setErrorMessage('Ingresá un número de WhatsApp válido con código de área.')
      setStatus('err')
      setSubmitting(false)
      return
    }

    const waPayload = {
      pitchName: pitch.name,
      date: day,
      slot,
      paymentMethod: method,
      customerWhatsapp: whatsapp,
      status: 'confirmed',
    }
    const popup = openBlankTab()

    try {
      const res = await createBookingAndPayment({
        pitchId: pitch.id,
        slot,
        date: day,
        whatsapp,
        paymentMethod: { method, mode: payMode },
      })
      if (!res.ok) {
        try {
          popup?.close()
        } catch {
          /* ignore */
        }
        setErrorMessage(
          res.error === 'INVALID_WHATSAPP'
            ? 'Ingresá un número de WhatsApp válido con código de área.'
            : res.error === 'RATE_LIMITED' || res.error === 'DAILY_LIMIT'
              ? res.message || 'Límite de reservas alcanzado. Probá más tarde.'
              : res.error === 'INVALID_SLOT'
                ? 'Día u horario inválido.'
                : 'No se pudo reservar. El horario puede haber sido ocupado.',
        )
        setStatus('err')
        return
      }

      const url = openWhatsappToOwner(waPayload, popup)
      setConfirmationUrl(url)

      if (payMode === 'deposit') {
        setPending({ paymentId: res.paymentId, expiresAt: res.expiresAt })
        setStatus('pending')
        return
      }
      setStatus('ok')
    } finally {
      setSubmitting(false)
    }
  }

  if (!pitch) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-2xl font-extrabold text-neutral-950">Cancha no encontrada</h1>
          <Link
            to="/canchas"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Volver a canchas
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reservá tu turno"
        title={pitch.name}
        description={`${pitch.size} · ${pitch.players} jugadores · ${pitch.description}`}
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/canchas" className="text-sm font-semibold text-neutral-500 hover:text-brand">
          ← Volver a canchas
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-card">
              <div className="relative bg-gradient-to-br from-brand-dark via-brand to-brand px-6 py-8 text-white">
                <div className="pointer-events-none absolute inset-0 bg-red-shine opacity-80" />
                <p className="relative text-sm font-semibold text-white/90">Precio por hora</p>
                <p className="relative mt-1 text-4xl font-black">{formatARS(pitch.price)}</p>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-extrabold text-neutral-950">Elegí el día</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {dayOptions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        d === day
                          ? 'bg-brand text-white shadow-md shadow-brand/25'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {prettyDay(d)}
                    </button>
                  ))}
                </div>

                <h2 className="mt-8 text-lg font-extrabold text-neutral-950">Horarios disponibles</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {availability.map((a) => (
                    <button
                      key={a.slot}
                      type="button"
                      onClick={() => setSlot(a.slot)}
                      disabled={a.status !== 'free'}
                      className={[
                        'rounded-full px-4 py-2 text-sm font-semibold transition',
                        a.slot === slot && a.status === 'free'
                          ? 'bg-brand text-white'
                          : a.status === 'free'
                            ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                            : a.status === 'occupied'
                              ? 'cursor-not-allowed bg-neutral-200 text-neutral-400 line-through'
                              : 'cursor-not-allowed bg-amber-100 text-amber-800',
                      ].join(' ')}
                    >
                      {a.slot}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand" /> Libre
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neutral-400" /> Ocupado
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Bloqueado
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-lg font-extrabold text-neutral-950">Forma de pago</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPayMode('deposit')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    payMode === 'deposit'
                      ? 'border-brand bg-brand-muted'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className="font-extrabold text-neutral-950">Seña</p>
                  <p className="mt-1 text-sm text-neutral-600">{formatARS(depositAmount)} para reservar</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode('full')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    payMode === 'full'
                      ? 'border-brand bg-brand-muted'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className="font-extrabold text-neutral-950">Pago total</p>
                  <p className="mt-1 text-sm text-neutral-600">{formatARS(pitch.price)} al confirmar</p>
                </button>
              </div>

              <h3 className="mt-8 text-sm font-extrabold uppercase tracking-wide text-neutral-500">
                Método
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      m.id === method
                        ? 'border-brand bg-brand-muted'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <p className="font-extrabold text-neutral-950">{m.label}</p>
                    <p className="mt-1 text-xs text-neutral-600">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-extrabold text-neutral-950">Resumen</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Día</dt>
                  <dd className="font-bold text-neutral-900">{prettyDay(day)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Horario</dt>
                  <dd className="font-bold text-neutral-900">{slot} hs</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Método</dt>
                  <dd className="font-bold text-neutral-900">
                    {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-neutral-100 pt-3">
                  <dt className="font-semibold text-neutral-700">Total a pagar</dt>
                  <dd className="text-xl font-black text-brand">{formatARS(total)}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <label htmlFor="booking-whatsapp" className={labelClass}>
                  WhatsApp de confirmación
                </label>
                <input
                  id="booking-whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className={inputClass}
                  placeholder="Ej: 351 555 1234"
                  aria-describedby="whatsapp-help"
                />
                <p id="whatsapp-help" className="mt-2 text-xs leading-relaxed text-neutral-500">
                  Al confirmar se abre WhatsApp al complejo con tu reserva ya escrita. Dejá tu número
                  para que te puedan contactar.
                </p>
              </div>

              <button
                type="button"
                onClick={onReserve}
                disabled={!canReserve || submitting}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? 'Confirmando…'
                  : payMode === 'deposit'
                    ? 'Reservar con seña'
                    : 'Reservar y pagar'}
              </button>

              {!canReserve ? (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Ese horario no está disponible. Elegí otro.
                </p>
              ) : null}

              {!isAuthed ? (
                <p className="mt-3 text-xs text-neutral-500">
                  Necesitás{' '}
                  <Link to={`/login?returnTo=${encodeURIComponent(`/canchas/${pitch.id}`)}`} className="font-bold text-brand hover:underline">
                    iniciar sesión
                  </Link>{' '}
                  para confirmar la reserva.
                </p>
              ) : null}

              {status === 'pending' && pending ? (
                <div className="mt-4 rounded-xl bg-brand-muted p-4 text-xs font-semibold text-neutral-800">
                  Turno reservado. Pagá la seña antes de <Countdown expiresAt={pending.expiresAt} />.
                  <button
                    type="button"
                    onClick={() => {
                      payDeposit({ paymentId: pending.paymentId })
                      setStatus('ok')
                      setPending(null)
                    }}
                    className="mt-3 w-full rounded-xl bg-brand py-2.5 text-xs font-extrabold text-white hover:brightness-105"
                  >
                    Pagar seña ahora
                  </button>
                  <p className="mt-3 text-[11px] text-neutral-600">
                    Se abrió WhatsApp para avisar al complejo. Enviá el mensaje y pagá la seña acá.
                  </p>
                  {confirmationUrl ? (
                    <a
                      href={confirmationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] font-semibold text-brand hover:underline"
                    >
                      ¿No se abrió WhatsApp? Tocá acá
                    </a>
                  ) : (
                    <p className="mt-2 text-[11px] font-medium text-amber-800">
                      WhatsApp no está configurado en el servidor. Agregá VITE_WHATSAPP_OWNER en Netlify y volvé a desplegar.
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-neutral-600">Ventana de pago: {holdMinutes} min.</p>
                </div>
              ) : null}

              {status === 'ok' ? (
                <div className="mt-4 space-y-3">
                  <p className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                    ¡Reserva confirmada! Se abrió WhatsApp para avisar al complejo.
                  </p>
                  {confirmationUrl ? (
                    <a
                      href={confirmationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-semibold text-brand hover:underline"
                    >
                      ¿No se abrió WhatsApp? Tocá acá
                    </a>
                  ) : (
                    <p className="text-[11px] font-medium text-amber-800">
                      WhatsApp no está configurado en el servidor. Agregá VITE_WHATSAPP_OWNER en Netlify y volvé a desplegar.
                    </p>
                  )}
                  <Link
                    to="/mis-reservas"
                    className="block text-center text-sm font-bold text-brand hover:underline"
                  >
                    Ver mis reservas →
                  </Link>
                </div>
              ) : null}

              {status === 'err' ? (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {errorMessage || 'No se pudo reservar. Intentá de nuevo.'}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}
