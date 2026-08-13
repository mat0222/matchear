import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../auth/AuthProvider'
import { formatARS } from '../lib/time'
import { PITCHES } from '../lib/pitches'
import { inputClass, labelClass, selectClass } from '../lib/form'
import { isoDay } from '../lib/time'
import { buildHourlySlots } from '../lib/slots'

const SLOTS = buildHourlySlots({ startHour: 9, endHour: 22 })

function statusLabel(status) {
  if (status === 'pending_payment') return 'Pendiente de pago'
  if (status === 'reserved') return 'Seña pagada'
  if (status === 'confirmed') return 'Confirmada'
  if (status === 'cancelled') return 'Cancelada'
  return status
}

export default function Admin() {
  const { listAdminBookings, adminConfirm, adminCancel, adminBlockSlot, adminUnblockSlot, backend } =
    useAuth()
  const [notice, setNotice] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [blockForm, setBlockForm] = useState({
    pitchId: PITCHES[0]?.id || '',
    date: isoDay(new Date()),
    slot: SLOTS[0],
  })

  const bookings = listAdminBookings()

  async function handleConfirm(id) {
    setBusyId(id)
    setNotice(null)
    try {
      const res = await adminConfirm({ bookingId: id })
      setNotice(
        res.ok
          ? { type: 'success', text: 'Reserva confirmada.' }
          : { type: 'error', text: 'No se pudo confirmar.' },
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('¿Cancelar esta reserva y liberar el horario?')) return
    setBusyId(id)
    setNotice(null)
    try {
      const res = await adminCancel({ bookingId: id })
      setNotice(
        res.ok
          ? { type: 'success', text: 'Reserva cancelada.' }
          : { type: 'error', text: 'No se pudo cancelar.' },
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleBlock(e) {
    e.preventDefault()
    setNotice(null)
    const res = await adminBlockSlot(blockForm)
    setNotice(
      res.ok
        ? { type: 'success', text: 'Horario bloqueado.' }
        : { type: 'error', text: 'No se pudo bloquear (¿tenés permisos admin en Firestore?).' },
    )
  }

  async function handleUnblock(e) {
    e.preventDefault()
    setNotice(null)
    const res = await adminUnblockSlot(blockForm)
    setNotice(
      res.ok
        ? { type: 'success', text: 'Bloqueo quitado.' }
        : { type: 'error', text: 'No se pudo desbloquear.' },
    )
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administración"
        title="Panel del complejo"
        description="Gestioná reservas, confirmá pagos y bloqueá horarios. Solo visible para cuentas admin."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {backend === 'local' ? (
          <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Estás en modo local. Para producción configurá Firebase (ver FIREBASE.md). En local, el
            admin demo es <code className="font-mono">admin@matchear.com</code> / AdminDemo1.
          </p>
        ) : null}

        {notice ? (
          <p
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold ${
              notice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {notice.text}
          </p>
        ) : null}

        <div className="mb-10 rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
          <h2 className="text-lg font-extrabold text-neutral-950">Bloquear / liberar horario</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-4" onSubmit={handleBlock}>
            <div>
              <label className={labelClass} htmlFor="admin-pitch">
                Cancha
              </label>
              <select
                id="admin-pitch"
                className={selectClass}
                value={blockForm.pitchId}
                onChange={(e) => setBlockForm((f) => ({ ...f, pitchId: e.target.value }))}
              >
                {PITCHES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="admin-date">
                Día
              </label>
              <input
                id="admin-date"
                type="date"
                className={inputClass}
                value={blockForm.date}
                onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="admin-slot">
                Horario
              </label>
              <select
                id="admin-slot"
                className={selectClass}
                value={blockForm.slot}
                onChange={(e) => setBlockForm((f) => ({ ...f, slot: e.target.value }))}
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s} hs
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white"
              >
                Bloquear
              </button>
              <button
                type="button"
                onClick={handleUnblock}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-700"
              >
                Liberar
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-extrabold text-neutral-950">Reservas recientes</h2>
          <Link to="/canchas" className="text-sm font-semibold text-brand hover:underline">
            Ver canchas
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-600">Todavía no hay reservas.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-neutral-950">
                      {b.pitch?.name || b.pitchId} · {b.date} · {b.slot} hs
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {b.userName || '—'} · {b.userEmail || '—'}
                      {b.whatsapp ? ` · WA ${b.whatsapp}` : ''}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-800">
                      {statusLabel(b.status)}
                      {b.amount ? ` · ${formatARS(b.amount)}` : ''}
                      {b.paymentMethod ? ` · ${b.paymentMethod}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status !== 'cancelled' && b.status !== 'confirmed' ? (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => handleConfirm(b.id)}
                        className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                    ) : null}
                    {b.status !== 'cancelled' ? (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => handleCancel(b.id)}
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  )
}
