import React, { useMemo } from 'react'
import { Icon } from './IconsExtra.jsx'
import { CLP, CLPk, barberById } from '../data.js'

/**
 * DashboardResumen — reemplaza el bloque `{tab === "resumen"}` del Dashboard.
 *
 * Resumen ampliado y responsivo (web + PWA iOS) con más métricas:
 * ingresos del día, reservas del día, ticket promedio, ocupación, gastos del
 * mes, barberos activos, clientes nuevos y ROI de marketing, más paneles de
 * ingresos por día, ranking de barberos, agenda del día, gastos por categoría,
 * marketing/origen de clientes y equipo en turno.
 *
 * Props:
 *  metrics:  objeto METRICS de data.js (ingresos por día, canales, promos, etc.)
 *  bookings: reservas del día (para la agenda y los totales en vivo)
 *  barbers:  lista de barberos (para ranking, equipo y "activos")
 *  expenses: gastos (para el gráfico por categoría) — opcional
 */

const STATUS_DOT = { confirmada: 'var(--green, #6fbf86)', pendiente: 'var(--gold)', 'en curso': '#7ea8ff', completada: 'var(--muted-2)', cancelada: 'var(--red, #d99a8f)' }
const CAT_COLORS = ['#c9a14e', '#9c7a32', '#e6cd90', '#8d8a84', '#5a5852']
const LOGO = '/assets/pimp-studio-logo.jpg'

