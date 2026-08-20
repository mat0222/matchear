/**
 * Avisa si el build de producción no tiene Firebase configurado.
 * Vite inyecta VITE_* en build time — deben estar en el hosting (Vercel/Netlify).
 */
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod')
const missing = required.filter((key) => !process.env[key]?.trim())

if (isProd && missing.length > 0) {
  console.warn('\n⚠️  BUILD SIN FIREBASE — la web usará modo local (localStorage).')
  console.warn('   Faltan:', missing.join(', '))
  console.warn('   Configurá esas variables en Vercel/Netlify y volvé a desplegar.')
  console.warn('   Ver DEPLOY.md\n')
}
