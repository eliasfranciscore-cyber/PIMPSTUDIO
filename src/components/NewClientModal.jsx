import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './ui.jsx'
import { cleanPhone } from '../data.js'

/**
 * NewClientModal — alta manual de clientes desde el panel.
 *
 * El POST /api/clients es un upsert por teléfono y EXIGE email válido
 * (validateClient en api/clients.js), así que replicamos aquí la misma regla:
 * nombre + teléfono de 9 dígitos + email con formato válido. Si el teléfono ya
 * existe entre los clientes cargados, avisamos que se actualizará (no se crea
 * duplicado).
 *
 * Props: { open, onClose, clients, onCreate(draft) }
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NewClientModal({ open, onClose, clients = [], onCreate = () => {} }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setForm({ name: '', phone: '', email: '' }); setError(''); setSaving(false) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const phone = cleanPhone(form.phone)
  const existing = useMemo(
    () => clients.find((c) => cleanPhone(c.phone) === phone && phone.length === 9),
    [clients, phone]
  )

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (!name) return setError('Nombre requerido.')
    if (phone.length !== 9) return setError('El teléfono debe tener 9 dígitos.')
    if (!EMAIL_RE.test(email)) return setError('Correo inválido.')
    setError('')
    setSaving(true)
    try {
      await onCreate({ name, phone, email })
      onClose()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el cliente.')
      setSaving(false)
    }
  }

  return createPortal((
    <div className="psn-modal" role="dialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-newbk">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>
        <h3><Icon name="user" size={20} /> Nuevo cliente</h3>
        <p className="psn-role">El teléfono funciona como identificador único.</p>

        <div className="psn-client-edit">
          <div className="field"><label>Nombre</label><input className="input" value={form.name} onChange={set('name')} placeholder="Nombre y apellido" autoFocus /></div>
          <div className="field"><label>Teléfono</label><input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="9 1234 5678" /></div>
          <div className="field"><label>Correo <span style={{ color: 'var(--muted-2)' }}>(obligatorio)</span></label><input className="input" value={form.email} onChange={set('email')} inputMode="email" placeholder="correo@ejemplo.com" /></div>
        </div>

        {existing && (
          <p className="psn-newbk-err" style={{ color: 'var(--gold-lt)' }}>
            <Icon name="user" size={13} /> Ya existe {existing.name || 'un cliente'} con ese teléfono: se actualizará.
          </p>
        )}
        {error && <p className="psn-newbk-err"><Icon name="close" size={13} /> {error}</p>}

        <div className="psn-confirm-actions">
          <button className="btn btn-ghost btn-block" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn btn-gold btn-block" onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : existing ? 'Actualizar' : 'Crear cliente'}
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}
