import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../auth/AuthProvider'
import { formatARS } from '../lib/time'

export default function Canchas() {
  const { listPitches } = useAuth()
  const courts = listPitches()

  return (
    <PageShell>
      <div className="relative overflow-hidden border-b border-neutral-100 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,75,75,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Catálogo</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">
              Nuestras canchas
            </h1>
            <p className="mt-4 text-neutral-600">
              Elegí el formato, día, horario y forma de pago. Reservá en minutos.
            </p>
            <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-brand to-brand-dark" />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courts.map((c) => (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand px-4 py-12 text-center text-white">
                  <div className="pointer-events-none absolute inset-0 bg-red-shine opacity-80" />
                  <div className="relative">
                    <span className="text-4xl font-black tracking-tighter drop-shadow-md">{c.size}</span>
                    <p className="mt-2 text-sm font-semibold text-white/90">{c.players} jugadores</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-extrabold text-neutral-950">{c.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{c.description}</p>
                  <p className="mt-3 text-sm font-extrabold text-brand">{formatARS(c.price)} / hora</p>
                  <Link
                    to={`/canchas/${c.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 ring-1 ring-white/20 transition group-hover:shadow-glow"
                  >
                    Reservar ahora
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark py-16 text-center sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-red-shine opacity-90" />
        <p className="relative z-10 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ¿Listo para jugar?
        </p>
        <p className="relative z-10 mx-auto mt-3 max-w-md px-4 text-sm font-medium text-white/85">
          Elegí tu cancha, día y horario. Pagá con seña o el total.
        </p>
      </section>
    </PageShell>
  )
}
