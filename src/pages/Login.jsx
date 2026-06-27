import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { GoogleSignIn } from '../components/GoogleSignIn'
import { useAuth } from '../auth/AuthProvider'
import { parseGoogleCredential } from '../lib/google'
import { sanitizeReturnTo } from '../lib/security'
import { inputClass, labelClass } from '../lib/form'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, loginWithGoogle, loginWithGoogleDemo } = useAuth()
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
    try {
      const res = await login(String(fd.get('email')), String(fd.get('password')))
      if (!res.ok) {
        setError('Email o contraseña incorrectos.')
        return
      }
      goNext()
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleCredential(credential) {
    setError('')
    const profile = parseGoogleCredential(credential)
    if (!profile) {
      setError('No se pudo validar la cuenta de Google.')
      return
    }
    const res = loginWithGoogle(profile)
    if (!res.ok) {
      setError('No se pudo iniciar sesión con Google.')
      return
    }
    goNext()
  }

  function handleGoogleDemo() {
    setError('')
    const res = loginWithGoogleDemo()
    if (!res.ok) {
      setError('No se pudo iniciar sesión con Google.')
      return
    }
    goNext()
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="¡Bienvenido de nuevo! Ingresá a tu cuenta para reservar y gestionar tus partidos."
      googleSection={
        <GoogleSignIn label="login" onSuccess={handleGoogleCredential} onDemo={handleGoogleDemo} />
      }
      footer={
        <>
          <span>¿No tenés cuenta? </span>
          <Link to={`/registro?returnTo=${encodeURIComponent(returnTo)}`} className="font-bold text-brand hover:underline">
            Registrate gratis
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
        ) : null}
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
