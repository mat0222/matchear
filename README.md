# Matchear

Plataforma web para un complejo de fútbol en **Villa del Rosario, Córdoba**. Permite explorar canchas, reservar turnos con día y horario, gestionar pagos (seña o total) y acceder a secciones informativas del predio: torneos, instalaciones, turnos fijos, escuelita y contacto.

> Proyecto frontend en etapa de **prototipo funcional**. La autenticación y las reservas persisten en el navegador (`localStorage`). Para producción se recomienda conectar un backend y un proveedor de pagos real.

---

## Contexto

Matchear nace como sitio institucional + flujo de reservas para un complejo deportivo. El objetivo es que un jugador pueda:

1. Conocer el complejo y sus servicios.
2. Registrarse o iniciar sesión con email y contraseña.
3. Elegir una cancha (5v5, 7v7, 8v8, 9v9), día, horario y forma de pago.
4. Confirmar la reserva y verla en **Mis reservas**.

Además incluye landings para **torneos**, **turnos fijos**, **instalaciones**, **escuelita de fútbol** y **contacto**, con formularios de consulta listos para conectar a un backend.

---

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Inicio** | Landing con propuesta de valor y CTA a registro/canchas |
| **Canchas** | Catálogo de formatos con precios y enlace a reserva |
| **Reserva** | Día, horario, pago; al confirmar abre WhatsApp al dueño con el mensaje listo (`wa.me`) |
| **Pagos** | Seña fija o pago total · Efectivo, tarjeta o transferencia |
| **Auth** | Registro/login por email y contraseña |
| **Mis reservas** | Historial, pago de señas y **cancelación de turnos** |
| **Torneos** | Cómo organizar un campeonato + formato de ejemplo |
| **El complejo** | Instalaciones, turnos fijos, escuelita y contacto |

---

## Tecnologías

| Área | Stack |
|------|--------|
| **Framework** | React 19 |
| **Build** | Vite 7 |
| **Routing** | React Router 7 |
| **Estilos** | Tailwind CSS 3 |
| **Auth** | Firebase Authentication (email/contraseña) |
| **Persistencia** | `localStorage` (prototipo) |
| **Lint** | ESLint 9 |

**Tipografía:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## Requisitos

- **Node.js** 18 o superior (recomendado 20+)
- **npm** 9+

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/Proyecto-matchear.git
cd Proyecto-matchear

# Instalar dependencias
npm install

# Variables de entorno (ver FIREBASE.md)
cp .env.example .env

# Servidor de desarrollo
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Previsualizar el build localmente |
| `npm run lint` | Ejecutar ESLint |

---

## Variables de entorno

Creá un archivo `.env` en la raíz (no se sube a Git):

```env
VITE_WHATSAPP_OWNER=5493511234567
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAIL=tu-email-admin@ejemplo.com
```

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `VITE_WHATSAPP_OWNER` | Recomendada | Número del complejo para avisos wa.me |
| `VITE_FIREBASE_*` | Para producción | Config de la app web en Firebase |
| `VITE_ADMIN_EMAIL` | Recomendada | Email admin (debe coincidir con `firestore.rules`) |

Detalle del setup: **[FIREBASE.md](./FIREBASE.md)**

> Nunca subas el archivo `.env` real. Solo `.env.example` con valores vacíos/placeholder.


---

## Estructura del proyecto

```
src/
├── auth/           # AuthProvider, rutas protegidas
├── components/     # Navbar, Logo, PageShell, formularios compartidos
├── lib/            # storage, seed, slots, seguridad, utilidades
├── pages/          # Vistas por ruta
├── App.jsx         # Router con lazy loading
└── main.jsx        # Entry point + providers
public/
└── logo-matchear.png
```

---

## Rutas principales

| Ruta | Acceso |
|------|--------|
| `/` | Público |
| `/canchas` | Público |
| `/canchas/:id` | Público (reserva requiere login) |
| `/torneos` | Público |
| `/instalaciones`, `/turnos-fijos`, `/escuelita`, `/contacto` | Público |
| `/login`, `/registro` | Público |
| `/mis-reservas` | Requiere sesión |

---

## Desplegar en producción

Guía para activar Firebase en Vercel/Netlify: **[DEPLOY.md](./DEPLOY.md)**

Las variables `VITE_FIREBASE_*` deben cargarse en el hosting **antes** del build y luego redeploy.

---

## Seguridad (estado actual)

Con **Firebase configurado** (`VITE_FIREBASE_*` en `.env`):

- Auth real (email/contraseña) vía Firebase Authentication.
- Usuarios y reservas en **Cloud Firestore** con reglas de seguridad.
- Candados de horario (`slotLocks`) para evitar dobles reservas.
- Rol **admin** y panel en `/admin` (ver `FIREBASE.md`).

Sin Firebase, la app cae a modo **local** (`localStorage`) solo para prototipar.

Guía completa: **[FIREBASE.md](./FIREBASE.md)**


---

## Próximos pasos sugeridos

- [x] Firebase Auth + Firestore para usuarios y reservas
- [x] Panel admin básico
- [ ] Integración de pagos (Mercado Pago, Stripe, etc.)
- [ ] Deploy (Vercel, Netlify, etc.) con HTTPS
- [ ] Custom claims admin vía Cloud Functions (opcional, más robusto)

---

## Licencia

Proyecto privado. Todos los derechos reservados.
