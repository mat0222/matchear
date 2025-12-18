import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { buildHourlySlots } from '../../lib/slots.js'
import { isoDay } from '../../lib/time.js'

const SLOTS = buildHourlySlots({ startHour: 9, endHour: 22 })

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function prettyDay(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function cellClass(status) {
  if (status === 'occupied') return 'bg-slate-300 text-slate-700 cursor-not-allowed'
  if (status === 'blocked') return 'bg-amber-200 text-amber-900 hover:bg-amber-300'
  return 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
}

export function AdminOccupancy() {
  const { listPitches, listAvailability, toggleBlock } = useAuth()
  const pitches = listPitches()
  const [pitchId, setPitchId] = useState(() => pitches[0]?.id || '')
  const [mode, setMode] = useState('week') // 'week' | 'day'
  const [baseDay, setBaseDay] = useState(() => isoDay(new Date()))
  const [reason, setReason] = useState('mantenimiento')

  const days = useMemo(() => {
    const start = new Date(`${baseDay}T00:00:00`)
    const count = mode === 'week' ? 7 : 1
    return Array.from({ length: count }, (_, i) => isoDay(addDays(start, i)))
  }, [baseDay, mode])

  const pitch = pitches.find((p) => p.id === pitchId) || null

  const grid = useMemo(() => {
    if (!pitchId) return {}
    const byDay = {}
    for (const d of days) {
      const availability = listAvailability({ pitchId, date: d, slots: SLOTS })
      byDay[d] = availability.reduce((acc, a) => {
        acc[a.slot] = a.status
        return acc
      }, {})
    }
    return byDay
  }, [pitchId, days, listAvailability])

  const onToggle = ({ date, slot }) => {
    const status = grid?.[date]?.[slot]
    if (status === 'occupied') return
    toggleBlock({ pitchId, date, slot, reason })
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ocupación
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Vista diaria/semanal y bloqueo de horarios (mantenimiento/torneos).
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:grid-cols-4">
        <div className="md:col-span-1">
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Cancha
          </label>
          <select
            value={pitchId}
            onChange={(e) => setPitchId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          >
            {pitches.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {pitch ? (
            <div className="mt-2 text-xs text-slate-500">
              {pitch.size} • {pitch.players} jugadores
            </div>
          ) : null}
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Vista
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          >
            <option value="day">Diaria</option>
            <option value="week">Semanal</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Día base
          </label>
          <input
            type="date"
            value={baseDay}
            onChange={(e) => setBaseDay(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Motivo de bloqueo
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          >
            <option value="mantenimiento">Mantenimiento</option>
            <option value="torneo">Torneo</option>
            <option value="privado">Privado</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-auto">
          <table className="min-w-[760px] w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Hora
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500"
                  >
                    {prettyDay(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="sticky left-0 z-10 border-t border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    {slot}
                  </td>
                  {days.map((d) => {
                    const status = grid?.[d]?.[slot] || 'free'
                    return (
                      <td key={`${d}-${slot}`} className="border-t border-slate-100 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => onToggle({ date: d, slot })}
                          disabled={status === 'occupied'}
                          className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-wide ${cellClass(status)}`}
                          title={
                            status === 'occupied'
                              ? 'Ocupado'
                              : status === 'blocked'
                                ? 'Bloqueado (click para desbloquear)'
                                : 'Libre (click para bloquear)'
                          }
                        >
                          {status === 'occupied'
                            ? 'Ocupado'
                            : status === 'blocked'
                              ? 'Bloqueado'
                              : 'Libre'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-600">
          Click en un turno <span className="font-semibold">Libre</span> para bloquearlo.
          Click en <span className="font-semibold">Bloqueado</span> para desbloquearlo.
          Los turnos <span className="font-semibold">Ocupados</span> no se pueden modificar.
        </div>
      </div>
    </div>
  )
}


