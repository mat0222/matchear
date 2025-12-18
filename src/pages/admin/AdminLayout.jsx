import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../../components/Logo.jsx'
import { useAuth } from '../../auth/AuthProvider.jsx'

const itemBase =
  'rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
const itemActive = 'bg-slate-100 text-slate-950'

export function AdminLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="text-sm font-extrabold text-slate-900">Admin</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-slate-600 md:block">
              {user?.email}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 active:bg-rose-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <aside className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? itemActive : ''}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/canchas"
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? itemActive : ''}`
                }
              >
                Canchas
              </NavLink>
              <NavLink
                to="/admin/ingresos"
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? itemActive : ''}`
                }
              >
                Ingresos & Estadísticas
              </NavLink>
              <NavLink
                to="/admin/ocupacion"
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? itemActive : ''}`
                }
              >
                Ocupación
              </NavLink>
              <Link
                to="/"
                className="mt-4 inline-flex w-full justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver sitio
              </Link>
            </nav>
          </aside>

          <section>
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  )
}



