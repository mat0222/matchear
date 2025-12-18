import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { ProtectedRoute } from './auth/ProtectedRoute.jsx'
import { Home } from './pages/Home.jsx'
import { Canchas } from './pages/Canchas.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { PitchDetail } from './pages/PitchDetail.jsx'
import { MyBookings } from './pages/MyBookings.jsx'
import { AdminLayout } from './pages/admin/AdminLayout.jsx'
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
import { AdminPitches } from './pages/admin/AdminPitches.jsx'
import { AdminRevenue } from './pages/admin/AdminRevenue.jsx'
import { AdminOccupancy } from './pages/admin/AdminOccupancy.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/canchas" element={<Canchas />} />
          <Route path="/canchas/:id" element={<PitchDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute allowRoles={['user', 'admin']} />}>
            <Route path="/mis-reservas" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute allowRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="canchas" element={<AdminPitches />} />
              <Route path="ingresos" element={<AdminRevenue />} />
              <Route path="ocupacion" element={<AdminOccupancy />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
