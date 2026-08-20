import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { Countdown } from '../components/Countdown'
import { useAuth } from '../auth/AuthProvider'
import { formatARS } from '../lib/time'
import { openBlankTab, openWhatsappToOwner } from '../lib/whatsapp'

function statusLabel(b) {
  if (b.status === 'pending_payment') return 'Pendiente de pago'
  if (b.status === 'reserved') return 'Reservada'
  if (b.status === 'confirmed') return 'Confirmada'
  if (b.status === 'cancelled') return 'Cancelada'
  return b.status
}

export default function MyBookings() {
  const { myBookings, payDeposit, cancelBooking } = useAuth()
  const [notice, setNotice] = useState(null)
  const bookings = myBookings()

  async function handleCancel(booking) {
    const confirmed = window.confirm(
      `¿Querés cancelar ${booking.pitch?.name || 'la cancha'} del ${booking.date} a las ${booking.slot} hs?`,
    )
    if (!confirmed) return

    const popup = openBlankTab()
    const result = await cancelBooking({ bookingId: booking.id })
    if (!result.ok) {
      try {
        popup?.close()
      } catch {
        /* ignore */
      }
      setNotice({ type: 'error', text: 'No se pudo cancelar el turno.' })
      return
    }

    const whatsappUrl = openWhatsappToOwner(
      {
        pitchName: booking.pitch?.name || 'la cancha',
        date: booking.date,
        slot: booking.slot,
        paymentMethod: booking.paymentMethod,
        customerWhatsapp: booking.whatsapp,
        status: 'cancelled',
      },
      popup,
    )

    setNotice({
      type: 'success',
      text: whatsappUrl
        ? 'Turno cancelado. Tocá el botón verde si WhatsApp no se abrió solo.'
        : 'Turno cancelado. WhatsApp no está configurado en el servidor (VITE_WHATSAPP_OWNER).',
      whatsappUrl,
    })
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Tu cuenta"
        title="Mis reservas"
        description="Acá ves tus turnos confirmados y los pagos de seña pendientes."
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {notice ? (
          <div
            className={`mb-6 rounded-2xl px-5 py-4 text-sm font-semibold ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <p>{notice.text}</p>
            {notice.whatsappUrl ? (
              <a
                href={notice.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex font-extrabold underline"
              >
                Abrir aviso de cancelación en WhatsApp de nuevo
              </a>
            ) : null}
          </div>
        ) : null}
        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-neutral-100 bg-white p-12 text-center shadow-card">
            <p className="text-neutral-600">Todavía no tenés reservas.</p>
            <Link
              to="/canchas"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              Reservar una cancha
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const depositPayment = b.payments.find(
                (p) => p.mode === 'deposit' && (p.status === 'pending' || p.status === 'expired'),
              )
              const canPay =
                depositPayment?.status === 'pending' &&
                (!depositPayment.expiresAt || depositPayment.expiresAt > Date.now())
              const canCancel = b.status !== 'cancelled'

              return (
                <article
                  key={b.id}
                  className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-neutral-950">
                        {b.pitch?.name || 'Cancha'}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        {b.date} · {b.slot} hs · {b.pitch?.size}
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-extrabold text-neutral-800">
                      {statusLabel(b)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-bold uppercase text-neutral-500">Precio cancha</p>
                      <p className="mt-1 font-extrabold text-neutral-950">
                        {formatARS(b.pitch?.price || 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-bold uppercase text-neutral-500">Seña</p>
                      {depositPayment ? (
                        <p className="mt-1 text-sm font-semibold text-neutral-800">
                          {depositPayment.status === 'pending' ? (
                            <>
                              Pendiente · <Countdown expiresAt={depositPayment.expiresAt} />
                            </>
                          ) : (
                            'Vencida'
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-neutral-600">—</p>
                      )}
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-bold uppercase text-neutral-500">WhatsApp</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-800">
                        {b.whatsapp ? `+${b.whatsapp}` : 'No informado'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-bold uppercase text-neutral-500">Acción</p>
                      {depositPayment && canPay ? (
                        <button
                          type="button"
                          onClick={() => payDeposit({ paymentId: depositPayment.id })}
                          className="mt-2 w-full rounded-xl bg-brand py-2 text-xs font-extrabold text-white hover:brightness-105"
                        >
                          Pagar seña
                        </button>
                      ) : (
                        <p className="mt-2 text-sm text-neutral-600">—</p>
                      )}
                    </div>
                  </div>

                  {canCancel ? (
                    <div className="mt-5 border-t border-neutral-100 pt-5">
                      <button
                        type="button"
                        onClick={() => handleCancel(b)}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
                      >
                        Cancelar turno
                      </button>
                      <p className="mt-2 text-xs text-neutral-500">
                        Si el pago ya fue registrado, quedará pendiente la gestión del reintegro.
                      </p>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
