import { Link } from 'react-router-dom'

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80'

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-brand"
        >
          <BackIcon />
          Volver al inicio
        </Link>

        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <h1 className="mt-10 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base text-neutral-500">{subtitle}</p> : null}

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-8 text-sm text-neutral-600">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img src={AUTH_IMAGE} alt="Partido de fútbol en cancha" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/80 via-neutral-950/40 to-brand/30" />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-60" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex justify-end">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md">
              Villa del Rosario
            </span>
          </div>

          <div className="max-w-md">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Matchear</p>
            <blockquote className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
              Tu próximo partido empieza acá.
            </blockquote>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Reservá canchas, organizá torneos y unite a la comunidad de fútbol más activa de la zona.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
