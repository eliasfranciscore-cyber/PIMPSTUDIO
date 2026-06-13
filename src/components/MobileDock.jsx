import React, { useState, useEffect } from 'react'
import { Icon } from './ui.jsx'

/**
 * iOS-style floating dock para el dashboard.
 * - 6 accesos directos: 2 a la izq, FAB central (abre menú completo), 2 a la der,
 *   y un botón final (config). El centro permite navegar a todos los módulos.
 */
export default function MobileDock({ tab, setTab, nav }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!sheetOpen) return
    const close = (e) => { if (e.key === 'Escape') setSheetOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [sheetOpen])

  // Atajos fijos a la izq / derecha del centro
  const findKey = (key) => nav.find((n) => n[0] === key)
  const shortcuts = [
    findKey('resumen'),
    findKey('agenda'),
    findKey('reservas'),
    findKey('clientes'),
    findKey('config'),
  ].filter(Boolean)

  const goto = (id) => { setTab(id); setSheetOpen(false) }

  return (
    <>
      <nav className="mobile-dock" aria-label="Acceso rápido">
        {shortcuts.slice(0, 2).map(([id, ic, label]) => (
          <button
            key={id}
            type="button"
            className={`mobile-dock-item ${tab === id ? 'is-active' : ''}`}
            onClick={() => goto(id)}
            aria-label={label}
            aria-current={tab === id ? 'page' : undefined}
            title={label}
          >
            <Icon name={ic} size={20} />
          </button>
        ))}

        <button
          type="button"
          className="mobile-dock-center"
          onClick={() => setSheetOpen((v) => !v)}
          aria-label="Abrir menú completo"
          aria-expanded={sheetOpen}
        >
          <Icon name={sheetOpen ? 'close' : 'menu'} size={22} />
        </button>

        {shortcuts.slice(2, 5).map(([id, ic, label]) => (
          <button
            key={id}
            type="button"
            className={`mobile-dock-item ${tab === id ? 'is-active' : ''}`}
            onClick={() => goto(id)}
            aria-label={label}
            aria-current={tab === id ? 'page' : undefined}
            title={label}
          >
            <Icon name={ic} size={20} />
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={`dock-sheet-scrim ${sheetOpen ? 'is-open' : ''}`}
        onClick={() => setSheetOpen(false)}
        aria-label="Cerrar menú"
      />

      <div className={`dock-sheet ${sheetOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú completo">
        <div className="dock-sheet-grid">
          {nav.map(([id, ic, label]) => (
            <button
              key={id}
              type="button"
              className={`dock-sheet-item ${tab === id ? 'is-active' : ''}`}
              onClick={() => goto(id)}
            >
              <span className="dock-sheet-icon"><Icon name={ic} size={18} /></span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
