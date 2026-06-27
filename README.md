# Matchear

Plataforma web para un complejo de fútbol en **Villa del Rosario, Córdoba**. Permite explorar canchas, reservar turnos con día y horario, gestionar pagos (seña o total) y acceder a secciones informativas del predio: torneos, instalaciones, turnos fijos, escuelita y contacto.

> Proyecto frontend en etapa de **prototipo funcional**. La autenticación y las reservas persisten en el navegador (`localStorage`). Para producción se recomienda conectar un backend y un proveedor de pagos real.

---

## Contexto

Matchear nace como sitio institucional + flujo de reservas para un complejo deportivo. El objetivo es que un jugador pueda:

1. Conocer el complejo y sus servicios.
2. Registrarse o iniciar sesión (email o Google).
3. Elegir una cancha (5v5, 7v7, 8v8, 9v9), día, horario y forma de pago.
4. Confirmar la reserva y verla en **Mis reservas**.

Además incluye landings para **torneos**, **turnos fijos**, **instalaciones**, **escuelita de fútbol** y **contacto**, con formularios de consulta listos para conectar a un backend.

---

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Inicio** | Landing con propuesta de valor y CTA a registro/canchas |
| **Canchas** | Catálogo de formatos con precios y enlace a reserva |
| **Reserva** | Selector de 7 días, horarios 09:00–21:00, disponibilidad en tiempo real |
| **Pagos** | Seña fija o pago total · Efectivo, tarjeta o transferencia |
| **Auth** | Registro/login por email · Google OAuth (o modo demo sin Client ID) |
| **Mis reservas** | Historial del usuario y pago de señas pendientes |
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
| **Auth Google** | [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) |
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

# Variables de entorno (opcional, para Google real)
cp .env.example .env
# Editar .env y agregar VITE_GOOGLE_CLIENT_ID si lo tenés

# Servidor de desarrollo
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Previsualizar el build localmente |
| `npm run lint` | Ejecutar ESLint |

---

## Variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | No | Client ID de Google Cloud Console. Sin ella, el botón de Google funciona en **modo demo** local. |

Configuración de Google OAuth: [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials). Agregá `http://localhost:5173` como origen autorizado en desarrollo.

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

## Seguridad (estado actual)

- Contraseñas almacenadas con **hash SHA-256 + salt** en el cliente.
- Sesión con **expiración a 7 días**.
- Sanitización de redirects (`returnTo`) e inputs básicos.
- El store completo **no se expone** en el contexto de React (solo datos públicos del usuario).

**Limitación:** al no haber backend, un usuario técnico puede inspeccionar o modificar `localStorage`. Esto es aceptable para demo/MVP, no para producción con pagos reales.

---

## Próximos pasos sugeridos

- [ ] API REST o Supabase/Firebase para usuarios y reservas
- [ ] Integración de pagos (Mercado Pago, Stripe, etc.)
- [ ] Panel de administración del complejo
- [ ] Emails / WhatsApp de confirmación
- [ ] Deploy (Vercel, Netlify, etc.) con HTTPS

---

## Licencia

Proyecto privado. Todos los derechos reservados.
