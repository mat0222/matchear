import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { useAuth } from '../auth/AuthProvider'
import { sanitizeReturnTo } from '../lib/security'
import { inputClass, labelClass } from '../lib/form'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, backend } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const returnTo = sanitizeReturnTo(searchParams.get('returnTo'))

  function goNext() {
    navigate(returnTo, { replace: true })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    if (String(fd.get('company_website') || '').trim()) {
      setLoading(false)
      return
    }

    try {
      const res = await login(String(fd.get('email')), String(fd.get('password')))
      if (!res.ok) {
        setError(res.message || 'Email o contraseña incorrectos.')
        return
      }
      goNext()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="¡Bienvenido de nuevo! Ingresá a tu cuenta para reservar y gestionar tus partidos."
      footer={
        <>
          <span>¿No tenés cuenta? </span>
          <Link to={`/registro?returnTo=${encodeURIComponent(returnTo)}`} className="font-bold text-brand hover:underline">
            Registrate gratis
          </Link>
          {backend === 'local' && import.meta.env.DEV ? (
            <p className="mt-2 text-xs text-amber-700">
              Modo local (sin Firebase). Configurá VITE_FIREBASE_* en .env para producción.
            </p>
          ) : null}
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="company_website">Sitio web</label>
          <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={inputClass}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            maxLength={128}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 ring-1 ring-white/25 transition hover:brightness-105 hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthShell>
  )
}
