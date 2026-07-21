import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './IconsExtra.jsx'
import { CLP, cleanPhone } from '../data.js'

/**
 * NewBookingModal — reserva manual desde el panel, en 3 pasos (Cliente &
 * servicio → Fecha & hora → Confirmar), conectada a datos reales.
 *
 * A diferencia del flujo público, el barbero puede: elegir CUALQUIER fecha y
 * hora (sin límite de 7 días, con input libre además del slot picker), tomar
 * un cliente existente (autocompletar) o escribir uno nuevo (se crea por
 * teléfono), y usar un servicio del menú o uno personalizado; el precio es
 * editable siempre y se congela en la reserva (custom_price).
 *
 * Props:
 *  open, onClose
 *  clients, services      — para autocompletar y el grid de servicios
 *  defaultBarberId        — barbero de la reserva (single-barber: Brunetti)
 *  agendaSlots            — horarios base para el picker (fallback sin API)
 *  onCreate(draft) => Promise<{ok, error?}>  — persiste (Dashboard.createBooking)
 */

const STATUS_OPTIONS = ['pendiente', 'confirmada', 'en curso', 'completada', 'cancelada']
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const STEP_LABELS = { 1: 'Cliente y servicio', 2: 'Fecha y hora', 3: 'Confirmar' }

