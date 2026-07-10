import React, { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './IconsExtra.jsx'
import { CLP, barberById } from '../data.js'

/**
 * BookingsInbox — bandeja de reservas del Dashboard.
 *
 * Por fuera, cada tarjeta muestra sólo: resumen + selector de estado + botón
 * "Ver detalles". Al tocar la tarjeta se abre un modal (responsive) con toda la
 * gestión: acciones por estado, WhatsApp (mensaje según estado), cancelar con
 * confirmación y revertir la cancelación.
 *
 * Admin (Bruno) ve la agenda de TODOS y puede filtrar por barbero. Un barbero
 * normal ve sólo SU agenda del día.
 *
 * Props:
 *  bookings, barbers, barber, admin
 *  onStatus: (booking, nuevoEstado) => void   // persiste el cambio
 *  onReschedule?: (booking) => void           // abre la agenda para reagendar
 */

const STATUS_LABEL = { pendiente: 'Pendiente', confirmada: 'Confirmada', 'en curso': 'En curso', completada: 'Completada', cancelada: 'Cancelada' }
const STATUS_OPTIONS = ['pendiente', 'confirmada', 'en curso', 'completada', 'cancelada']
const FILTERS = ['Todas', 'Pendientes', 'Confirmadas', 'Completadas']
const FILTER_MAP = { Pendientes: 'pendiente', Confirmadas: 'confirmada', Completadas: 'completada' }

function waLink(bk, barberShort, status) {
  const first = (bk.client || 'Hola').split(' ')[0]
  const msgs = {
    confirmada: `Hola ${first}, te confirmamos tu hora en Brunetti el ${bk.date} a las ${bk.time} con ${barberShort}. ¡Te esperamos! 💈`,
    'en curso': `Hola ${first}, te esperamos en Brunetti, tu hora de las ${bk.time} con ${barberShort} está por comenzar.`,
    completada: `Hola ${first}, ¡gracias por tu visita a Brunetti! Esperamos que te haya gustado el resultado. Te esperamos pronto. 💈`,
    reagendar: `Hola ${first}, necesitamos reagendar tu hora del ${bk.date} (${bk.time}) en Brunetti. ¿Qué día te acomoda?`,
    cancelada: `Hola ${first}, lamentamos avisarte que tu hora del ${bk.date} a las ${bk.time} fue cancelada. Escríbenos para reagendar.`,
    default: `Hola ${first}, te escribimos de Brunetti por tu reserva del ${bk.date} a las ${bk.time}.`,
  }
  const phone = String(bk.phone || '').replace(/\D/g, '')
  return `https://wa.me/56${phone}?text=${encodeURIComponent(msgs[status] || msgs.default)}`
}

const resolveBarber = (bk, barbers) => barbers.find((x) => Number(x.id) === Number(bk.barberId)) || barberById(bk.barberId) || {}
const initialsOf = (name) => (name || 'C').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

/* Tarjeta compacta: resumen + selector de estado + "Ver detalles". */
function ResCard({ bk, barbers, isAdmin, onOpen, onStatusSelect }) {
  const barber = resolveBarber(bk, barbers)
  const short = barber?.short || barber?.name || 'Barbero'
  const cls = String(bk.status).replace(' ', '-')
  return (
    <div className={`psn-res-card ${cls}`}>
      <button type="button" className="psn-res-tap" onClick={() => onOpen(bk)} aria-label={`Ver detalles de ${bk.client}`}>
        <div className="psn-res-top">
          <span className="psn-res-time"><Icon name="clock" size={15} /> {bk.time} <small>{bk.date}</small></span>
          <span className={`psn-res-badge ${cls}`}>{STATUS_LABEL[bk.status] || bk.status}</span>
        </div>
        <div className="psn-res-client">
          <span className="psn-res-avatar">{initialsOf(bk.client)}</span>
          <div style={{ minWidth: 0 }}>
            <div className="nm">{bk.client}</div>
            <div className="psn-res-phone"><Icon name="phone" size={12} /> +56 {bk.phone || '—'}</div>
          </div>
        </div>
        <div className="psn-res-meta">
          <div className="psn-res-row"><span>Servicio</span><b>{bk.service}</b></div>
          {isAdmin && <div className="psn-res-row"><span>Barbero</span><b>{short}</b></div>}
          <div className="psn-res-row"><span>Total</span><b className="gold-text">{CLP(bk.price)}</b></div>
        </div>
      </button>
      <div className="psn-res-foot">
        <select
          className={`psn-res-status ${cls}`}
          value={bk.status}
          onChange={(e) => onStatusSelect(bk, e.target.value)}
          aria-label="Cambiar estado"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button type="button" className="btn btn-dark btn-sm psn-res-detail" onClick={() => onOpen(bk)}>
          Ver detalles <Icon name="arrowRight" size={13} />
        </button>
      </div>
    </div>
  )
}

/* Modal de gestión de la reserva (responsive). */
function ResModal({ bk, barbers, isAdmin, onClose, onStatus, onReschedule, onAskCancel, onAskDelete, prevStatus }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  if (!bk) return null
  const barber = resolveBarber(bk, barbers)
  const short = barber?.short || barber?.name || 'Barbero'
  const cls = String(bk.status).replace(' ', '-')
  const waStatus = bk.status === 'cancelada' ? 'cancelada' : bk.status === 'pendiente' ? 'default' : bk.status
  return createPortal((
    <div className="psn-modal" role="dialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-res-modal">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>
        <span className={`psn-res-badge ${cls}`}>{STATUS_LABEL[bk.status] || bk.status}</span>
        <h3 className="font-display">{bk.client}</h3>
        <p className="psn-role"><Icon name="clock" size={13} /> {bk.time} · {bk.date}</p>

        <div className="psn-res-meta psn-res-modal-meta">
          <div className="psn-res-row"><span>Servicio</span><b>{bk.service}</b></div>
          {isAdmin && <div className="psn-res-row"><span>Barbero</span><b>{short}</b></div>}
          <div className="psn-res-row"><span>Teléfono</span><b>+56 {bk.phone || '—'}</b></div>
          <div className="psn-res-row"><span>Total</span><b className="gold-text">{CLP(bk.price)}</b></div>
        </div>

        <div className="psn-actions">
          {bk.status === 'pendiente' && (
            <button className="btn btn-gold btn-block" onClick={() => onStatus(bk, 'confirmada')}><Icon name="check" size={16} /> Confirmar reserva</button>
          )}
          {bk.status === 'confirmada' && (
            <button className="btn btn-gold btn-block" onClick={() => onStatus(bk, 'en curso')}><Icon name="scissors" size={16} /> Iniciar atención</button>
          )}
          {bk.status === 'en curso' && (
            <button className="btn btn-gold btn-block" onClick={() => onStatus(bk, 'completada')}><Icon name="check" size={16} /> Completar</button>
          )}

          <a className="btn btn-wa btn-block" href={waLink(bk, short, waStatus)} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={16} /> Enviar WhatsApp
          </a>

          {(bk.status === 'pendiente' || bk.status === 'confirmada') && (
            <button className="btn btn-dark btn-block" onClick={() => { onReschedule && onReschedule(bk); onClose() }}>
              <Icon name="reschedule" size={16} /> Reagendar
            </button>
          )}

          {bk.status === 'cancelada' ? (
            <button className="btn btn-dark btn-block" onClick={() => onStatus(bk, prevStatus || 'pendiente')}>
              <Icon name="reschedule" size={16} /> Revertir cancelación
            </button>
          ) : bk.status !== 'completada' ? (
            <button className="btn btn-danger btn-block" onClick={() => onAskCancel(bk)}>
              <Icon name="x" size={16} /> Cancelar reserva
            </button>
          ) : null}

          <button className="btn btn-ghost btn-block psn-res-delete" onClick={() => onAskDelete(bk)}>
            <Icon name="trash" size={15} /> Eliminar reserva definitivamente
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}

/* Popup de confirmación de cancelación. */
function ConfirmCancel({ bk, onClose, onConfirm }) {
  if (!bk) return null
  return createPortal((
    <div className="psn-modal psn-modal-top" role="alertdialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-confirm">
        <span className="psn-confirm-ic"><Icon name="x" size={22} /></span>
        <h3 className="font-display">¿Cancelar esta reserva?</h3>
        <p>Vas a cancelar la hora de <b>{bk.client}</b> ({bk.time} · {bk.date}). Podrás revertir la cancelación después.</p>
        <div className="psn-confirm-actions">
          <button className="btn btn-ghost btn-block" onClick={onClose}>Volver</button>
          <button className="btn btn-danger btn-block" onClick={() => onConfirm(bk)}><Icon name="x" size={15} /> Sí, cancelar</button>
        </div>
      </div>
    </div>
  ), document.body)
}

/* Popup de confirmación de eliminación definitiva. */
function ConfirmDelete({ bk, onClose, onConfirm }) {
  if (!bk) return null
  return createPortal((
    <div className="psn-modal psn-modal-top" role="alertdialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-confirm">
        <span className="psn-confirm-ic"><Icon name="trash" size={22} /></span>
        <h3 className="font-display">¿Eliminar esta reserva?</h3>
        <p>Vas a borrar por completo la hora de <b>{bk.client}</b> ({bk.time} · {bk.date}). Esta acción no se puede deshacer.</p>
        <div className="psn-confirm-actions">
          <button className="btn btn-ghost btn-block" onClick={onClose}>Volver</button>
          <button className="btn btn-danger btn-block" onClick={() => onConfirm(bk)}><Icon name="trash" size={15} /> Sí, eliminar</button>
        </div>
      </div>
    </div>
  ), document.body)
}

export default function BookingsInbox({ bookings = [], barbers = [], barber, admin = false, onStatus = () => {}, onDelete = () => {}, onReschedule }) {
  const [filter, setFilter] = useState('Todas')
  const [barberFilter, setBarberFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const prevStatus = useRef({})

  const todayKey = new Date().toISOString().slice(0, 10)
  const idOf = (b) => b.id ?? `${b.barberId}-${b.time}`
  // Con un solo barbero (Brunetti) no tiene sentido el filtro ni la columna de barbero.
  const multiBarber = barbers.length > 1

  // Alcance base: admin = todo; barbero = solo su agenda del día.
  const scope = useMemo(() => {
    if (admin) return bookings
    return bookings.filter((b) => Number(b.barberId) === Number(barber?.id) && (!b.date || b.date === todayKey))
  }, [bookings, admin, barber, todayKey])

  const visible = useMemo(() => {
    let list = scope
    if (admin && barberFilter !== 'all') list = list.filter((b) => Number(b.barberId) === Number(barberFilter))
    // "Todas" oculta las completadas (ya se atendieron); sólo aparecen al elegir el filtro Completadas.
    if (filter !== 'Todas') list = list.filter((b) => b.status === FILTER_MAP[filter])
    else list = list.filter((b) => b.status !== 'completada')
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((b) => `${b.client || ''} ${b.phone || ''} ${b.service || ''}`.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => String(a.time).localeCompare(String(b.time)))
  }, [scope, admin, barberFilter, filter, query])

  const count = (st) => scope.filter((b) => b.status === st).length
  const dayTotal = scope.filter((b) => b.status !== 'cancelada').reduce((s, b) => s + Number(b.price || 0), 0)

  // La reserva del modal se resuelve en vivo desde props para reflejar cambios.
  const detailBk = detailId != null ? bookings.find((b) => idOf(b) === detailId) || null : null

  const onStatusSelect = (bk, value) => {
    if (value === bk.status) return
    if (value === 'cancelada') { setCancelTarget(bk); return }
    onStatus(bk, value)
  }
  const confirmCancel = (bk) => {
    prevStatus.current[idOf(bk)] = bk.status === 'cancelada' ? 'pendiente' : bk.status
    onStatus(bk, 'cancelada')
    setCancelTarget(null)
  }
  const confirmDelete = (bk) => {
    onDelete(bk)
    setDeleteTarget(null)
    if (detailId != null && idOf(bk) === detailId) setDetailId(null)
  }

  return (
    <div className="animate-in psn-inbox">
      <div className="psn-mod-head">
        <div>
          <h2 className="font-display">Reservas recibidas</h2>
          <p>{admin ? (multiBarber ? 'Vista administrador · agenda de todos los barberos' : 'Agenda de Brunetti') : `Tu agenda de hoy · ${barber?.name || 'Barbero'}`}</p>
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
        {admin && multiBarber && (
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
            <ResCard key={idOf(bk)} bk={bk} barbers={barbers} isAdmin={admin && multiBarber} onOpen={(b) => setDetailId(idOf(b))} onStatusSelect={onStatusSelect} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>No hay reservas que coincidan con el filtro.</div>
      )}

      {detailBk && (
        <ResModal
          bk={detailBk}
          barbers={barbers}
          isAdmin={admin && multiBarber}
          onClose={() => setDetailId(null)}
          onStatus={onStatus}
          onReschedule={onReschedule}
          onAskCancel={(b) => setCancelTarget(b)}
          onAskDelete={(b) => setDeleteTarget(b)}
          prevStatus={prevStatus.current[idOf(detailBk)]}
        />
      )}

      {cancelTarget && (
        <ConfirmCancel bk={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={confirmCancel} />
      )}

      {deleteTarget && (
        <ConfirmDelete bk={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      )}
    </div>
  )
}
