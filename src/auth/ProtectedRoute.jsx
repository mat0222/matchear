import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export function ProtectedRoute({ allowRoles }) {
  const { isAuthed, role } = useAuth()

  if (!isAuthed) {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }
  if (allowRoles && !allowRoles.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}


