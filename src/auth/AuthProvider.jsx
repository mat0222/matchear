import { lazy, Suspense } from 'react'
import { isFirebaseConfigured } from '../lib/firebaseConfig.js'
import { LocalAuthProvider } from './LocalAuthProvider.jsx'

export { useAuth } from './authContext.js'

const FirebaseAuthProvider = lazy(() =>
  import('./FirebaseAuthProvider.jsx').then((m) => ({ default: m.FirebaseAuthProvider })),
)

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  )
}

/**
 * Firebase si VITE_FIREBASE_* están en el build (local .env o variables del hosting).
 * Si no, modo local (localStorage) — solo para desarrollo.
 */
export function AuthProvider({ children }) {
  if (isFirebaseConfigured) {
    return (
      <Suspense fallback={<AuthLoading />}>
        <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
      </Suspense>
    )
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>
}
