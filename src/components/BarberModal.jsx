import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './ui.jsx'

/**
 * BarberModal — crear / editar un barbero y sus permisos (modal responsive),
 * mismo patrón que ClientModal. Funcional: guardar, activar/desactivar,
 * permisos y eliminar (con confirmación). Brunetti/admin queda protegido.
 *
 * Props:
 *  barber        // null = crear; objeto = editar
 *  canManage     // permiso para editar el equipo
 *  onClose, onSave(payload), onDelete(barber)
 */
const PERMS = [
  ['canViewFinance', 'Finanzas', 'Ver ingresos, gastos y reportes'],
  ['canEditServices', 'Servicios', 'Crear y editar servicios y precios'],
  ['canManageTeam', 'Equipo', 'Crear barberos y gestionar permisos'],
  ['canManageBlocks', 'Bloques', 'Bloquear/abrir horas en su agenda'],
]

// Módulos "abiertos" que el admin concede por barbero (Finanzas/Servicios/Gastos
// se controlan con los permisos de arriba). Resumen y Config siempre están.
const MODULES = [
  ['agenda', 'Agenda'],
  ['reservas', 'Reservas'],
  ['clientes', 'Clientes'],
  ['marketing', 'Marketing'],
]
const ALL_MODULE_IDS = MODULES.map((m) => m[0])

const emptyBarber = { name: '', code: '', role: 'Barbero', tier: 'general', pin: '1234', active: true, modules: [...ALL_MODULE_IDS], canViewFinance: false, canEditServices: false, canManageTeam: false, canManageBlocks: true }

export default function BarberModal({ barber, canManage = false, onClose, onSave, onDelete }) {
  const isNew = !barber?.id
  const locked = !isNew && (barber?.name?.toLowerCase().includes('brunetti') || barber?.admin)
  const [form, setForm] = useState(emptyBarber)
  const [confirmDel, setConfirmDel] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setForm(barber
      ? { ...emptyBarber, ...barber, pin: barber.pin || '', modules: Array.isArray(barber.modules) ? barber.modules : [...ALL_MODULE_IDS] }
      : { ...emptyBarber })
    setConfirmDel(false); setErr('')
  }, [barber])

  const toggleModule = (id, on) => setForm((f) => {
    const cur = Array.isArray(f.modules) ? f.modules : [...ALL_MODULE_IDS]
    return { ...f, modules: on ? [...new Set([...cur, id])] : cur.filter((x) => x !== id) }
  })

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') (confirmDel ? setConfirmDel(false) : onClose()) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmDel, onClose])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.name.trim()) { setErr('Ingresa el nombre del barbero.'); return }
    if (!form.code.trim()) { setErr('Ingresa el usuario.'); return }
    onSave({ ...form, name: form.name.trim(), code: form.code.trim().toLowerCase().replace(/\s+/g, '-'), short: form.short || form.name.trim().split(' ')[0] })
  }

  const togglePerm = (key, checked) => set(key, checked)

  return createPortal((
    <div className="psn-modal" role="dialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-barber-modal">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>

        <div className="psn-client-profile">
          <div className="psn-client-avatar">{(form.name || 'B')[0]?.toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <h3 className="font-display">{isNew ? 'Nuevo barbero' : form.name}</h3>
            <span className="psn-client-sub">{isNew ? 'Crear cuenta de acceso' : `${form.role || 'Barbero'} · @${form.code}`}</span>
          </div>
        </div>

        <div className="psn-client-edit">
          <div className="field"><label>Nombre</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre completo" disabled={!canManage} /></div>
          <div className="psn-form-2col">
            <div className="field"><label>Usuario</label><input className="input" value={form.code} onChange={(e) => set('code', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="usuario" disabled={!canManage || locked} /></div>
            <div className="field"><label>Rol</label><input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Barbero" disabled={!canManage} /></div>
          </div>
          <div className="psn-form-2col">
            <div className="field"><label>Nivel</label>
              <select className="input" value={form.tier} onChange={(e) => set('tier', e.target.value)} disabled={!canManage}>
                <option value="general">General</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="field"><label>{isNew ? 'PIN inicial' : 'Restablecer PIN'}</label><input className="input" value={form.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="1234" disabled={!canManage} /></div>
          </div>

          <div className="psn-barber-perms">
            <span className="psn-perms-head">Permisos</span>
            {PERMS.map(([key, lbl, sub]) => {
              const checked = locked ? true : (key === 'canManageBlocks' ? form[key] !== false : Boolean(form[key]))
              return (
                <label key={key} className={`psn-perm-row ${checked ? 'on' : ''}`}>
                  <div style={{ minWidth: 0 }}>
                    <div className="lbl">{lbl}</div>
                    <div className="sub">{sub}</div>
                  </div>
                  <input type="checkbox" checked={checked} disabled={!canManage || locked} onChange={(e) => togglePerm(key, e.target.checked)} />
                </label>
              )
            })}
          </div>

          <div className="psn-barber-perms">
            <span className="psn-perms-head">Módulos con acceso</span>
            {MODULES.map(([id, lbl]) => {
              const on = locked ? true : (Array.isArray(form.modules) ? form.modules.includes(id) : true)
              return (
                <label key={id} className={`psn-perm-row ${on ? 'on' : ''}`}>
                  <div className="lbl">{lbl}</div>
                  <input type="checkbox" checked={on} disabled={!canManage || locked} onChange={(e) => toggleModule(id, e.target.checked)} />
                </label>
              )
            })}
          </div>

          {!isNew && !locked && (
            <label className={`psn-perm-row ${form.active !== false ? 'on' : ''}`}>
              <div><div className="lbl">Cuenta activa</div><div className="sub">Puede iniciar sesión y recibir reservas</div></div>
              <input type="checkbox" checked={form.active !== false} disabled={!canManage} onChange={(e) => set('active', e.target.checked)} />
            </label>
          )}

          {err && <div className="barber-login-error"><Icon name="bell" size={14} /> {err}</div>}

          <div className="psn-confirm-actions">
            <button className="btn btn-ghost btn-block" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold btn-block" onClick={save} disabled={!canManage}><Icon name="check" size={15} /> {isNew ? 'Crear cuenta' : 'Guardar'}</button>
          </div>
          {!isNew && !locked && canManage && (
            <button className="btn btn-danger btn-block" onClick={() => setConfirmDel(true)}><Icon name="close" size={15} /> Eliminar barbero</button>
          )}
        </div>
      </div>

      {confirmDel && (
        <div className="psn-modal psn-modal-top" role="alertdialog" aria-modal="true">
          <button className="psn-scrim" aria-label="Cerrar" onClick={() => setConfirmDel(false)} />
          <div className="psn-modal-card psn-confirm">
            <span className="psn-confirm-ic"><Icon name="close" size={22} /></span>
            <h3 className="font-display">¿Eliminar a {form.name}?</h3>
            <p>Se eliminará su acceso al panel. Esta acción no se puede deshacer.</p>
            <div className="psn-confirm-actions">
              <button className="btn btn-ghost btn-block" onClick={() => setConfirmDel(false)}>Volver</button>
              <button className="btn btn-danger btn-block" onClick={() => { onDelete(barber); setConfirmDel(false) }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  ), document.body)
}
