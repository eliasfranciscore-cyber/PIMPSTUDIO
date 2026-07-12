import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Icon } from './ui.jsx'
import { CLP } from '../data.js'

/**
 * GlobalSearch — buscador global del topbar del Dashboard.
 *
 * Busca sobre los datos YA cargados en memoria (clientes + reservas; el GET
 * interno de bookings trae LIMIT 160, de ahí el aviso del footer). No pega a la
 * API: es autocompletar puro con debounce de 150ms.
 *
 * Props:
 *  clients, bookings          // datos en memoria
 *  onPickClient(client)       // → setTab("clientes") + openClient(client)
 *  onPickBooking(booking)     // → setTab("reservas") + setInboxFocus({day, ts})
 */
const badgeClass = (status) => `psn-res-badge ${String(status || '').replace(/\s+/g, '-')}`

export default function GlobalSearch({ clients = [], bookings = [], onPickClient = () => {}, onPickBooking = () => {} }) {
  const [raw, setRaw] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Debounce 150ms sobre el texto de búsqueda.
  useEffect(() => {
    const t = setTimeout(() => setQ(raw.trim().toLowerCase()), 150)
    return () => clearTimeout(t)
  }, [raw])

  // Cierre por click afuera (mismo patrón que el user-chip del topbar).
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const clientHits = useMemo(() => {
    if (!q) return []
    return clients
      .filter((c) => `${c.name || ''} ${c.phone || ''}`.toLowerCase().includes(q))
      .slice(0, 5)
  }, [q, clients])

  const bookingHits = useMemo(() => {
    if (!q) return []
    return bookings
      .filter((b) => `${b.client || ''} ${b.phone || ''} ${b.service || ''} ${b.date || ''}`.toLowerCase().includes(q))
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
      .slice(0, 7)
  }, [q, bookings])

  // Lista plana para navegación con teclado (clientes primero, luego reservas).
  const flat = useMemo(() => [
    ...clientHits.map((c) => ({ type: 'client', item: c })),
    ...bookingHits.map((b) => ({ type: 'booking', item: b })),
  ], [clientHits, bookingHits])

  useEffect(() => { setActive(0) }, [q])

  const showPanel = open && q.length > 0
  const pick = (entry) => {
    if (!entry) return
    if (entry.type === 'client') onPickClient(entry.item)
    else onPickBooking(entry.item)
    setOpen(false)
    setRaw('')
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (!showPanel) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); pick(flat[active]) }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  return (
    <div className="dk-suggest-wrap global-search" ref={wrapRef}>
      <div className="global-search-field">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
        </svg>
        <input
          ref={inputRef}
          value={raw}
          placeholder="Buscar cliente o reserva…"
          onChange={(e) => { setRaw(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Búsqueda global"
        />
        {raw && (
          <button type="button" className="psn-search-clear" onClick={() => { setRaw(''); inputRef.current?.focus() }} aria-label="Limpiar">
            <Icon name="close" size={13} />
          </button>
        )}
      </div>
      {showPanel && (
        <div className="dk-suggest" role="listbox">
          {flat.length === 0 && (
            <div className="dk-suggest-empty">Sin coincidencias para “{raw.trim()}”.</div>
          )}
          {clientHits.length > 0 && <div className="dk-suggest-head">Clientes</div>}
          {clientHits.map((c, i) => {
            const idx = i
            return (
              <button
                key={`c-${c.id ?? c.phone}`}
                type="button"
                className={`dk-suggest-row ${active === idx ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => pick({ type: 'client', item: c })}
              >
                <Icon name="user" size={15} />
                <span className="mn">{c.name || 'Cliente'}<small>{c.phone || 'Sin teléfono'}</small></span>
              </button>
            )
          })}
          {bookingHits.length > 0 && <div className="dk-suggest-head">Reservas</div>}
          {bookingHits.map((b, i) => {
            const idx = clientHits.length + i
            return (
              <button
                key={b.id ?? `${b.date}-${b.time}-${b.phone}`}
                type="button"
                className={`dk-suggest-row ${active === idx ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => pick({ type: 'booking', item: b })}
              >
                <Icon name="calendar" size={15} />
                <span className="mn">{b.client || 'Reserva'}<small>{b.date} · {b.time} · {b.service || '—'}</small></span>
                <span className="mr" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.2rem' }}>
                  <span className={badgeClass(b.status)}>{b.status || '—'}</span>
                  {b.price ? <span>{CLP(b.price)}</span> : null}
                </span>
              </button>
            )
          })}
          <div className="dk-suggest-foot">Busca en los datos cargados (últimas reservas).</div>
        </div>
      )}
    </div>
  )
}
