import { useMemo, useState } from 'react'
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

function dayKey(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

export function AdminRevenue() {
  const { store, stats } = useAuth()
  const s = stats()

  const [days, setDays] = useState(14)

  const chart = useMemo(() => {
    const now = Date.now()
    const cutoff = now - days * 24 * 60 * 60 * 1000
    const payments = store.payments.filter((p) => (p.createdAt || 0) >= cutoff)
    const byDay = payments.reduce((acc, p) => {
      const k = dayKey(p.createdAt || now)
      acc[k] = (acc[k] || 0) + (p.amount || 0)
      return acc
    }, {})

    const keys = Object.keys(byDay).sort()
    const max = keys.reduce((m, k) => Math.max(m, byDay[k]), 0) || 1
    return { keys, byDay, max }
  }, [store.payments, days])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ingresos & Estadísticas
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Métricas básicas a partir de reservas/pagos simulados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Ventana
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          >
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={30}>30 días</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Ingresos totales
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatARS(s.totalRevenue)}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Reservas totales
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.bookingsCount}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Pagos (métodos)
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
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Canchas
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.pitchesCount}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900">
            Ingresos por día
          </div>
          <div className="text-xs font-semibold text-slate-500">
            últimos {days} días
          </div>
        </div>

        {chart.keys.length === 0 ? (
          <div className="mt-6 text-sm text-slate-500">
            Todavía no hay pagos. Hacé una reserva desde una cancha como usuario
            para generar ingresos.
          </div>
        ) : (
          <div className="mt-6 grid gap-2">
            {chart.keys.map((k) => {
              const v = chart.byDay[k]
              const pct = Math.round((v / chart.max) * 100)
              return (
                <div key={k} className="grid grid-cols-[90px_1fr_90px] gap-3">
                  <div className="text-xs font-semibold text-slate-600">{k}</div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right text-xs font-semibold text-slate-700">
                    {formatARS(v)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



