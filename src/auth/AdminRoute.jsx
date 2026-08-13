import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

/** Solo usuarios con role === 'admin' */
export function AdminRoute() {
  const { isAuthed, isAdmin, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login?returnTo=/admin" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
