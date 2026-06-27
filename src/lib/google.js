export function parseGoogleCredential(credential) {
  if (!credential) return null
  try {
    const payload = credential.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(json)
    return {
      sub: data.sub,
      email: data.email,
      name: data.name || data.given_name || 'Usuario Google',
      picture: data.picture,
    }
  } catch {
    return null
  }
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
