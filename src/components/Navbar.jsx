import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

const navItemBase =
  'text-sm font-medium text-slate-700 hover:text-slate-900 transition'
const navItemActive = 'text-slate-950'

export function Navbar({ ctaLabel = 'Únete', ctaTo = '/login' }) {
  const { isAuthed, role, logout } = useAuth()

  return (
    <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : ''}`
            }
          >
            Portada
          </NavLink>
          <NavLink
            to="/canchas"
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : ''}`
            }
          >
            Canchas
          </NavLink>
          {isAuthed && role !== 'admin' ? (
            <NavLink
              to="/mis-reservas"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? navItemActive : ''}`
              }
            >
              Mis reservas
            </NavLink>
          ) : null}
          <a href="#faq" className={navItemBase}>
            Preguntas Frecuentes
          </a>
        </nav>

        {isAuthed ? (
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 active:bg-rose-600"
          >
            Salir
          </button>
        ) : (
          <Link
            to={ctaTo}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 active:bg-rose-600"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  )
}