function Kpi({ icon, label, value, suffix, delta, accent }) {
  const up = delta >= 0
  return (
    <div className={`psn-kpi ${accent ? 'accent' : ''}`}>
      <div className="psn-kpi-top">
        <span className="psn-kpi-label">{label}</span>
        <span className="psn-kpi-ic"><Icon name={icon} size={16} /></span>
      </div>
      <div className="psn-kpi-val">{value}{suffix && <small>{suffix}</small>}</div>
      {delta != null && (
        <div className={`psn-kpi-delta ${up ? 'up' : 'down'}`}>
          <Icon name="trend" size={13} style={{ transform: up ? 'none' : 'scaleY(-1)' }} />
          {up ? '+' : ''}{delta}% <span>vs. ant.</span>
        </div>
      )}
    </div>
  )
}

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.v))
  return (
    <div className="psn-bars">
      {data.map((d, i) => (
        <div key={d.d} className={`col ${i === data.length - 1 ? 'peak' : ''}`}>
          <div className="track"><div className="fill" style={{ height: `${(d.v / max) * 100}%` }} title={CLP(d.v)} /></div>
          <span className="v">{CLPk(d.v)}</span>
          <span className="d">{d.d}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardResumen({ metrics = {}, bookings = [], barbers = [], expenses = [] }) {
  const m = metrics
  const todayKey = new Date().toISOString().slice(0, 10)
  const today = useMemo(() => bookings.filter((b) => !b.date || b.date === todayKey).sort((a, b) => String(a.time).localeCompare(String(b.time))), [bookings, todayKey])

  const dayValid = today.filter((b) => b.status !== 'cancelada')
  const revenueDay = dayValid.reduce((s, b) => s + Number(b.price || 0), 0) || m.revenueDay || 0
  const avgTicket = dayValid.length ? Math.round(revenueDay / dayValid.length) : (m.avgTicket || 0)
  const activeBarbers = barbers.filter((b) => b.active !== false)

  const ranking = useMemo(() => {
    const live = barbers.map((b) => {
      const own = bookings.filter((x) => Number(x.barberId) === Number(b.id) && x.status !== 'cancelada')
      return { id: b.id, cuts: own.length, rev: own.reduce((s, x) => s + Number(x.price || 0), 0) }
    }).filter((r) => r.rev || r.cuts).sort((a, b) => b.rev - a.rev)
    return (live.length ? live : (m.barberRanking || [])).slice(0, 5)
  }, [barbers, bookings, m.barberRanking])
  const maxRev = Math.max(1, ...ranking.map((r) => r.rev))

  // Gastos por categoría (en vivo si hay expenses, si no usa fallback de metrics)
  const expenseCats = useMemo(() => {
    if (expenses.length) {
      const grouped = Object.values(expenses.reduce((acc, e) => {
        const k = e.category || 'Otros'
        acc[k] = acc[k] || { name: k, amount: 0 }
        acc[k].amount += Number(e.amount || 0)
        return acc
      }, {})).sort((a, b) => b.amount - a.amount)
      return grouped.map((c, i) => ({ ...c, color: CAT_COLORS[i % CAT_COLORS.length] }))
    }
    return m.expenseCats || []
  }, [expenses, m.expenseCats])
  const expTotal = expenseCats.reduce((s, c) => s + c.amount, 0)
  let acc = 0
  const stops = expenseCats.map((c) => {
    const start = (acc / (expTotal || 1)) * 360; acc += c.amount; const end = (acc / (expTotal || 1)) * 360
    return `${c.color} ${start}deg ${end}deg`
  }).join(', ')

  const revByDay = m.revenueByDay || []
  const channels = m.channels || []
  const promos = m.promos || []
  const dateLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="animate-in psn-dash">
      <div className="psn-mod-head">
        <div>
          <h2 className="font-display">Resumen del estudio</h2>
          <p>Panel administrador · {dateLabel}</p>
        </div>
        <span className="chip chip-gold"><Icon name="spark" size={13} /> Datos de hoy</span>
      </div>

      <div className="psn-kpis">
        <Kpi icon="wallet"   label="Ingresos del día" value={CLP(revenueDay)} delta={m.revenueDayDelta} accent />
        <Kpi icon="calendar" label="Reservas del día" value={dayValid.length || today.length} delta={m.bookingsDayDelta} />
        <Kpi icon="chart"    label="Ticket promedio"  value={CLP(avgTicket)} delta={m.avgTicketDelta} />
        <Kpi icon="trend"    label="Ocupación"        value={m.occupancy ?? 0} suffix="%" delta={m.occupancyDelta} />
        <Kpi icon="wallet"   label="Gastos del mes"   value={CLP(expTotal || m.expensesMonth || 0)} delta={m.expensesDelta} />
        <Kpi icon="users"    label="Barberos activos" value={`${activeBarbers.length}`} suffix={`/${barbers.length}`} />
        <Kpi icon="user"     label="Clientes nuevos"  value={m.newClients ?? 0} delta={m.newClientsDelta} accent />
        <Kpi icon="spark"    label="ROI marketing"    value={m.marketingRoi ?? 0} suffix="x" delta={m.marketingRoiDelta} />
      </div>

      <div className="psn-bento">
        <div className="card psn-panel span-7">
          <div className="psn-panel-head"><h3 className="font-display">Ingresos por día</h3><span className="chip chip-gold">{CLP(revByDay.reduce((s, d) => s + d.v, 0))}</span></div>
          <Bars data={revByDay} />
        </div>

        <div className="card psn-panel span-5">
          <div className="psn-panel-head"><h3 className="font-display">Mis ventas de la semana</h3><span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Esta semana</span></div>
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {ranking.map((r, i) => {
              const b = barbers.find((x) => Number(x.id) === Number(r.id)) || barberById(r.id) || {}
              return (
                <div key={r.id} className={`psn-rank ${i === 0 ? 'top' : ''}`}>
                  <span className="pos">{i + 1}</span>
                  <img className="av" src={b.photo || LOGO} alt={b.short || b.name} onError={(e) => { if (e.currentTarget.src !== window.location.origin + LOGO) e.currentTarget.src = LOGO }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{b.short || b.name}</div>
                    <div className="bar"><i style={{ width: `${(r.rev / maxRev) * 100}%` }} /></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.82rem', color: 'var(--ink-soft)' }}>{CLP(r.rev)}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--muted-2)' }}>{r.cuts} cortes</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card psn-panel span-5">
          <div className="psn-panel-head"><h3 className="font-display">Reservas del día</h3><span className="chip">{today.length} citas</span></div>
          <div className="psn-today">
            {today.map((bk) => {
              const b = barbers.find((x) => Number(x.id) === Number(bk.barberId)) || barberById(bk.barberId) || {}
              return (
                <div key={bk.id || bk.time} className="psn-today-row">
                  <span className="t">{bk.time}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="c">{bk.client}</div>
                    <div className="s">{bk.service} · {b.short || b.name}</div>
                  </div>
                  <span className="dot" style={{ background: STATUS_DOT[bk.status] || 'var(--muted-2)' }} title={bk.status} />
                </div>
              )
            })}
            {!today.length && <div style={{ color: 'var(--muted)', fontSize: '.85rem', padding: '1rem' }}>Sin reservas para hoy.</div>}
          </div>
        </div>

        <div className="card psn-panel span-4">
          <div className="psn-panel-head"><h3 className="font-display">Gastos del mes</h3><span className="chip">{CLP(expTotal)}</span></div>
          <div className="psn-donut-wrap">
            <div className="psn-donut" style={{ background: `conic-gradient(${stops || 'var(--muted-2) 0deg 360deg'})` }}>
              <div className="psn-donut-c"><b>{CLPk(expTotal)}</b><span>total</span></div>
            </div>
            <div className="psn-donut-legend">
              {expenseCats.map((c) => (
                <div key={c.name} className="row"><span className="dot" style={{ background: c.color }} />{c.name}<span>{CLP(c.amount)}</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="card psn-panel span-8">
          <div className="psn-panel-head"><h3 className="font-display">Marketing · origen de clientes</h3>{m.marketingRoi != null && <span className="chip chip-gold">ROI {m.marketingRoi}x</span>}</div>
          <div className="psn-mkt">
            <div style={{ display: 'grid', gap: '.7rem' }}>
              {channels.map((c) => (
                <div key={c.name} className="psn-chan">
                  <div className="lbl"><span><span className="dot" style={{ background: c.color }} />{c.name}</span><span>{c.pct}%</span></div>
                  <div className="bar"><i style={{ width: `${c.pct}%`, background: c.color }} /></div>
                </div>
              ))}
            </div>
            <div className="psn-promos">
              {promos.map((p) => (
                <div key={p.name} className="row"><div className="l"><b>{p.name}</b><span>{p.uses} usos</span></div><span className="chip chip-green">{p.status}</span></div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
