import React, { useState, useMemo } from 'react'
import { Icon } from './IconsExtra.jsx'
import { CLP, barberById } from '../data.js'

/**
 * BookingsInbox — reemplaza el bloque `{tab === "reservas"}` del Dashboard.
 *
 * Bandeja de reservas pensada para gestionar rápido desde móvil:
 *  - Tarjetas con estado por color, botones grandes para Confirmar / Iniciar /
 *    Completar / Reagendar / Cancelar.
 *  - Botón de WhatsApp con mensaje pre-redactado según el estado (usa el número
 *    con el que se registró el cliente).
 *  - Admin (Bruno) ve la agenda de TODOS los barberos y puede filtrar por barbero.
 *    Un barbero normal ve solo SU agenda del día.
 *
 * Props:
 *  bookings: array de reservas [{ id, time, date, client, phone, service, barberId, price, status }]
 *  barbers:  array de barberos (para resolver nombre)
 *  barber:   usuario logueado { id, name, ... }
 *  admin:    boolean (true para Bruno / administración)
 *  onStatus: (booking, nuevoEstado) => void   // persiste el cambio
 *  onReschedule?: (booking) => void           // opcional: abrir agenda para reagendar
 */

const STATUS_LABEL = { pendiente: 'Pendiente', confirmada: 'Confirmada', 'en curso': 'En curso', completada: 'Completada', cancelada: 'Cancelada' }
const FILTERS = ['Todas', 'Pendientes', 'Confirmadas', 'En curso', 'Completadas']
const FILTER_MAP = { Pendientes: 'pendiente', Confirmadas: 'confirmada', 'En curso': 'en curso', Completadas: 'completada' }

function waLink(bk, barberShort, status) {
  const first = (bk.client || 'Hola').split(' ')[0]
  const msgs = {
    confirmada: `Hola ${first}, te confirmamos tu hora en PIMP STUDIO el ${bk.date} a las ${bk.time} con ${barberShort}. ¡Te esperamos! 💈`,
    reagendar: `Hola ${first}, necesitamos reagendar tu hora del ${bk.date} (${bk.time}) en PIMP STUDIO. ¿Qué día te acomoda?`,
    cancelada: `Hola ${first}, lamentamos avisarte que tu hora del ${bk.date} a las ${bk.time} fue cancelada. Escríbenos para reagendar.`,
    default: `Hola ${first}, te escribimos de PIMP STUDIO por tu reserva del ${bk.date} a las ${bk.time}.`,
  }
  const phone = String(bk.phone || '').replace(/\D/g, '')
  return `https://wa.me/56${phone}?text=${encodeURIComponent(msgs[status] || msgs.default)}`
}

