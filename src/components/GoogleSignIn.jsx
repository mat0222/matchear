import { GoogleLogin } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from '../lib/google.js'
import { GoogleAuthButton } from './GoogleAuthButton.jsx'

export function GoogleSignIn({ onSuccess, onDemo, label }) {
  if (GOOGLE_CLIENT_ID) {
    return (
      <div className="[&>div]:!w-full [&>div>div]:!w-full">
        <GoogleLogin
          onSuccess={(res) => onSuccess(res.credential)}
          onError={() => onDemo?.()}
          text={label === 'register' ? 'signup_with' : 'signin_with'}
          shape="rectangular"
          size="large"
          width="100%"
          locale="es"
        />
      </div>
    )
  }

  return <GoogleAuthButton onClick={onDemo}>{label === 'register' ? 'Registrarse con Google' : 'Iniciar sesión con Google'}</GoogleAuthButton>
}
