import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

const HERO_BG =
  "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.72) 100%), url('https://images.unsplash.com/photo-1529900748594-e0ca187d6642?auto=format&fit=crop&w=2000&q=80')"
const CLEATS_IMG =
  'https://images.unsplash.com/photo-1614632537423-23e93acf2f61?auto=format&fit=crop&w=800&q=80'

function MapPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
}

const features = [
  {
    title: 'Mejores precios',
    text: 'Descuentos reales en canchas verificadas cerca de vos.',
    icon: (
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Reserva fácil',
    text: 'Elegí horario, tipo de cancha y listo. Sin vueltas.',
    icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" />,
  },
  {
    title: 'Comunidad',
    text: 'Organizá partidos y encontrá rivales de tu nivel.',
    icon: (
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
]

export default function Home() {
  return (
    <PageShell>
      <section
        className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden bg-neutral-950 bg-cover bg-center px-4 py-24 text-center sm:px-6"
        style={{ backgroundImage: HERO_BG }}
      >
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex max-w-4xl flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md sm:text-[0.7rem]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_12px_#FF4B4B]" />
            Reservá canchas en minutos
          </span>

          <div className="mb-8 flex justify-center">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
              <img
                src={CLEATS_IMG}
                alt=""
                className="h-24 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:h-32"
              />
            </div>
          </div>

          <h1 className="text-balance text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.05]">
            ¡Alquila y ahorra en canchas de fútbol en tu ciudad!
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base font-medium text-white/85 sm:text-lg">
            Obtén grandes descuentos y empezá a ahorrar con Matchear. Canchas listas, precios claros.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
              <MapPinIcon className="h-5 w-5 text-brand" />
              Villa del Rosario, Córdoba
            </span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/registro"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-dark px-10 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-xl shadow-brand/40 ring-2 ring-white/25 transition hover:brightness-110 hover:shadow-glow"
            >
              ¡Regístrate hoy!
            </Link>
            <Link
              to="/canchas"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border-2 border-white/40 bg-white/10 px-10 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Ver canchas
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-b border-neutral-100 bg-white px-4 py-20 sm:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-muted/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Ventajas</p>
            <h2 className="mt-3 text-3xl font-extrabold text-neutral-950 sm:text-4xl">
              ¿Por qué elegir Matchear?
            </h2>
            <p className="mt-4 text-neutral-600">
              Diseñamos la experiencia para que jugar sea simple: menos vueltas, más partidos.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, i) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-muted/80 transition group-hover:bg-brand/15" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand ring-1 ring-brand/15">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="relative mt-5 text-xl font-bold text-neutral-950">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">{item.text}</p>
                <div className="relative mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-brand-dark opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-[5.5rem] border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Ayuda</p>
            <h2 className="mt-3 text-3xl font-extrabold text-neutral-950 sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <dl className="mt-12 space-y-4">
            {[
              {
                q: '¿Cómo reservo una cancha?',
                a: 'Entrá a Canchas, elegí el formato y tocá "Reservar ahora". Con tu cuenta guardamos tus reservas y preferencias.',
              },
              {
                q: '¿Puedo cancelar?',
                a: 'Sí. Las políticas dependen de cada predio; las vas a ver antes de confirmar el pago o la reserva.',
              },
              {
                q: '¿Hay iluminación nocturna?',
                a: 'La mayoría cuenta con LED de calidad. El detalle figura en cada tarjeta de cancha.',
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:border-brand/25 hover:shadow-md"
              >
                <div className="flex gap-4 p-6 sm:p-7">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-sm font-extrabold text-white shadow-md shadow-brand/25">
                    {idx + 1}
                  </span>
                  <div>
                    <dt className="font-bold text-neutral-950">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</dd>
                  </div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark py-16 text-center sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-red-shine opacity-90" />
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 px-4">
          <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">¿Listo para jugar?</p>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-white/85">
            Unite hoy y encontrá tu próxima cancha en segundos.
          </p>
          <Link
            to="/canchas"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-10 py-3.5 text-sm font-extrabold text-brand shadow-xl transition hover:bg-brand-muted"
          >
            Explorar canchas
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
