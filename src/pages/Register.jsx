import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { useAuth } from '../auth/AuthProvider'
import { sanitizeReturnTo } from '../lib/security'
import { inputClass, labelClass } from '../lib/form'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, backend } = useAuth()
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
      const res = await register({
        name: String(fd.get('name')),
        email: String(fd.get('email')),
        password: String(fd.get('password')),
      })
      if (!res.ok) {
        setError(res.message || 'Revisá los datos ingresados o usá otro email.')
        return
      }
      goNext()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Unite a Matchear en segundos y empezá a reservar canchas con los mejores precios."
      footer={
        <>
          <span>¿Ya tenés cuenta? </span>
          <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-bold text-brand hover:underline">
            Iniciar sesión
          </Link>
          {backend === 'local' ? (
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
          <label htmlFor="name" className={labelClass}>
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            className={inputClass}
          />
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
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className={inputClass}
            placeholder="Mín. 8 caracteres, letra y número"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Mínimo 8 caracteres, con al menos una letra y un número.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 ring-1 ring-white/25 transition hover:brightness-105 hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthShell>
  )
}
