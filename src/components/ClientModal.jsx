import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './ui.jsx'
import { CLP, barberById, cleanPhone } from '../data.js'

/**
 * ClientModal — detalle del cliente en modal (responsive).
 * Muestra historial, KPIs y gestión: editar datos, WhatsApp directo, agendar y
 * eliminar (con confirmación). Reemplaza el panel lateral que vivía debajo.
 *
 * Props:
 *  client, history, barbers, startEditing
 *  onClose, onSave(updated), onDelete(client), onSchedule(client)
 */
export default function ClientModal({ client, history = [], barbers = [], startEditing = false, onClose, onSave, onDelete, onSchedule }) {
  const [editing, setEditing] = useState(startEditing)
  const [confirmDel, setConfirmDel] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', status: 'activo' })

  useEffect(() => {
    setForm({ name: client?.name || '', phone: client?.phone || '', email: client?.email || '', status: client?.status || 'activo' })
    setEditing(startEditing)
    setConfirmDel(false)
  }, [client, startEditing])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') (confirmDel ? setConfirmDel(false) : onClose()) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmDel, onClose])

  if (!client) return null

  const first = (client.name || '').split(' ')[0] || 'Hola'
  const phoneDigits = String(client.phone || '').replace(/\D/g, '')
  const waHref = `https://wa.me/56${phoneDigits}?text=${encodeURIComponent(`Hola ${first}, te escribimos de PIMP STUDIO 💈`)}`
  const totalSpent = client.totalSpent || history.reduce((s, h) => s + Number(h.price || 0), 0)
  const visits = client.visits || history.length

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = () => {
    if (!form.name.trim()) return
    onSave({ ...client, name: form.name.trim(), phone: cleanPhone(form.phone), email: form.email.trim(), status: form.status })
    setEditing(false)
  }

  return createPortal((
    <div className="psn-modal" role="dialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-client-modal">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>

        <div className="psn-client-profile">
          <div className="psn-client-avatar">{(client.name || 'C')[0]?.toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <h3 className="font-display">{client.name}</h3>
            <span className="psn-client-sub">+56 {client.phone || '—'}</span>
            <span className="psn-client-sub">{client.email || 'sin correo'}</span>
          </div>
        </div>

        {editing ? (
          <div className="psn-client-edit">
            <div className="field"><label>Nombre</label><input className="input" value={form.name} onChange={set('name')} placeholder="Nombre y apellido" /></div>
            <div className="field"><label>Teléfono</label><input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="9 1234 5678" /></div>
            <div className="field"><label>Correo</label><input className="input" value={form.email} onChange={set('email')} inputMode="email" placeholder="correo@ejemplo.com" /></div>
            <div className="field"><label>Estado</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="activo">Activo</option>
                <option value="nuevo">Nuevo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="psn-confirm-actions">
              <button className="btn btn-ghost btn-block" onClick={() => setEditing(false)}>Cancelar</button>
              <button className="btn btn-gold btn-block" onClick={save}><Icon name="check" size={15} /> Guardar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="psn-client-kpis">
              <div><strong>{visits}</strong><span>Cortes</span></div>
              <div><strong>{CLP(totalSpent)}</strong><span>Total</span></div>
              <div><strong>{client.lastVisit || history[0]?.date || '—'}</strong><span>Última visita</span></div>
            </div>

            <div className="psn-client-history">
              {history.map((item) => {
                const b = barbers.find((x) => Number(x.id) === Number(item.barberId)) || barberById(item.barberId) || {}
                return (
                  <div key={item.id || `${item.date}-${item.time}`} className="psn-client-hrow">
                    <div style={{ minWidth: 0 }}>
                      <div className="svc">{item.service}</div>
                      <div className="meta">{item.date} · {item.time} · {b.short || b.name || 'Barbero'}</div>
                    </div>
                    <b className="gold-text">{CLP(item.price)}</b>
                  </div>
                )
              })}
              {!history.length && <div className="empty-state">Este cliente aún no tiene historial de reservas.</div>}
            </div>

            <div className="psn-actions">
              <div className="psn-confirm-actions">
                <button className="btn btn-dark btn-block" onClick={() => setEditing(true)}><Icon name="user" size={15} /> Editar</button>
                <a className="btn btn-wa btn-block" href={waHref} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={15} /> WhatsApp</a>
              </div>
              <button className="btn btn-gold btn-block" onClick={() => onSchedule && onSchedule(client)}><Icon name="calendar" size={15} /> Agendar para este cliente</button>
              <button className="btn btn-danger btn-block" onClick={() => setConfirmDel(true)}><Icon name="close" size={15} /> Eliminar cliente</button>
            </div>
          </>
        )}
      </div>

      {confirmDel && (
        <div className="psn-modal psn-modal-top" role="alertdialog" aria-modal="true">
          <button className="psn-scrim" aria-label="Cerrar" onClick={() => setConfirmDel(false)} />
          <div className="psn-modal-card psn-confirm">
            <span className="psn-confirm-ic"><Icon name="close" size={22} /></span>
            <h3 className="font-display">¿Eliminar a {client.name}?</h3>
            <p>Se quitará de tu lista de clientes. Esta acción no se puede deshacer.</p>
            <div className="psn-confirm-actions">
              <button className="btn btn-ghost btn-block" onClick={() => setConfirmDel(false)}>Volver</button>
              <button className="btn btn-danger btn-block" onClick={() => { onDelete(client); setConfirmDel(false) }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  ), document.body)
}
