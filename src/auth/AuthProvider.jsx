import { isFirebaseConfigured } from '../lib/firebase.js'
import { FirebaseAuthProvider } from './FirebaseAuthProvider.jsx'
import { LocalAuthProvider } from './LocalAuthProvider.jsx'

export { useAuth } from './authContext.js'

/**
 * Usa Firebase si hay variables VITE_FIREBASE_* configuradas.
 * Si no, cae al prototipo local (localStorage) para desarrollo.
 */
export function AuthProvider({ children }) {
  if (isFirebaseConfigured) {
    return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>
}
