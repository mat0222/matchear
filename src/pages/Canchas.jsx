import { useMemo, useState } from 'react'
import { Navbar } from '../components/Navbar.jsx'
import { PitchCard } from '../components/PitchCard.jsx'
import { Footer } from '../components/Footer.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { pitchMatchesFilters, ROOFS, slotsForTimeWindow, SPORTS, SURFACES, TIME_WINDOWS } from '../lib/filters.js'
import { isoDay } from '../lib/time.js'

export function Canchas() {
  const { listPitches, listAvailability } = useAuth()
  const pitches = listPitches()

  const [sport, setSport] = useState('any')
  const [surface, setSurface] = useState('any')
  const [roof, setRoof] = useState('any')
  const [timeWindow, setTimeWindow] = useState('any')
  const [day, setDay] = useState(() => isoDay(new Date()))

  const filtered = useMemo(() => {
    const filters = { sport, surface, roof, timeWindow }
    const base = pitches.filter((p) => pitchMatchesFilters(p, filters))

    // Smart time filter: only show pitches with at least 1 free slot in that window for the selected day.
    const slots = slotsForTimeWindow(timeWindow)
    if (timeWindow === 'any') {
      return base.map((p) => ({ pitch: p, freeCount: null }))
    }

    return base
      .map((p) => {
        const availability = listAvailability({ pitchId: p.id, date: day, slots })
        const freeCount = availability.filter((a) => a.status === 'free').length
        return { pitch: p, freeCount }
      })
      .filter((x) => x.freeCount > 0)
  }, [pitches, sport, surface, roof, timeWindow, day, listAvailability])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-slate-900">
          Nuestras Canchas
        </h1>

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Deporte
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                <option value="any">Todos</option>
                {SPORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Superficie
              </label>
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                <option value="any">Todas</option>
                {SURFACES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Techo
              </label>
              <select
                value={roof}
                onChange={(e) => setRoof(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                <option value="any">Cualquiera</option>
                {ROOFS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Horario
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                {TIME_WINDOWS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {timeWindow !== 'any' ? (
            <div className="mt-4">
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Día
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const d = isoDay(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
                  const label = new Date(`${d}T00:00:00`).toLocaleDateString('es-AR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={
                        d === day
                          ? 'rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white'
                          : 'rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200'
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-bold text-slate-900">{filtered.length}</span>{' '}
              de <span className="font-bold text-slate-900">{pitches.length}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSport('any')
                setSurface('any')
                setRoof('any')
                setTimeWindow('any')
                setDay(isoDay(new Date()))
              }}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(({ pitch: p, freeCount }) => (
            <PitchCard
              key={p.id}
              to={`/canchas/${p.id}`}
              size={p.size}
              players={`${p.players} jugadores`}
              title={p.name}
              description={p.description}
              meta={
                typeof freeCount === 'number'
                  ? `${freeCount} turnos libres`
                  : null
              }
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center text-sm text-slate-600 shadow-sm ring-1 ring-black/5">
            No encontramos canchas con esos filtros.
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}


