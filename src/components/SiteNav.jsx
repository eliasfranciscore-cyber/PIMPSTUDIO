import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Brandmark, Icon } from './ui.jsx'
import './SiteNav.css'

/* Navbar global del sitio. Persiste en todas las páginas (Home, Workshop, ...).
   Escritorio: logo + enlaces de módulos + botón Reservar (en la barra superior).
   Móvil: logo + botón de menú desplegable (módulos) y una barra inferior fija
   con el CTA Reservar (estilo workshop), full-width.
   - Secciones (Servicios/Barberos/Nosotros/Ubicación): scroll en Home,
     o navegan a "/" y Home hace scroll a la sección (location.state.section).
   - "Workshop" siempre enruta a /workshop (es una página más).
   - Reservar: en workshop "Reservar asiento" (→ formulario #inscribir);
     en el resto "Reservar hora en la agenda" (→ /login). */
const NAV = [
  ["servicios", "Servicios"],
  ["barberos", "Barberos"],
  ["workshop", "Workshop"],
  ["nosotros", "Nosotros"],
  ["ubicacion", "Ubicación"],
]

export default function SiteNav({ onSection, scrolled: scrolledProp }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isWorkshop = location.pathname === "/workshop"
  const [scrolledWin, setScrolledWin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Detección de scroll por ventana cuando el navbar no es controlado (p. ej. /workshop).
  useEffect(() => {
    if (scrolledProp !== undefined) return
    const on = () => setScrolledWin(window.scrollY > 40)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [scrolledProp])

  // Cerrar el menú al cambiar de ruta.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const scrolled = scrolledProp !== undefined ? scrolledProp : scrolledWin

  const goSection = (id) => {
    if (isHome && onSection) onSection(id)
    else navigate("/", { state: { section: id } })
  }
  const handleNav = (id) => {
    setMenuOpen(false)
    if (id === "workshop") navigate("/workshop")
    else goSection(id)
  }

  const reserveLabel = isWorkshop ? "Reservar asiento" : "Reservar hora en la agenda"
  const reserve = () => {
    setMenuOpen(false)
    if (isWorkshop) {
      const el = document.getElementById("inscribir")
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" })
        return
      }
    }
    navigate("/login")
  }

  return (
    <React.Fragment>
      <header className={`home-nav ${scrolled || menuOpen ? "is-scrolled" : ""}`}>
        <Brandmark size={38} onClick={() => navigate("/")} />
        <nav className="home-nav-links">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="nav-link"
              style={id === "workshop" && isWorkshop ? { color: "var(--gold)" } : undefined}
            >
              {label}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm site-nav-barber-desktop" onClick={() => navigate("/ingreso")}>
            <Icon name="key" size={14} /> Acceso
          </button>
          <button className="btn btn-gold btn-sm site-nav-reserve-desktop" onClick={() => navigate("/login")}>
            <Icon name="calendar" size={14} /> Reservar
          </button>
        </nav>
        <button
          className="site-nav-burger"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={22} />
        </button>
      </header>

      {menuOpen && <div className="site-nav-backdrop" onClick={() => setMenuOpen(false)} />}

      <div className={`site-nav-sheet ${menuOpen ? "is-open" : ""}`} role="menu">
        {NAV.map(([id, label]) => (
          <button
            key={id}
            role="menuitem"
            onClick={() => handleNav(id)}
            className={id === "workshop" && isWorkshop ? "is-active" : ""}
          >
            {label}
          </button>
        ))}
        <button
          role="menuitem"
          className="site-nav-sheet-barber"
          onClick={() => { setMenuOpen(false); navigate("/ingreso") }}
        >
          <Icon name="key" size={15} /> Acceso barberos
        </button>
      </div>

      <div className="site-nav-cta-bar">
        <button className="btn btn-gold" onClick={reserve}>
          <Icon name="calendar" size={15} /> {reserveLabel}
        </button>
      </div>
    </React.Fragment>
  )
}
