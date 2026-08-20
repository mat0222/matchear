/** Solo lectura de env — sin importar el SDK de Firebase (mejor code-splitting). */
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
)

export const ADMIN_EMAIL = String(import.meta.env.VITE_ADMIN_EMAIL || '')
  .trim()
  .toLowerCase()
