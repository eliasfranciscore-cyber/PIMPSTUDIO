import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'

// Code-splitting: la landing (Home) carga de inmediato; el resto se carga bajo
// demanda para que la primera pantalla sea más liviana y rápida.
const Login = lazy(() => import('./pages/Login.jsx'))
const Booking = lazy(() => import('./pages/Booking.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))
const BarberLogin = lazy(() => import('./pages/BarberLogin.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Workshop = lazy(() => import('./pages/Workshop.jsx'))

function RouteFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg, #080807)' }}>
      <span className="route-spinner" aria-label="Cargando" />
    </div>
  )
}

export default function App() {
  return (
    <div className="stage">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/cuenta"   element={<Account />} />
          <Route path="/ingreso"  element={<BarberLogin />} />
          <Route path="/panel"    element={<Dashboard />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}
