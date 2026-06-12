import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Booking from './pages/Booking.jsx'
import Account from './pages/Account.jsx'
import BarberLogin from './pages/BarberLogin.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Workshop from './pages/Workshop.jsx'

export default function App() {
  return (
    <div className="stage">
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
    </div>
  )
}
