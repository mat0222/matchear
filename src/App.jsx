import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Canchas = lazy(() => import('./pages/Canchas'))
const PitchDetail = lazy(() => import('./pages/PitchDetail'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const Torneos = lazy(() => import('./pages/Torneos'))
const Instalaciones = lazy(() => import('./pages/Instalaciones'))
const TurnosFijos = lazy(() => import('./pages/TurnosFijos'))
const Escuelita = lazy(() => import('./pages/Escuelita'))
const Contacto = lazy(() => import('./pages/Contacto'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/canchas" element={<Canchas />} />
          <Route path="/canchas/:id" element={<PitchDetail />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/instalaciones" element={<Instalaciones />} />
          <Route path="/turnos-fijos" element={<TurnosFijos />} />
          <Route path="/escuelita" element={<Escuelita />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/mis-reservas" element={<MyBookings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
