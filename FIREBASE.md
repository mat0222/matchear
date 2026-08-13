# Configurar Firebase (Matchear)

Guía paso a paso para autenticación real, reservas en la nube y cuenta admin.

## 1. Crear el proyecto

1. Entrá a [Firebase Console](https://console.firebase.google.com/).
2. **Add project** → nombre `matchear` (o el que prefieras).
3. Desactivá Analytics si no lo necesitás.

## 2. App Web

1. En el proyecto: ícono **Web** (`</>`).
2. Registrá la app (nickname: `matchear-web`).
3. Copiá el objeto `firebaseConfig` a tu `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=TU_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=TU_PROJECT
VITE_FIREBASE_STORAGE_BUCKET=TU_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=tu-email-admin@gmail.com
```

4. Reiniciá `npm run dev`.

## 3. Authentication

1. **Build → Authentication → Get started**.
2. Habilitá **Email/Password**.
3. En **Settings → Authorized domains**, sumá `localhost` (ya viene) y tu dominio de producción.

## 4. Firestore

1. **Build → Firestore Database → Create database**.
2. Modo: empezá en **production mode**.
3. Pegá las reglas de `firestore.rules` (botón **Rules** → Publish).
4. **Importante:** en `firestore.rules`, cambiá el email de bootstrap:

```
request.auth.token.email.lower() == 'tu-email-admin@gmail.com'
```

Debe ser el mismo que `VITE_ADMIN_EMAIL`.

5. En **Indexes**, creá los compuestos de `firestore.indexes.json` (o esperá el link de error la primera vez que consultes).

## 5. Crear la cuenta admin

**Opción A (recomendada):**

1. Registrá en la web con el email de `VITE_ADMIN_EMAIL`.
2. Si las reglas y el env coinciden, el perfil queda con `role: "admin"`.
3. Deberías ver el link **Admin** en el navbar y entrar a `/admin`.

**Opción B (manual):**

1. Registrate con cualquier email.
2. En Firebase → Authentication, copiá el **User UID**.
3. Firestore → colección `users` → documento `{uid}` → campo `role` = `admin` (string).
4. Recargá la web.

## 6. Seguridad

| Capa | Qué hace |
|------|----------|
| Firebase Auth | Contraseñas y sesión gestionadas por Firebase |
| Firestore Rules | Cada usuario solo ve/edita sus reservas; admin ve todas |
| `slotLocks` | Transacción evita doble reserva del mismo horario |
| Rate limits | Límites anti abuso en el cliente |
| Rol `admin` | No se puede auto-asignar (salvo el email bootstrap en rules) |

Para pagos reales usá Mercado Pago / Stripe en un backend.

## 7. Modo local (sin Firebase)

Si faltan las variables `VITE_FIREBASE_*`, la app usa `localStorage` (prototipo). No es seguro para producción.
