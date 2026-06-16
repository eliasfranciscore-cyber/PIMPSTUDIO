import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// CSS global primero: así el CSS de componentes (SiteNav.css, workshop.css)
// se importa después y gana en conflictos de igual especificidad.
import './styles/pimp.css'
import App from './App.jsx'

// Service worker para PWA + notificaciones push (iOS instalado en inicio).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
