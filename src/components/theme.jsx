import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

/* ============================================================
   Tema claro/oscuro global.
   - Por defecto sigue la HORA DE SANTIAGO DE CHILE: claro de día
     (07:00–18:59) y oscuro de noche. Se re-evalúa cada 10 min.
   - Si el usuario usa el toggle, su elección manual queda guardada
     (ps_theme_manual) y manda sobre el automático.
   - Escribe data-theme en <html>, que activa los tokens
     [data-theme="light"] / [data-theme="dark"] del CSS.
   ============================================================ */

const ThemeCtx = createContext({ theme: 'dark', toggle: () => {}, manual: false, useAuto: () => {} })

/* Hora actual en Santiago (maneja DST automáticamente vía Intl). */
function santiagoHour() {
  try {
    const h = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: 'numeric', hour12: false }).format(new Date())
    return parseInt(h, 10) % 24
  } catch {
    return new Date().getHours()
  }
}
function autoTheme() {
  const h = santiagoHour()
  return h >= 7 && h < 19 ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
  const [manual, setManual] = useState(() => {
    try { return localStorage.getItem('ps_theme_manual') === '1' } catch { return false }
  })
  const [theme, setTheme] = useState(() => {
    try {
      if (localStorage.getItem('ps_theme_manual') === '1') return localStorage.getItem('ps_theme') || 'dark'
    } catch {}
    return autoTheme()
  })

  // Aplica el tema al documento y persiste.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('ps_theme', theme) } catch {}
  }, [theme])

  // Modo automático: re-evalúa por hora de Santiago mientras no haya elección manual.
  useEffect(() => {
    if (manual) return
    setTheme(autoTheme())
    const id = setInterval(() => setTheme(autoTheme()), 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [manual])

  const toggle = useCallback(() => {
    setManual(true)
    try { localStorage.setItem('ps_theme_manual', '1') } catch {}
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  // Volver al automático (por hora de Santiago).
  const useAuto = useCallback(() => {
    setManual(false)
    try { localStorage.removeItem('ps_theme_manual') } catch {}
    setTheme(autoTheme())
  }, [])

  return <ThemeCtx.Provider value={{ theme, toggle, manual, useAuto }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }

/* Toggle de ícono (usado en el panel interno). */
export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`theme-toggle ${className}`}
    >
      {isDark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      )}
    </button>
  )
}

/* Toggle tipo "pill" flotante para el sitio público (Home/Cursos/Workshop).
   Estilo deslizante sol/luna (adaptado del componente solicitado a JSX puro). */
function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
    </svg>
  )
}
function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

export function FloatingThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`float-theme-toggle ${isDark ? 'is-dark' : 'is-light'}`}
    >
      <span className="ftt-track">
        <span className="ftt-side ftt-side-moon"><MoonIcon /></span>
        <span className="ftt-side ftt-side-sun"><SunIcon /></span>
        <span className="ftt-knob">{isDark ? <MoonIcon /> : <SunIcon />}</span>
      </span>
    </button>
  )
}
