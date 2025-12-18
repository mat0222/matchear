import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo.jsx'
import { Footer } from '../components/Footer.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

function useReturnTo() {
  const { search } = useLocation()
  return useMemo(() => {
    const params = new URLSearchParams(search)
    return params.get('returnTo') || ''
  }, [search])
}

export function Register() {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const onSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const res = register({ name, email, password })
    if (!res.ok) {
      setError('Ese email ya está registrado.')
      return
    }
    navigate(returnTo || '/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-6">
        <div className="flex justify-center py-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl shadow-black/10 ring-1 ring-black/5">
            <div className="flex justify-center">
              <Logo className="px-6 py-3 text-lg" />
            </div>

            <h1 className="mt-6 text-center text-2xl font-extrabold text-slate-900">
              Crear cuenta
            </h1>
            <p className="mt-1 text-center text-slate-500">
              Registrate para reservar tu cancha.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="register-name"
                  className="text-sm font-semibold text-slate-900"
                >
                  Nombre
                </label>
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="text-sm font-semibold text-slate-900"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="text-sm font-semibold text-slate-900"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              {error ? (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 active:bg-rose-600"
              >
                Registrarme
              </button>

              <div className="pt-3 text-center text-sm text-rose-500">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                  className="font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