function ResCard({ bk, barbers, isAdmin, onStatus, onReschedule }) {
  const barber = barbers.find((x) => Number(x.id) === Number(bk.barberId)) || barberById(bk.barberId)
  const short = barber?.short || barber?.name || 'Barbero'
  const initials = (bk.client || 'C').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const cls = String(bk.status).replace(' ', '-')
  const waStatus = bk.status === 'cancelada' ? 'cancelada' : bk.status === 'pendiente' ? 'default' : bk.status
  const reschedule = () => (onReschedule ? onReschedule(bk) : null)
  return (
    <div className={`psn-res-card ${cls}`}>
      <div className="psn-res-top">
        <span className="psn-res-time"><Icon name="clock" size={15} /> {bk.time} <small>{bk.date}</small></span>
        <span className={`psn-res-badge ${cls}`}>{STATUS_LABEL[bk.status] || bk.status}</span>
      </div>
      <div className="psn-res-client">
        <span className="psn-res-avatar">{initials}</span>
        <div style={{ minWidth: 0 }}>
          <div className="nm">{bk.client}</div>
          <div className="ph"><Icon name="phone" size={12} /> +56 {bk.phone}</div>
        </div>
      </div>
      <div className="psn-res-meta">
        <div className="psn-res-row"><span>Servicio</span><b>{bk.service}</b></div>
        {isAdmin && <div className="psn-res-row"><span>Barbero</span><b>{short}</b></div>}
        <div className="psn-res-row"><span>Total</span><b className="gold-text">{CLP(bk.price)}</b></div>
      </div>
      <div className="psn-res-actions">
        {bk.status === 'pendiente' && <button className="btn btn-gold btn-sm" onClick={() => onStatus(bk, 'confirmada')}><Icon name="check" size={14} /> Confirmar</button>}
        {bk.status === 'confirmada' && <button className="btn btn-dark btn-sm" onClick={() => onStatus(bk, 'en curso')}><Icon name="scissors" size={14} /> Iniciar</button>}
        {bk.status === 'en curso' && <button className="btn btn-gold btn-sm" onClick={() => onStatus(bk, 'completada')}><Icon name="check" size={14} /> Completar</button>}
        {(bk.status === 'pendiente' || bk.status === 'confirmada') && <button className="btn btn-dark btn-sm" onClick={reschedule}><Icon name="reschedule" size={14} /> Reagendar</button>}
        <a className="btn btn-wa btn-sm" href={waLink(bk, short, waStatus)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={14} /> WhatsApp</a>
        {bk.status !== 'completada' && bk.status !== 'cancelada' && (
          <button className="btn btn-ghost btn-sm psn-res-x" onClick={() => onStatus(bk, 'cancelada')} title="Cancelar"><Icon name="x" size={14} /></button>
        )}
      </div>
    </div>
  )
}

export default function BookingsInbox({ bookings = [], barbers = [], barber, admin = false, onStatus = () => {}, onReschedule }) {
  const [filter, setFilter] = useState('Todas')
  const [barberFilter, setBarberFilter] = useState('all')
  const [query, setQuery] = useState('')

  const todayKey = new Date().toISOString().slice(0, 10)

  // Alcance base: admin = todo; barbero = solo su agenda del día.
  const scope = useMemo(() => {
    if (admin) return bookings
    return bookings.filter((b) => Number(b.barberId) === Number(barber?.id) && (!b.date || b.date === todayKey))
  }, [bookings, admin, barber, todayKey])

  const visible = useMemo(() => {
    let list = scope
    if (admin && barberFilter !== 'all') list = list.filter((b) => Number(b.barberId) === Number(barberFilter))
    if (filter !== 'Todas') list = list.filter((b) => b.status === FILTER_MAP[filter])
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((b) => `${b.client || ''} ${b.phone || ''} ${b.service || ''}`.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => String(a.time).localeCompare(String(b.time)))
  }, [scope, admin, barberFilter, filter, query])

  const count = (st) => scope.filter((b) => b.status === st).length
  const dayTotal = scope.filter((b) => b.status !== 'cancelada').reduce((s, b) => s + Number(b.price || 0), 0)

  return (
    <div className="animate-in psn-inbox">
      <div className="psn-mod-head">
        <div>
          <h2 className="font-display">Reservas recibidas</h2>
          <p>{admin ? 'Vista administrador · agenda de todos los barberos' : `Tu agenda de hoy · ${barber?.name || 'Barbero'}`}</p>
        </div>
        <span className="chip chip-gold"><Icon name="bell" size={13} /> {count('pendiente')} por confirmar</span>
      </div>

      <div className="psn-inbox-stats">
        <div className="psn-stat"><b style={{ color: 'var(--gold-lt)' }}>{count('pendiente')}</b><span>Pendientes</span></div>
        <div className="psn-stat"><b style={{ color: '#9fd7af' }}>{count('confirmada')}</b><span>Confirmadas</span></div>
        <div className="psn-stat"><b style={{ color: '#aac4ff' }}>{count('en curso')}</b><span>En curso</span></div>
        <div className="psn-stat"><b>{CLP(dayTotal)}</b><span>Total del día</span></div>
      </div>

      <div className="psn-inbox-toolbar">
        <div className="psn-inbox-filters">
          {FILTERS.map((f) => (
            <button key={f} className={`chip ${filter === f ? 'chip-gold' : ''} psn-chip-btn`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        {admin && (
          <select className="psn-barber-filter" value={barberFilter} onChange={(e) => setBarberFilter(e.target.value)}>
            <option value="all">Todos los barberos</option>
            {barbers.filter((b) => b.active !== false).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <div className="psn-inbox-search">
          <Icon name="user" size={15} />
          <input placeholder="Buscar cliente o teléfono" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {visible.length ? (
        <div className="psn-inbox-grid">
          {visible.map((bk) => (
            <ResCard key={bk.id || `${bk.barberId}-${bk.time}`} bk={bk} barbers={barbers} isAdmin={admin} onStatus={onStatus} onReschedule={onReschedule} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>No hay reservas que coincidan con el filtro.</div>
      )}
    </div>
  )
}
