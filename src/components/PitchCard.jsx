import { Link } from 'react-router-dom'

export function PitchCard({ to, size, players, title, description, meta }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10 ring-1 ring-black/5">
      <div className="bg-gradient-to-b from-emerald-400 to-emerald-600 p-10 text-center text-white">
        <div className="text-6xl font-extrabold tracking-tight">{size}</div>
        <div className="mt-2 text-sm font-semibold opacity-90">{players}</div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {meta ? (
          <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
            {meta}
          </div>
        ) : null}
        <Link
          to={to}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 active:bg-rose-600"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  )
}


