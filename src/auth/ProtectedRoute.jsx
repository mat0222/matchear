import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { sanitizeReturnTo } from '../lib/security.js'

export function ProtectedRoute() {
  const { isAuthed, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!isAuthed) {
    const returnTo = sanitizeReturnTo(
      `${location.pathname}${location.search}${location.hash}`,
    )
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return <Outlet />
}
