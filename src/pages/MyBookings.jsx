import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { Countdown } from '../components/Countdown'
import { useAuth } from '../auth/AuthProvider'
import { formatARS } from '../lib/time'

function statusLabel(b) {
  if (b.status === 'pending_payment') return 'Pendiente de pago'
  if (b.status === 'reserved') return 'Reservada'
  if (b.status === 'confirmed') return 'Confirmada'
  if (b.status === 'cancelled') return 'Cancelada'
  return b.status
}

export default function MyBookings() {
  const { myBookings, payDeposit } = useAuth()
  const bookings = myBookings()

  return (
    <PageShell>
      <PageHeader
        eyebrow="Tu cuenta"
        title="Mis reservas"
        description="Acá ves tus turnos confirmados y los pagos de seña pendientes."
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
