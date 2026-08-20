import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

const HERO_IMG =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=960&q=65'

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
      <section className="relative min-h-[calc(100vh-4.75rem-0.25rem)] overflow-hidden bg-neutral-950">
        <img
          src={HERO_IMG}
          alt="Partido de fútbol bajo reflectores"
          fetchPriority="high"
          decoding="async"
          width={960}
          height={540}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.75rem-0.25rem)] max-w-7xl flex-col justify-end px-4 pb-10 pt-20 sm:px-6 sm:pb-12 lg:justify-center lg:px-8 lg:pb-24 lg:pt-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white">
              <span className="h-2 w-2 rounded-full bg-brand" />
              En juego · Reservá en minutos
            </span>

            <h1 className="mt-6 text-balance text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Tu cancha.
              <span className="block text-brand">Tu horario.</span>
              <span className="block">Tu partido.</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base font-medium leading-relaxed text-white/85 sm:text-lg">
              Alquilá canchas de fútbol en Villa del Rosario con precios claros, turnos libres y confirmación al toque.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/canchas"
                className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-xl shadow-brand/40 transition hover:brightness-110"
              >
                Ver canchas
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/registro"
                className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/20"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-16 lg:max-w-3xl">
            {[
              { label: 'Canchas', value: '5v5 a 9v9' },
              { label: 'Horario', value: '09 a 22 hs' },
              { label: 'Ubicación', value: 'Villa del Rosario' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-black/35 px-5 py-4"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand">{stat.label}</p>
                <p className="mt-1 text-sm font-extrabold text-white sm:text-base">{stat.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
            <MapPinIcon className="h-4 w-4 text-brand" />
            Córdoba, Argentina
          </p>
        </div>
      </section>

      <section className="relative border-b border-neutral-100 bg-white px-4 py-20 sm:px-6">
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
            {features.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 shadow-card transition hover:border-brand/20"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand ring-1 ring-brand/15">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="relative mt-5 text-xl font-bold text-neutral-950">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">{item.text}</p>
              </article>
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
                className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm"
              >
                <div className="flex gap-4 p-6 sm:p-7">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-sm font-extrabold text-white">
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
