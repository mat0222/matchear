import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Logo } from './Logo'

const COMPLEJO_LINKS = [
  { to: '/instalaciones', label: 'Instalaciones' },
  { to: '/turnos-fijos', label: 'Turnos fijos' },
  { to: '/escuelita', label: 'Escuelita de fútbol' },
  { to: '/contacto', label: 'Contacto' },
]

const COMPLEJO_PATHS = COMPLEJO_LINKS.map((link) => link.to)

function MenuIcon({ open }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-center">
      <span
        className={`h-0.5 rounded-full bg-current transition ${
          open ? 'translate-y-1.5 rotate-45' : ''
        }`}
      />
      <span className={`my-1.5 h-0.5 rounded-full bg-current transition ${open ? 'opacity-0' : ''}`} />
      <span
        className={`h-0.5 rounded-full bg-current transition ${
          open ? '-translate-y-1.5 -rotate-45' : ''
        }`}
      />
    </span>
  )
}

function NavPillLink({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-white text-brand shadow-sm ring-1 ring-neutral-200/80'
            : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function ChevronDown({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function NavPillDropdown() {
  const { pathname } = useLocation()
  const isActive = COMPLEJO_PATHS.some((path) => pathname === path)

  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className={`inline-flex items-center gap-0.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-white text-brand shadow-sm ring-1 ring-neutral-200/80'
            : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
        }`}
      >
        El Complejo
        <ChevronDown className="h-4 w-4 opacity-70 transition group-hover:rotate-180" />
      </button>

      <div className="invisible absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-lg ring-1 ring-neutral-100">
          {COMPLEJO_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive: linkActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  linkActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [complejoOpen, setComplejoOpen] = useState(false)
  const { pathname } = useLocation()
  const { isAuthed, user, logout } = useAuth()
  const complejoSectionActive = COMPLEJO_PATHS.some((path) => pathname === path)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setOpen(false)
    setComplejoOpen(false)
  }, [pathname])

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-[110] border-b border-neutral-200/60 bg-white/90 shadow-nav backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-2 lg:flex">
          <div className="flex rounded-full bg-neutral-100/90 p-1.5 ring-1 ring-neutral-200/60">
            <NavPillLink to="/" end>
              Inicio
            </NavPillLink>
            <NavPillLink to="/canchas">Canchas</NavPillLink>
            <NavPillLink to="/torneos">Torneos</NavPillLink>
            <NavPillDropdown />
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthed ? (
            <>
              <Link
                to="/mis-reservas"
                className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                Mis reservas
              </Link>
              <span className="max-w-[8rem] truncate text-sm font-semibold text-neutral-600">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-brand/30 hover:text-brand"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/30 ring-1 ring-white/25 transition hover:brightness-105 hover:shadow-glow"
              >
                Únete
                <svg className="h-4 w-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-brand/30 hover:text-brand lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 top-[4.75rem] z-[100] flex flex-col bg-white/98 px-6 pb-10 pt-6 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-2 shadow-inner">
            <NavLink
              to="/"
              end
              onClick={close}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3.5 text-base font-semibold ${
                  isActive ? 'bg-white text-brand shadow-sm' : 'text-neutral-700'
                }`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/canchas"
              onClick={close}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3.5 text-base font-semibold ${
                  isActive ? 'bg-white text-brand shadow-sm' : 'text-neutral-700'
                }`
              }
            >
              Canchas
            </NavLink>
            <NavLink
              to="/torneos"
              onClick={close}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3.5 text-base font-semibold ${
                  isActive ? 'bg-white text-brand shadow-sm' : 'text-neutral-700'
                }`
              }
            >
              Torneos
            </NavLink>

            <div className="mt-1 border-t border-neutral-200/80 pt-1">
              <button
                type="button"
                aria-expanded={complejoOpen}
                onClick={() => setComplejoOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold ${
                  complejoSectionActive ? 'bg-white text-brand shadow-sm' : 'text-neutral-700'
                }`}
              >
                El Complejo
                <ChevronDown
                  className={`h-5 w-5 opacity-70 transition ${complejoOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {complejoOpen ? (
                <div className="mb-1 mt-1 flex flex-col gap-0.5 pl-2">
                  {COMPLEJO_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={close}
                      className={({ isActive }) =>
                        `rounded-lg px-4 py-2.5 text-sm font-semibold ${
                          isActive ? 'bg-brand/10 text-brand' : 'text-neutral-600'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {isAuthed ? (
              <>
                <Link
                  to="/mis-reservas"
                  onClick={close}
                  className="rounded-xl border border-neutral-200 bg-white py-3.5 text-center text-base font-semibold text-neutral-800 shadow-sm"
                >
                  Mis reservas
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    close()
                  }}
                  className="rounded-xl bg-neutral-100 py-3.5 text-center text-base font-semibold text-neutral-800"
                >
                  Cerrar sesión ({user?.name})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="rounded-xl border border-neutral-200 bg-white py-3.5 text-center text-base font-semibold text-neutral-800 shadow-sm"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={close}
                  className="rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-center text-base font-bold text-white shadow-lg shadow-brand/25"
                >
                  Únete gratis
                </Link>
              </>
            )}
          </div>
          <p className="mt-auto text-center text-xs text-neutral-400">Matchear · Villa del Rosario</p>
        </div>
      ) : null}
    </header>
  )
}
