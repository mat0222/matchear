import { useAuth } from '../../auth/AuthProvider.jsx'

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

export function AdminDashboard() {
  const { stats } = useAuth()
  const s = stats()

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Resumen rápido del estado de Matchear (datos en localStorage).
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Ingresos
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatARS(s.totalRevenue)}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Reservas
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.bookingsCount}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Canchas
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.pitchesCount}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Pagos (por método)
          </div>
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            {Object.keys(s.byMethod).length === 0 ? (
              <div className="text-slate-500">Sin datos aún</div>
            ) : (
              Object.entries(s.byMethod).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="capitalize">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