const svcIcon = (svc) => {
  const n = ((svc.name || '') + ' ' + (svc.cat || '')).toLowerCase()
  if (n.includes('asesor') || n.includes('visag') || n.includes('imagen')) return 'user'
  if (n.includes('quim') || n.includes('color') || n.includes('platin')) return 'spark'
  if (n.includes('fade') || n.includes('degra')) return 'trend'
  return 'scissors'
}

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function NewBookingModal({ open, onClose, clients = [], services = [], defaultBarberId, agendaSlots = DEFAULT_SLOTS, onCreate }) {
  const [step, setStep] = useState(1)
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [clientLocked, setClientLocked] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [serviceId, setServiceId] = useState(null)   // null = personalizado
  const [customSvc, setCustomSvc] = useState(false)
  const [svcName, setSvcName] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(todayKey())
  const [time, setTime] = useState('')
  const [freeTime, setFreeTime] = useState(false)
  const [slots, setSlots] = useState(null)           // null = cargando/sin datos
  const [status, setStatus] = useState('confirmada')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const activeServices = useMemo(() => services.filter((s) => s.active !== false), [services])

  // Servicios personalizados no tienen duración conocida → 1 bloque. Un
  // servicio del menú de más de 1h bloquea varios horarios seguidos.
  const blocksNeeded = useMemo(() => {
    if (customSvc) return 1
    const svc = activeServices.find((s) => s.id === serviceId)
    return Math.max(1, Math.ceil((svc?.min || 60) / 60))
  }, [customSvc, serviceId, activeServices])

  // Reset al abrir.
  useEffect(() => {
    if (!open) return
    setStep(1)
    setClientName(''); setPhone(''); setClientLocked(false); setSuggestOpen(false)
    setServiceId(null); setCustomSvc(false); setSvcName(''); setPrice('')
    setDate(todayKey()); setTime(''); setFreeTime(false)
    setStatus('confirmada'); setError(''); setSaving(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Disponibilidad del día elegido (contexto para el picker; sin API todos libres).
  useEffect(() => {
    if (!open || !date) return
    let alive = true
    setSlots(null)
    fetch(`/api/availability?barberId=${defaultBarberId}&date=${date}&detail=true`)
      .then((r) => (r.headers.get('content-type')?.includes('application/json') ? r.json() : Promise.reject()))
      .then((data) => { if (alive) setSlots(data.slots?.length ? data.slots : agendaSlots.map((slot) => ({ slot, state: 'free' }))) })
      .catch(() => { if (alive) setSlots(agendaSlots.map((slot) => ({ slot, state: 'free' }))) })
    return () => { alive = false }
  }, [open, date, defaultBarberId, agendaSlots])

  const matches = useMemo(() => {
    const q = clientName.trim().toLowerCase()
    if (!q || clientLocked) return []
    return clients
      .filter((c) => `${c.name || ''} ${c.phone || ''}`.toLowerCase().includes(q))
      .slice(0, 5)
  }, [clients, clientName, clientLocked])

  if (!open) return null

  const pickClient = (c) => {
    setClientName(c.name || '')
    setPhone(String(c.phone || ''))
    setClientLocked(true)
    setSuggestOpen(false)
  }
  const unlockClient = () => { setClientLocked(false); setClientName(''); setPhone('') }

  const pickService = (svc) => {
    setServiceId(svc.id)
    setCustomSvc(false)
    setSvcName('')
    setPrice(String(svc.price || ''))
    setError('')
  }
  const pickCustom = () => { setServiceId(null); setCustomSvc(true); setPrice(''); setError('') }

  const selectedService = activeServices.find((s) => s.id === serviceId)

  const validateStep1 = () => {
    const p = cleanPhone(phone)
    if (!clientName.trim()) return 'Escribe el nombre del cliente.'
    if (p.length !== 9) return 'El teléfono debe tener 9 dígitos.'
    if (!serviceId && !customSvc) return 'Elige un servicio.'
    if (customSvc && !svcName.trim()) return 'Escribe el nombre del servicio personalizado.'
    if (!Number(price)) return 'Ingresa el precio.'
    return ''
  }
  const validateStep2 = () => {
    if (!date) return 'Elige la fecha.'
    if (!/^\d{2}:\d{2}$/.test(time)) return 'Elige la hora.'
    return ''
  }
  const goNext = () => {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : ''
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(3, s + 1))
  }
  const goBack = () => { setError(''); setStep((s) => Math.max(1, s - 1)) }

  const submit = async () => {
    const p = cleanPhone(phone)
    if (!clientName.trim()) return setError('Escribe el nombre del cliente.')
    if (p.length !== 9) return setError('El teléfono debe tener 9 dígitos.')
    if (!serviceId && !customSvc) return setError('Elige un servicio.')
    if (customSvc && !svcName.trim()) return setError('Escribe el nombre del servicio personalizado.')
    if (!Number(price)) return setError('Ingresa el precio.')
    if (!date) return setError('Elige la fecha.')
    if (!/^\d{2}:\d{2}$/.test(time)) return setError('Elige la hora.')
    setError('')
    setSaving(true)
    const svc = activeServices.find((s) => s.id === serviceId)
    const draft = {
      client: clientName.trim(),
      phone: p,
      barberId: defaultBarberId,
      serviceId: serviceId || null,
      service: customSvc ? svcName.trim() : svc?.name,
      price: Number(price),
      date, time, status,
    }
    const result = await onCreate(draft)
    setSaving(false)
    if (!result?.ok) { setError(result?.error || 'No se pudo crear la reserva.'); return }
    onClose()
  }

  return createPortal((
    <div className="psn-modal" role="dialog" aria-modal="true" aria-label="Nueva reserva">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-newbk">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>
        <h3 className="font-display"><Icon name="calendar" size={18} /> Nueva reserva</h3>
        <p className="psn-role">Paso {step} de 3 · {STEP_LABELS[step]}</p>
        <div className="psn-newbk-progress">
          {[1, 2, 3].map((s) => <span key={s} className={`psn-newbk-progress-seg ${s <= step ? 'is-on' : ''}`} />)}
        </div>

        {/* PASO 1 · CLIENTE & SERVICIO */}
        {step === 1 && (
          <>
            <div className="psn-newbk-sec">
              <span className="dk-kpi-lbl">Cliente</span>
              <div className="dk-suggest-wrap">
                <input
                  className="input"
                  placeholder="Nombre (busca o escribe uno nuevo)"
                  value={clientName}
                  disabled={clientLocked}
                  onChange={(e) => { setClientName(e.target.value); setSuggestOpen(true) }}
                  onFocus={() => setSuggestOpen(true)}
                />
                {clientLocked && (
                  <button type="button" className="psn-newbk-unlock" onClick={unlockClient} aria-label="Cambiar cliente">
                    <Icon name="close" size={13} />
                  </button>
                )}
                {suggestOpen && matches.length > 0 && (
                  <div className="dk-suggest">
                    <div className="dk-suggest-head">Clientes existentes</div>
                    {matches.map((c) => (
                      <button key={c.id || c.phone} type="button" className="dk-suggest-row" onClick={() => pickClient(c)}>
                        <div className="mn">{c.name}<small>+56 {c.phone}</small></div>
                        <div className="mr">{c.visits || 0} visitas</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                className="input"
                placeholder="Teléfono (9 dígitos)"
                inputMode="tel"
                value={phone}
                disabled={clientLocked}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              />
            </div>

            <div className="psn-newbk-sec">
              <span className="dk-kpi-lbl">Servicio</span>
              <div className="dk-cat-grid">
                {activeServices.map((svc) => (
                  <button key={svc.id} type="button"
                    className={`dk-cat-btn ${serviceId === svc.id ? 'is-on' : ''}`}
                    onClick={() => pickService(svc)} title={`${svc.name} · ${CLP(svc.price)}`}>
                    <span className="dk-cat-ic"><Icon name={svcIcon(svc)} size={15} /></span>
                    <span>{svc.name}</span>
                    <small className="psn-newbk-svc-price">{CLP(svc.price)}</small>
                  </button>
                ))}
                <button type="button" className={`dk-cat-btn ${customSvc ? 'is-on' : ''}`} onClick={pickCustom}>
                  <span className="dk-cat-ic"><Icon name="spark" size={15} /></span>
                  <span>Personalizado</span>
                </button>
              </div>
              {customSvc && (
                <input className="input" placeholder="Nombre del servicio" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
              )}
              <input className="input" placeholder="Precio (CLP)" inputMode="numeric"
                value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
            </div>
          </>
        )}

        {/* PASO 2 · FECHA & HORA */}
        {step === 2 && (
          <div className="psn-newbk-sec">
            <span className="dk-kpi-lbl">Fecha y hora</span>
            <input className="input" type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime('') }} />
            {!freeTime ? (
              <>
                <div className="psn-newbk-slots">
                  {(slots || []).map(({ slot, state }, i) => {
                    // Si el servicio dura varias horas, también hay que revisar
                    // que los bloques siguientes estén libres (o existan).
                    let spanBooked = false
                    for (let k = 0; k < blocksNeeded; k++) {
                      const item = (slots || [])[i + k]
                      if (!item || item.state === 'booked') { spanBooked = true; break }
                    }
                    return (
                      <button key={slot} type="button"
                        className={`agenda-tile ${state} ${time === slot ? 'is-sel' : ''}`}
                        disabled={state === 'booked' || spanBooked}
                        title={blocksNeeded > 1 ? `Bloquea ${blocksNeeded} horas seguidas` : undefined}
                        onClick={() => setTime(slot)}>
                        {slot}
                      </button>
                    )
                  })}
                  {slots === null && <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Cargando horarios…</span>}
                </div>
                {blocksNeeded > 1 && (
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Este servicio dura {blocksNeeded} horas: se bloquean {blocksNeeded} horarios seguidos.</span>
                )}
                <button type="button" className="chip psn-chip-btn" style={{ justifySelf: 'start' }} onClick={() => setFreeTime(true)}>
                  <Icon name="clock" size={12} /> Otra hora
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1 }} />
                <button type="button" className="chip psn-chip-btn" onClick={() => { setFreeTime(false); setTime('') }}>Ver horarios</button>
              </div>
            )}
          </div>
        )}

        {/* PASO 3 · CONFIRMAR */}
        {step === 3 && (
          <>
            <div className="psn-newbk-sec">
              <span className="dk-kpi-lbl">Resumen</span>
              <div className="psn-newbk-summary">
                <div><span>Cliente</span><b>{clientName}</b></div>
                <div><span>Servicio</span><b>{customSvc ? svcName : (selectedService?.name || '—')}</b></div>
                <div><span>Fecha</span><b>{date}</b></div>
                <div><span>Hora</span><b>{time || '—'}</b></div>
                <div><span>Precio</span><b>{CLP(Number(price || 0))}</b></div>
              </div>
            </div>
            <div className="psn-newbk-sec">
              <span className="dk-kpi-lbl">Estado inicial</span>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </>
        )}

        {error && <p className="psn-newbk-err"><Icon name="x" size={13} /> {error}</p>}

        <div className="psn-newbk-footer">
          {step === 1 ? (
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={goBack}>Atrás</button>
          )}
          {step < 3 ? (
            <button type="button" className="btn btn-gold" onClick={goNext}>Continuar</button>
          ) : (
            <button type="button" className="btn btn-gold" disabled={saving} onClick={submit}>
              <Icon name="check" size={16} /> {saving ? 'Creando…' : 'Confirmar reserva'}
            </button>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
