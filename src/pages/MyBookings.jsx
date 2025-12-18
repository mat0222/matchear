import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar.jsx'
import { Footer } from '../components/Footer.jsx'
import { Countdown } from '../components/Countdown.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

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

function statusLabel(b) {
  if (b.status === 'pending_payment') return 'Pendiente de pago'
  if (b.status === 'reserved') return 'Reservada'
  if (b.status === 'confirmed') return 'Confirmada'
  if (b.status === 'cancelled') return 'Cancelada'
  return b.status
}

export function MyBookings() {
  const { myBookings, payDeposit } = useAuth()
  const bookings = myBookings()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar ctaLabel="Canchas" ctaTo="/canchas" />

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Mis reservas
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tus reservas y pagos (simulado).
            </p>
          </div>
          <Link
            to="/canchas"
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            Reservar otra cancha
          </Link>
        </div>

        <div className="mt-10 grid gap-6">
          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-600 shadow-sm ring-1 ring-black/5">
              No tenés reservas todavía.
            </div>
          ) : null}

          {bookings.map((b) => {
            const depositPayment = b.payments.find(
              (p) => p.mode === 'deposit' && (p.status === 'pending' || p.status === 'expired'),
            )
            const canPay =
              depositPayment && depositPayment.status === 'pending' && depositPayment.expiresAt
                ? depositPayment.expiresAt > Date.now()
                : Boolean(depositPayment && depositPayment.status === 'pending')

            return (
              <div
                key={b.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {b.pitch?.name || 'Cancha'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {b.date} • {b.slot} • {b.pitch?.size}
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-800">
                    {statusLabel(b)}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Precio
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">
                      {formatARS(b.pitch?.price || 0)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Seña / Vencimiento
                    </div>
                    {depositPayment ? (
                      <div className="mt-1 text-sm font-semibold text-slate-800">
                        {depositPayment.status === 'pending' ? (
                          <>
                            Pendiente • <Countdown expiresAt={depositPayment.expiresAt} />
                          </>
                        ) : (
                          <>Vencida</>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-slate-600">—</div>
                    )}
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Acciones
                    </div>
                    {depositPayment ? (
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => payDeposit({ paymentId: depositPayment.id })}
                        className={
                          canPay
                            ? 'mt-2 w-full rounded-full bg-rose-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-400'
                            : 'mt-2 w-full rounded-full bg-slate-200 px-4 py-2 text-xs font-extrabold text-slate-500 cursor-not-allowed'
                        }
                      >
                        Pagar seña (simulado)
                      </button>
                    ) : (
                      <div className="mt-1 text-sm text-slate-600">—</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/canchas/${b.pitchId}`}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-200"
                  >
                    Ver cancha
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}


