# Desplegar Matchear con Firebase activo (Netlify)

En **Vite**, las variables `VITE_*` se embeben en el **build**. El `.env` de tu PC no llega a Netlify.

Si ves *"Modo local (sin Firebase)"*, faltan variables en Netlify o no se hizo un deploy **después** de guardarlas.

## 1. Variables en Netlify

**Site configuration → Environment variables → Add a variable** (o *Add a single variable*).

Marcá **All scopes** / Production + Deploy previews + Branch deploys.

| Variable | Dónde copiarla |
|----------|----------------|
| `VITE_FIREBASE_API_KEY` | Firebase → Project settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | id del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | bucket de Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | sender id |
| `VITE_FIREBASE_APP_ID` | app id web |
| `VITE_WHATSAPP_OWNER` | `.env` local (avisos WhatsApp) |
| `VITE_ADMIN_EMAIL` | `.env` local (cuenta admin) |

Sin espacios al inicio/final. Los nombres tienen que empezar con `VITE_`.

## 2. Redeploy obligatorio

**Deploys → Trigger deploy → Deploy site** (o *Clear cache and deploy site*).

Un deploy anterior **no** usa las variables nuevas.

## 3. Dominio en Firebase

**Firebase → Authentication → Settings → Authorized domains**:

- `localhost`
- `tu-sitio.netlify.app`
- tu dominio propio, si lo tenés

## 4. Comprobar

- `/registro` o `/login`: no tiene que aparecer el aviso amarillo de modo local.
- Creá una cuenta, recargá: si sigue la sesión, Firebase está activo.

Los valores salen de tu `.env` local o de Firebase Console → Project settings → Your apps → Web.
