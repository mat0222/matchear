import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { sanitizeReturnTo } from '../lib/security.js'

export function ProtectedRoute() {
  const { isAuthed } = useAuth()
  const location = useLocation()

  if (!isAuthed) {
    const returnTo = sanitizeReturnTo(
      `${location.pathname}${location.search}${location.hash}`,
    )
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return <Outlet />
}
