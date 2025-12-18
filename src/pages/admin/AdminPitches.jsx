import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { uid } from '../../lib/storage.js'

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

function toInt(value, fallback = 0) {
  const n = Number.parseInt(String(value || ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function normalizePhotos(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AdminPitches() {
  const { listPitches, upsertPitch, deletePitch } = useAuth()
  const pitches = listPitches()

  const [editingId, setEditingId] = useState(null)
  const editing = useMemo(
    () => pitches.find((p) => p.id === editingId) || null,
    [pitches, editingId],
  )

  const [form, setForm] = useState(() => ({
    id: '',
    name: '',
    sport: 'futbol',
    surface: 'sintetico',
    roof: 'descubierta',
    photosText: '/hero.jpg',
    size: '5v5',
    players: 10,
    price: 12000,
    description: 'Césped sintético de alta calidad, iluminación LED',
  }))

  const startNew = () => {
    setEditingId(null)
    setForm({
      id: uid('pitch'),
      name: '',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photosText: '/hero.jpg',
      size: '5v5',
      players: 10,
      price: 12000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    })
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({
      ...p,
      photosText: Array.isArray(p.photos) && p.photos.length ? p.photos.join(', ') : '/hero.jpg',
    })
  }

  const onSave = (e) => {
    e.preventDefault()
    upsertPitch({
      ...form,
      players: toInt(form.players, 10),
      price: toInt(form.price, 0),
      photos: normalizePhotos(form.photosText),
    })
    setEditingId(null)
    setForm({
      id: uid('pitch'),
      name: '',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photosText: '/hero.jpg',
      size: '5v5',
      players: 10,
      price: 12000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    })
  }

  const onDelete = (id) => {
    // eslint-disable-next-line no-alert
    if (confirm('¿Eliminar esta cancha?')) deletePitch(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Canchas
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Crear y editar canchas visibles para los usuarios.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-400 active:bg-rose-600"
        >
          + Nueva cancha
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="px-2 pb-3 text-sm font-extrabold text-slate-900">
            Listado
          </div>
          <div className="divide-y divide-slate-100">
            {pitches.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 p-3">
                <div>
                  <div className="font-extrabold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {p.size} • {p.players} jugadores • {formatARS(p.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {pitches.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No hay canchas.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-sm font-extrabold text-slate-900">
            {editing ? 'Editar cancha' : 'Crear cancha'}
          </div>

          <form onSubmit={onSave} className="mt-5 grid gap-4">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Tamaño
                </label>
                <select
                  value={form.size}
                  onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                >
                  <option>5v5</option>
                  <option>7v7</option>
                  <option>8v8</option>
                  <option>9v9</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Jugadores
                </label>
                <input
                  value={form.players}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, players: e.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Precio (ARS)
                </label>
                <input
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Deporte
                </label>
                <select
                  value={form.sport}
                  onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                >
                  <option value="futbol">Fútbol</option>
                  <option value="padel">Pádel</option>
                  <option value="tenis">Tenis</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Superficie
                </label>
                <select
                  value={form.surface}
                  onChange={(e) => setForm((f) => ({ ...f, surface: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                >
                  <option value="sintetico">Sintético</option>
                  <option value="cesped">Césped</option>
                  <option value="cemento">Cemento</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Techo
                </label>
                <select
                  value={form.roof}
                  onChange={(e) => setForm((f) => ({ ...f, roof: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                >
                  <option value="descubierta">Descubierta</option>
                  <option value="techada">Techada</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Fotos (URLs separadas por coma)
                </label>
                <input
                  value={form.photosText}
                  onChange={(e) => setForm((f) => ({ ...f, photosText: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  placeholder="/hero.jpg, https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Descripción
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-400 active:bg-rose-600"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={startNew}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



