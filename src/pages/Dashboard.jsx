import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, Stat } from '../components/ui.jsx'
import { ThemeProvider, ThemeToggle, useTheme } from '../components/theme.jsx'
import MobileDock from '../components/MobileDock.jsx'
import { BARBERS, CLIENTS, EXPENSES, METRICS, SERVICES, TODAY_BOOKINGS, barberById, CLP, CLPk, isAdminUser } from '../data.js'

const AGENDA_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"]
const DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function buildWeek(offset = 0) {
  const now = new Date()
  const monday = new Date(now)
  const day = monday.getDay() || 7
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return { key: isoDate(date), label: `${DAY_LABELS[date.getDay()]} ${date.getDate()}` }
  })
}

function localBlockKey(barberId, date, slot) {
  return `${barberId}|${date}|${slot}`
}

function readLocalBlocks() {
  try { return JSON.parse(localStorage.getItem("ps_availability_blocks") || "{}") } catch { return {} }
}

function writeLocalBlocks(blocks) {
  localStorage.setItem("ps_availability_blocks", JSON.stringify(blocks))
}

function BarChart({ data, fmt }) {
  const max = Math.max(...data.map((d) => d.v))
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: ".7rem", height: 160, padding: "0 .2rem" }}>
      {data.map((d, i) => (
        <div key={d.d} style={{ flex: 1, display: "grid", justifyItems: "center", gap: ".5rem", height: "100%", gridTemplateRows: "1fr auto auto" }}>
          <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: "100%" }}>
            <div title={fmt(d.v)} style={{ width: "100%", height: `${(d.v / max) * 100}%`, borderRadius: "6px 6px 0 0", background: i === data.length - 1 ? "var(--gold-grad)" : "linear-gradient(180deg,#3a3935,#222220)" }} />
          </div>
          <span style={{ fontSize: ".66rem", color: "var(--muted-2)" }}>{CLPk(d.v)}</span>
          <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{d.d}</span>
        </div>
      ))}
    </div>
  )
}

function Panel({ title, action, children, style }) {
  return (
    <div className="card dashboard-panel" style={{ padding: "1.3rem", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
        <h3 className="font-display" style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("resumen")
  const [agendaBarber, setAgendaBarber] = useState(6)
  const [weekOffset, setWeekOffset] = useState(0)
  const [availability, setAvailability] = useState({})
  const [agendaBusy, setAgendaBusy] = useState("")
  const [barber, setBarber] = useState(null)
  const [barbers, setBarbers] = useState(BARBERS.map((item) => ({ ...item, active: true })))
  const [bookings, setBookings] = useState(TODAY_BOOKINGS.map((item, index) => ({ ...item, id: index + 1, date: isoDate(new Date()) })))
  const [clients, setClients] = useState(CLIENTS)
  const [clientQuery, setClientQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientHistory, setClientHistory] = useState([])
  const [services, setServices] = useState(SERVICES.map((item) => ({ ...item, active: true })))
  const [expenses, setExpenses] = useState(EXPENSES)
  const [serviceDraft, setServiceDraft] = useState({ name: "", price: "", min: 60, cat: "general", desc: "", tne: false })
  const [expenseDraft, setExpenseDraft] = useState({ date: new Date().toISOString().slice(0, 10), category: "Insumos", detail: "", amount: "" })
  const [barberDraft, setBarberDraft] = useState({ name: "", code: "", role: "Barbero", tier: "general", pin: "1234", canViewFinance: false, canManageTeam: false, canEditServices: false, canManageBlocks: true })
  const m = METRICS
  const admin = isAdminUser(barber)
  const canViewFinance = admin || barber?.canViewFinance
  const canEditServices = admin || barber?.canEditServices
  const canManageTeam = admin || barber?.canManageTeam
  const completedBookings = bookings.filter((item) => item.status === "completada" || item.status === "confirmada" || item.status === "en curso")
  const revenueTotal = completedBookings.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const avgTicket = completedBookings.length ? Math.round(revenueTotal / completedBookings.length) : m.avgTicket
  const visibleBookings = admin ? bookings : bookings.filter((item) => Number(item.barberId) === Number(barber?.id))
  const ranking = barbers.map((b) => {
    const own = bookings.filter((item) => Number(item.barberId) === Number(b.id) && item.status !== "cancelada")
    return { id: b.id, cuts: own.filter((item) => item.status === "completada").length || own.length, rev: own.reduce((sum, item) => sum + Number(item.price || 0), 0) }
  }).filter((item) => item.cuts || item.rev).sort((a, b) => b.rev - a.rev)
  const maxRev = Math.max(1, ...ranking.map((r) => r.rev), ...m.barberRanking.map((r) => r.rev))
  const revenueByService = Object.values(completedBookings.reduce((acc, item) => {
    const key = item.service || "Servicio"
    acc[key] = acc[key] || { name: key, total: 0 }
    acc[key].total += Number(item.price || 0)
    return acc
  }, {})).sort((a, b) => b.total - a.total)
  const revenueByDate = Object.values(completedBookings.reduce((acc, item) => {
    const key = item.date || "Sin fecha"
    acc[key] = acc[key] || { d: key.slice(5).replace("-", "/"), v: 0 }
    acc[key].v += Number(item.price || 0)
    return acc
  }, {})).slice(-7)
  const filteredClients = clients.filter((client) => {
    const haystack = `${client.name || ""} ${client.phone || ""} ${client.email || ""}`.toLowerCase()
    return haystack.includes(clientQuery.trim().toLowerCase())
  })

  useEffect(() => {
    const stored = localStorage.getItem("ps_barber")
    if (!stored) { navigate("/ingreso"); return }
    const parsed = JSON.parse(stored)
    setBarber(parsed)
    const headers = authHeaders()
    fetch("/api/clients", { headers }).then((r) => r.json()).then((data) => { if (data.clients?.length) setClients(data.clients) }).catch(() => {})
    fetch("/api/barbers?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.barbers?.length) setBarbers(data.barbers) }).catch(() => {})
    fetch("/api/bookings", { headers }).then((r) => r.json()).then((data) => { if (data.bookings?.length) setBookings(data.bookings) }).catch(() => {})
    fetch("/api/services?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.services?.length) setServices(data.services) }).catch(() => {})
    fetch("/api/expenses", { headers }).then((r) => r.json()).then((data) => { if (data.expenses?.length) setExpenses(data.expenses) }).catch(() => {})
  }, [])

  const logout = () => { localStorage.removeItem("ps_barber"); localStorage.removeItem("ps_barber_token"); navigate("/") }
  const weekDays = buildWeek(weekOffset)

  function authHeaders(extra = {}) {
    const token = localStorage.getItem("ps_barber_token") || ""
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
  }

  const loadAgenda = async () => {
    const entries = await Promise.all(weekDays.map(async (day) => {
      const data = await fetch(`/api/availability?barberId=${agendaBarber}&date=${day.key}&detail=true`)
        .then((r) => r.headers.get("content-type")?.includes("application/json") ? r.json() : Promise.reject(new Error("api unavailable")))
        .catch(() => ({ slots: [] }))
      const apiSlots = data.slots?.length ? data.slots : AGENDA_SLOTS.map((slot) => ({ slot, available: true, state: "free" }))
      const localBlocks = readLocalBlocks()
      const merged = apiSlots.map((item) => {
        const key = localBlockKey(agendaBarber, day.key, item.slot)
        if (item.state !== "booked" && localBlocks[key]) return { ...item, available: false, state: "blocked" }
        return item
      })
      return [day.key, merged]
    }))
    setAvailability(Object.fromEntries(entries))
  }

  useEffect(() => {
    if (!barber) return
    loadAgenda()
  }, [barber, agendaBarber, weekOffset])

  const nav = [
    ["resumen",   "grid",     "Resumen"],
    ["agenda",    "calendar", "Agenda"],
    ["reservas",  "scissors", "Reservas"],
    ...(canViewFinance ? [["finanzas", "wallet", "Finanzas"]] : []),
    ["clientes",  "user",     "Clientes"],
    ...(canEditServices ? [["servicios", "cut", "Servicios"]] : []),
    ...(admin ? [["gastos", "wallet", "Gastos"]] : []),
    ["marketing", "spark",    "Marketing"],
    ["config",    "key",      "Config."],
  ]

  const saveService = async (service) => {
    const payload = service?.id ? service : serviceDraft
    if (!payload.name || !payload.price || !payload.min) return
    const method = payload.id ? "PATCH" : "POST"
    const data = { ...payload, price: Number(payload.price), min: Number(payload.min) }
    const res = await fetch("/api/services", { method, headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(data) }).catch(() => null)
    const json = res ? await res.json().catch(() => ({})) : {}
    const saved = json.service || data
    setServices((items) => payload.id ? items.map((item) => item.id === saved.id ? { ...item, ...saved } : item) : [{ ...saved, id: saved.id || Date.now(), active: true }, ...items])
    if (!payload.id) setServiceDraft({ name: "", price: "", min: 60, cat: "general", desc: "", tne: false })
  }

  const saveExpense = async () => {
    if (!expenseDraft.detail || !expenseDraft.amount) return
    const payload = { ...expenseDraft, amount: Number(expenseDraft.amount), owner: barber?.name || "Brunetti" }
    const res = await fetch("/api/expenses", { method: "POST", headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(payload) }).catch(() => null)
    const json = res ? await res.json().catch(() => ({})) : {}
    setExpenses((items) => [json.expense || { ...payload, id: Date.now() }, ...items])
    setExpenseDraft({ date: new Date().toISOString().slice(0, 10), category: "Insumos", detail: "", amount: "" })
  }

  const saveBarber = async (payload) => {
    if (!payload.name || !payload.code) return
    const method = payload.id ? "PATCH" : "POST"
    const res = await fetch("/api/barbers", { method, headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(payload) }).catch(() => null)
    const json = res ? await res.json().catch(() => ({})) : {}
    const saved = json.barber || { ...payload, id: payload.id || Date.now(), active: payload.active !== false }
    setBarbers((items) => payload.id ? items.map((item) => item.id === saved.id ? { ...item, ...payload, ...saved } : item) : [...items, { ...saved, ...payload, active: true }])
    if (!payload.id) setBarberDraft({ name: "", code: "", role: "Barbero", tier: "general", pin: "1234", canViewFinance: false, canManageTeam: false, canEditServices: false, canManageBlocks: true })
  }

  const updateBarberLocal = (id, patch) => {
    setBarbers((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  const updateBookingStatus = async (booking, status) => {
    setBookings((items) => items.map((item) => item.id === booking.id ? { ...item, status } : item))
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: booking.id, status }),
    }).catch(() => null)
    if (res && !res.ok) {
      setBookings((items) => items.map((item) => item.id === booking.id ? booking : item))
    }
  }

  const openClient = async (client) => {
    setSelectedClient(client)
    const local = bookings.filter((item) => item.phone === client.phone)
    setClientHistory(local)
    const data = await fetch(`/api/bookings?phone=${client.phone}`)
      .then((r) => r.headers.get("content-type")?.includes("application/json") ? r.json() : Promise.reject(new Error("api unavailable")))
      .catch(() => ({ bookings: local }))
    setClientHistory(data.bookings?.length ? data.bookings : local)
  }

  const toggleSlot = async (dayKey, slot, state) => {
    if (state === "booked") return
    const busyKey = `${dayKey}-${slot}`
    setAgendaBusy(busyKey)
    const method = state === "blocked" ? "DELETE" : "POST"
    const body = JSON.stringify({ barberId: agendaBarber, date: dayKey, slot, reason: "Bloqueado desde agenda interna" })
    const previous = availability
    const localBlocks = readLocalBlocks()
    const key = localBlockKey(agendaBarber, dayKey, slot)
    if (state === "blocked") delete localBlocks[key]
    else localBlocks[key] = { barberId: agendaBarber, date: dayKey, slot }
    writeLocalBlocks(localBlocks)
    setAvailability((current) => ({
      ...current,
      [dayKey]: (current[dayKey] || []).map((item) => item.slot === slot ? { ...item, available: state === "blocked", state: state === "blocked" ? "free" : "blocked" } : item),
    }))
    const res = await fetch("/api/availability", { method, headers: authHeaders({ "Content-Type": "application/json" }), body }).catch(() => null)
    if (res && !res.ok) setAvailability(previous)
    await loadAgenda()
    setAgendaBusy("")
  }

  if (!barber) return null

  return (
    <ThemeProvider>
    <DashboardShell
      tab={tab}
      setTab={setTab}
      nav={nav}
      barber={barber}
      onLogout={logout}
    >
      <main className="dashboard-main">
        <DashboardTopbar
          title={nav.find((n) => n[0] === tab)?.[2] || 'Panel'}
          barber={barber}
          onLogout={logout}
          tab={tab}
          setTab={setTab}
          nav={nav}
        />

        {/* RESUMEN */}
        {tab === "resumen" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="wallet"   label="Ingresos agenda"  value={CLP(revenueTotal)}  delta={m.revenueWeekDelta}  accent />
              <Stat icon="calendar" label="Reservas"         value={visibleBookings.length}       delta={m.bookingsWeekDelta} />
              <Stat icon="chart"    label="Ticket promedio"  value={CLP(avgTicket)}     delta={m.avgTicketDelta} />
              <Stat icon="trend"    label="Ocupación"        value={m.occupancy}          suffix="%" delta={m.occupancyDelta} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.1rem" }}>
              <Panel title="Ingresos por día" action={<span className="chip chip-gold">{CLP(revenueTotal)}</span>}>
                <BarChart data={m.revenueByDay} fmt={CLP} />
              </Panel>
              <Panel title="Ranking barberos" action={<span style={{ fontSize: ".74rem", color: "var(--muted)" }}>Esta semana</span>}>
                <div style={{ display: "grid", gap: ".7rem" }}>
                  {(ranking.length ? ranking : m.barberRanking).slice(0, 5).map((r, i) => {
                    const b = barbers.find((item) => item.id === r.id) || barberById(r.id)
                    return (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
                        <span className="font-display" style={{ width: 20, color: i === 0 ? "var(--gold)" : "var(--muted-2)", fontWeight: 700 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: ".86rem", fontWeight: 500 }}>{b?.name}</div>
                          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", marginTop: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(r.rev / maxRev) * 100}%`, background: i === 0 ? "var(--gold-grad)" : "#4a4943", borderRadius: 99 }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: ".82rem", color: "var(--ink-soft)" }}>{CLP(r.rev)}</div>
                          <div style={{ fontSize: ".68rem", color: "var(--muted-2)" }}>{r.cuts} cortes</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </div>
            <Panel title="Origen de clientes">
              <div style={{ display: "grid", gap: ".7rem" }}>
                {m.channels.map((c) => (
                  <div key={c.name} style={{ display: "grid", gap: ".3rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem" }}><span style={{ color: "var(--ink-soft)" }}>{c.name}</span><span style={{ color: "var(--muted)" }}>{c.pct}%</span></div>
                    <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 99 }} /></div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* AGENDA */}
        {tab === "agenda" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: ".74rem", color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>Barbero:</span>
              {barbers.filter((item) => item.active !== false).map((b) => (
                <button key={b.id} onClick={() => setAgendaBarber(b.id)} className="chip" style={{ cursor: "pointer", borderColor: agendaBarber === b.id ? "var(--gold-line)" : "var(--hair-2)", color: agendaBarber === b.id ? "var(--gold-lt)" : "var(--ink-soft)", background: agendaBarber === b.id ? "rgba(201,161,78,0.08)" : "transparent" }}>{b.short}</button>
              ))}
            </div>
            <Panel
              title={`Agenda · ${(barbers.find((item) => item.id === agendaBarber) || barberById(agendaBarber))?.name || "Barbero"}`}
              action={
                <div className="week-picker">
                  <button className="chip" onClick={() => setWeekOffset(weekOffset - 1)}><Icon name="arrowLeft" size={13} /> Anterior</button>
                  <span className="chip chip-gold">Semana {weekOffset === 0 ? "actual" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}</span>
                  <button className="chip" onClick={() => setWeekOffset(weekOffset + 1)}>Siguiente <Icon name="arrowRight" size={13} /></button>
                  {weekOffset !== 0 && <button className="chip" onClick={() => setWeekOffset(0)}>Hoy</button>}
                </div>
              }
            >
              <div className="agenda-week-summary">
                <div><strong>{weekDays[0]?.key}</strong><span>Inicio</span></div>
                <div><strong>{weekDays[5]?.key}</strong><span>Fin</span></div>
                <div><strong>1 hora</strong><span>Duracion de bloque</span></div>
                <div><strong>{(Object.values(availability).flat().filter((item) => item.state === "free").length)}</strong><span>Disponibles</span></div>
              </div>
              <div className="agenda-legend">
                <span><i className="free" /> Atiende</span>
                <span><i className="blocked" /> Bloqueado</span>
                <span><i className="booked" /> Reservado</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <div className="agenda-grid">
                  <div />
                  {weekDays.map((d) => <div key={d.key} className="agenda-day-head">{d.label}<span>{d.key.slice(5).replace("-", "/")}</span></div>)}
                  {AGENDA_SLOTS.map((t) => (
                    <React.Fragment key={t}>
                      <div className="agenda-time">{t}</div>
                      {weekDays.map((day) => {
                        const slotInfo = (availability[day.key] || []).find((item) => item.slot === t)
                        const state = slotInfo?.state || (slotInfo?.available === false ? "blocked" : "free")
                        const busy = agendaBusy === `${day.key}-${t}`
                        return (
                          <button
                            key={day.key}
                            className={`agenda-slot ${state}`}
                            disabled={state === "booked" || busy}
                            title={state === "booked" ? "Reservado por cliente" : state === "blocked" ? "Tocar para atender" : "Tocar para bloquear"}
                            onClick={() => toggleSlot(day.key, t, state)}
                          >
                            {busy ? "..." : state === "booked" ? "Reservado" : state === "blocked" ? "Bloqueado" : "Atiende"}
                          </button>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Panel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              <Stat icon="calendar" label="Reservados semana" value={Object.values(availability).flat().filter((item) => item.state === "booked").length} />
              <Stat icon="clock"    label="Horas disponibles" value={(Object.values(availability).flat().filter((item) => item.state === "free").length * 0.5).toFixed(1)} suffix="h" />
              <Stat icon="trend"    label="Bloques cerrados" value={Object.values(availability).flat().filter((item) => item.state === "blocked").length} accent />
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {tab === "reservas" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {["Todas", "Confirmadas", "En curso", "Pendientes"].map((f, i) => (
                <span key={f} className={i === 0 ? "chip chip-gold" : "chip"} style={{ cursor: "pointer" }}>{f}</span>
              ))}
            </div>
            <Panel title={admin ? "Reservas internas" : "Mis reservas"} action={<span className="chip">{visibleBookings.length} citas</span>}>
              <div style={{ display: "grid", gap: ".4rem", overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.6fr 1fr 90px 110px", gap: ".5rem", padding: "0 .6rem .5rem", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted-2)", minWidth: 600 }}>
                  <span>Hora</span><span>Cliente</span><span>Servicio</span><span>Barbero</span><span>Total</span><span>Estado</span>
                </div>
                {visibleBookings.map((bk, i) => {
                  const b = barbers.find((item) => item.id === bk.barberId) || barberById(bk.barberId)
                  const stc = { "confirmada": ["rgba(201,161,78,0.1)", "var(--gold-lt)"], "en curso": ["rgba(120,180,140,0.12)", "#9fd0a0"], "pendiente": ["rgba(255,255,255,0.05)", "var(--muted)"] }[bk.status] || ["transparent", "var(--muted)"]
                  return (
                    <div key={bk.id || i} style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.6fr 1fr 90px 130px", gap: ".5rem", alignItems: "center", padding: ".7rem .6rem", borderRadius: 9, background: "rgba(255,255,255,0.02)", border: "1px solid var(--hair)", fontSize: ".84rem", minWidth: 640 }}>
                      <span className="font-display gold-text" style={{ fontWeight: 600 }}>{bk.time}</span>
                      <span style={{ fontWeight: 500 }}>{bk.client}<small style={{ display: "block", color: "var(--muted-2)", fontWeight: 400 }}>{bk.date}</small></span>
                      <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bk.service}</span>
                      <span style={{ color: "var(--ink-soft)" }}>{b?.short}</span>
                      <span style={{ color: "var(--ink-soft)" }}>{CLP(bk.price)}</span>
                      <select className="status-select" value={bk.status} style={{ background: stc[0], color: stc[1] }} onChange={(e) => updateBookingStatus(bk, e.target.value)}>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="en curso">En curso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>
        )}

        {/* FINANZAS */}
        {tab === "finanzas" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="wallet"   label="Ingresos agenda" value={CLP(revenueTotal)} delta={9.6} accent />
              <Stat icon="chart"    label="Ticket promedio" value={CLP(avgTicket)} delta={3.2} />
              <Stat icon="scissors" label="Servicios"       value={completedBookings.length} delta={6.4} />
              <Stat icon="trend"    label="Proyección"      value={CLP(revenueTotal * 4)} delta={6.3} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.1rem" }}>
              <Panel title="Ingresos por día"><BarChart data={revenueByDate.length ? revenueByDate : m.revenueByDay} fmt={CLP} /></Panel>
              <Panel title="Ingresos por servicio">
                <div style={{ display: "grid", gap: ".75rem" }}>
                  {(revenueByService.length ? revenueByService : [["Corte de cabello", 38], ["Corte + barba", 26], ["Químicos / color", 18], ["Brunetti premium", 12], ["Perfilado barba", 6]].map(([name, pct]) => ({ name, total: pct }))).slice(0, 5).map((item) => {
                    const p = revenueByService.length ? Math.round((item.total / Math.max(1, revenueTotal)) * 100) : item.total
                    return (
                      <div key={item.name} style={{ display: "grid", gap: ".3rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}><span style={{ color: "var(--ink-soft)" }}>{item.name}</span><span className="gold-text" style={{ fontWeight: 600 }}>{p}%</span></div>
                        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: "var(--gold-grad)", borderRadius: 99 }} /></div>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </div>
            <Panel title="Ingresos por barbero">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: ".8rem" }}>
                {(ranking.length ? ranking : m.barberRanking).map((r) => {
                  const b = barbers.find((item) => item.id === r.id) || barberById(r.id)
                  return (
                    <div key={r.id} style={{ padding: "1rem", border: "1px solid var(--hair)", borderRadius: 12, background: "rgba(0,0,0,0.25)" }}>
                      <span style={{ fontSize: ".8rem", color: "var(--muted)", display: "block", marginBottom: ".3rem" }}>{b?.short}</span>
                      <span className="font-display gold-text" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{CLP(r.rev)}</span>
                      <span style={{ fontSize: ".72rem", color: "var(--muted-2)", display: "block", marginTop: ".2rem" }}>{r.cuts} servicios</span>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>
        )}

        {/* CLIENTES */}
        {tab === "clientes" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="user" label="Clientes" value={clients.length} accent />
              <Stat icon="scissors" label="Cortes registrados" value={clients.reduce((sum, item) => sum + Number(item.visits || 0), 0)} />
              <Stat icon="wallet" label="Valor historial" value={CLP(clients.reduce((sum, item) => sum + Number(item.totalSpent || 0), 0))} />
            </div>
            <div className="clients-workspace">
              <Panel title="Panel de clientes" action={<span className="chip chip-gold">Telefono como ID</span>}>
                <div className="client-search">
                  <Icon name="user" size={15} />
                  <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Buscar por nombre, telefono o correo" />
                </div>
                <div className="client-list">
                  {filteredClients.map((client) => (
                    <button key={client.id || client.phone} className={`client-row ${selectedClient?.phone === client.phone ? "is-selected" : ""}`} onClick={() => openClient(client)}>
                      <div>
                        <strong>{client.name}</strong>
                        <span>+56 {client.phone} · {client.email || "sin correo"}</span>
                      </div>
                      <div><strong>{client.visits || 0}</strong><span>visitas</span></div>
                      <div><strong>{CLP(client.totalSpent || 0)}</strong><span>{client.lastVisit || "sin visitas"}</span></div>
                      <span className="chip">{client.status || "activo"}</span>
                    </button>
                  ))}
                  {!filteredClients.length && (
                    <div className="empty-state">No hay clientes que coincidan con la busqueda.</div>
                  )}
                </div>
              </Panel>
              <Panel title="Historial del cliente" action={selectedClient ? <span className="chip">{clientHistory.length} registros</span> : <span className="chip">Selecciona un cliente</span>}>
                {selectedClient ? (
                  <div className="client-detail">
                    <div className="client-profile">
                      <div className="client-avatar">{(selectedClient.name || "C")[0]?.toUpperCase()}</div>
                      <div>
                        <strong>{selectedClient.name}</strong>
                        <span>+56 {selectedClient.phone}</span>
                        <span>{selectedClient.email || "sin correo"}</span>
                      </div>
                    </div>
                    <div className="client-kpis">
                      <div><strong>{selectedClient.visits || clientHistory.length}</strong><span>Cortes</span></div>
                      <div><strong>{CLP(selectedClient.totalSpent || clientHistory.reduce((sum, item) => sum + Number(item.price || 0), 0))}</strong><span>Total</span></div>
                      <div><strong>{selectedClient.lastVisit || clientHistory[0]?.date || "sin fecha"}</strong><span>Ultima visita</span></div>
                    </div>
                    <div className="history-list">
                      {clientHistory.map((item) => {
                        const b = barbers.find((barberItem) => Number(barberItem.id) === Number(item.barberId)) || barberById(item.barberId)
                        return (
                          <div key={item.id || `${item.date}-${item.time}`} className="history-row">
                            <div><strong>{item.service}</strong><span>{item.date} · {item.time}</span></div>
                            <div><span>{b?.short || b?.name || "Barbero"}</span><strong>{CLP(item.price)}</strong></div>
                            <span className="chip">{item.status}</span>
                          </div>
                        )
                      })}
                      {!clientHistory.length && <div className="empty-state">Este cliente aun no tiene historial de reservas.</div>}
                    </div>
                    <button className="btn btn-gold btn-block" onClick={() => navigate("/reservar")}><Icon name="calendar" size={15} /> Agendar para este cliente</button>
                  </div>
                ) : (
                  <div className="empty-state">Selecciona un cliente para revisar sus visitas, consumo e historial.</div>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* SERVICIOS */}
        {tab === "servicios" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <Panel title="Nuevo servicio" action={<span className="chip">Impacta la web publica</span>}>
              <div className="admin-form-grid">
                <input className="input" placeholder="Nombre" value={serviceDraft.name} onChange={(e) => setServiceDraft({ ...serviceDraft, name: e.target.value })} />
                <input className="input" placeholder="Precio" inputMode="numeric" value={serviceDraft.price} onChange={(e) => setServiceDraft({ ...serviceDraft, price: e.target.value.replace(/\D/g, "") })} />
                <input className="input" placeholder="Minutos" inputMode="numeric" value={serviceDraft.min} onChange={(e) => setServiceDraft({ ...serviceDraft, min: e.target.value.replace(/\D/g, "") })} />
                <select className="input" value={serviceDraft.cat} onChange={(e) => setServiceDraft({ ...serviceDraft, cat: e.target.value })}>
                  <option value="general">General</option>
                  <option value="premium">Premium</option>
                  <option value="quimico">Quimico</option>
                </select>
                <input className="input" placeholder="Descripcion" value={serviceDraft.desc} onChange={(e) => setServiceDraft({ ...serviceDraft, desc: e.target.value })} />
                <button className="btn btn-gold btn-block" onClick={() => saveService()}><Icon name="check" size={15} /> Crear</button>
              </div>
            </Panel>
            <Panel title="Servicios publicados">
              <div style={{ display: "grid", gap: ".55rem" }}>
                {services.map((service) => (
                  <div key={service.id} className="admin-row service-row">
                    <input className="input" value={service.name} onChange={(e) => setServices((items) => items.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item))} />
                    <input className="input" inputMode="numeric" value={service.price} onChange={(e) => setServices((items) => items.map((item) => item.id === service.id ? { ...item, price: e.target.value.replace(/\D/g, "") } : item))} />
                    <input className="input" inputMode="numeric" value={service.min} onChange={(e) => setServices((items) => items.map((item) => item.id === service.id ? { ...item, min: e.target.value.replace(/\D/g, "") } : item))} />
                    <button className={service.active === false ? "chip" : "chip chip-gold"} onClick={() => saveService({ ...service, active: service.active === false })}>{service.active === false ? "Oculto" : "Publicado"}</button>
                    <button className="btn btn-dark btn-sm" onClick={() => saveService(service)}>Guardar</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* GASTOS */}
        {tab === "gastos" && admin && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="wallet" label="Gastos mes" value={CLP(expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0))} accent />
              <Stat icon="chart" label="Registros" value={expenses.length} />
            </div>
            <Panel title="Ingresar gasto">
              <div className="admin-form-grid">
                <input className="input" type="date" value={expenseDraft.date} onChange={(e) => setExpenseDraft({ ...expenseDraft, date: e.target.value })} />
                <input className="input" placeholder="Categoria" value={expenseDraft.category} onChange={(e) => setExpenseDraft({ ...expenseDraft, category: e.target.value })} />
                <input className="input" placeholder="Detalle" value={expenseDraft.detail} onChange={(e) => setExpenseDraft({ ...expenseDraft, detail: e.target.value })} />
                <input className="input" placeholder="Monto" inputMode="numeric" value={expenseDraft.amount} onChange={(e) => setExpenseDraft({ ...expenseDraft, amount: e.target.value.replace(/\D/g, "") })} />
                <button className="btn btn-gold btn-block" onClick={saveExpense}><Icon name="check" size={15} /> Registrar</button>
              </div>
            </Panel>
            <Panel title="Ultimos gastos">
              <div style={{ display: "grid", gap: ".55rem" }}>
                {expenses.map((expense) => (
                  <div key={expense.id} className="admin-row">
                    <div><strong>{expense.category}</strong><span>{expense.detail}</span></div>
                    <div><strong>{CLP(expense.amount)}</strong><span>{expense.date}</span></div>
                    <span className="chip">{expense.owner}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* CONFIG */}
        {tab === "config" && (
          <ConfigPanel
            barber={barber}
            barbers={barbers}
            admin={admin}
            canManageTeam={canManageTeam}
            barberDraft={barberDraft}
            setBarberDraft={setBarberDraft}
            saveBarber={saveBarber}
            updateBarberLocal={updateBarberLocal}
            onLogout={logout}
            nav={nav}
          />
        )}

        {/* MARKETING */}
        {tab === "marketing" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="user"     label="Clientes nuevos" value={m.newClients}  delta={14.2} accent />
              <Stat icon="trend"    label="Recurrencia"     value="77"            suffix="%" delta={4.1} />
              <Stat icon="gift"     label="Promos activas"  value="3" />
              <Stat icon="star"     label="Reseñas"         value="4.9"           suffix="★" delta={1.2} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.1rem" }}>
              <Panel title="Origen de clientes">
                <div style={{ display: "grid", gap: ".7rem" }}>
                  {m.channels.map((c) => (
                    <div key={c.name} style={{ display: "grid", gap: ".3rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
                        <span style={{ display: "inline-flex", gap: ".5rem", alignItems: "center", color: "var(--ink-soft)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />{c.name}</span>
                        <span style={{ color: "var(--muted)" }}>{c.pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 99 }} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Promociones activas">
                <div style={{ display: "grid", gap: ".7rem" }}>
                  {m.promos.map((p) => (
                    <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".8rem", border: "1px solid var(--hair)", borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
                      <div>
                        <div style={{ fontSize: ".88rem", fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{p.uses} usos</div>
                      </div>
                      <span className="chip chip-gold" style={{ fontSize: ".66rem" }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
    </ThemeProvider>
  )
}

/* ============================================================
   Config Panel — Santa Julieta style two-column settings
   ============================================================ */
const CFG_SECTIONS = [
  { id: "cuenta",        icon: "user",     label: "Cuenta y seguridad" },
  { id: "apariencia",    icon: "star",     label: "Apariencia" },
  { id: "accesos",       icon: "pin",      label: "Accesos directos" },
  { id: "navegacion",    icon: "grid",     label: "Navegacion" },
  { id: "notificaciones",icon: "bell",     label: "Notificaciones" },
  { id: "whatsapp",      icon: "whatsapp", label: "WhatsApp" },
  { id: "negocio",       icon: "scissors", label: "Negocio" },
  { id: "equipo",        icon: "key",      label: "Equipo y permisos" },
  { id: "datos",         icon: "wallet",   label: "Datos y respaldos" },
  { id: "acerca",        icon: "spark",    label: "Acerca de" },
]

function PinDots({ value }) {
  return (
    <div style={{ display: "flex", gap: ".75rem", margin: ".5rem 0 1rem" }}>
      {[0,1,2,3].map((i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < value.length ? "var(--gold)" : "var(--hair-2)", border: "1px solid var(--gold-line)", transition: "background .15s" }} />
      ))}
    </div>
  )
}

function ConfigSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: disabled ? "default" : "pointer",
        background: checked ? "var(--gold)" : "var(--hair-2)",
        position: "relative", flexShrink: 0, transition: "background .2s",
        opacity: disabled ? .45 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3, width: 20, height: 20,
        borderRadius: "50%", background: "#fff", transition: "left .2s",
        boxShadow: "0 1px 4px rgba(0,0,0,.35)",
      }} />
    </button>
  )
}

function CfgRow({ label, sub, children }) {
  return (
    <div className="cfg-setting-row">
      <div>
        <div className="cfg-setting-label">{label}</div>
        {sub && <div className="cfg-setting-sub">{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function ConfigPanel({ barber, barbers, admin, canManageTeam, barberDraft, setBarberDraft, saveBarber, updateBarberLocal, onLogout, nav }) {
  const [section, setSection] = useState("cuenta")
  const [pin, setPin] = useState("")
  const [pinStep, setPinStep] = useState("idle") // idle | current | new | confirm
  const [pinError, setPinError] = useState("")
  const [notifSettings, setNotifSettings] = useState({ reserva: true, cancelacion: true, recordatorio: true, marketing: false })
  const [waSettings, setWaSettings] = useState({ activo: true, recordatorio24h: true, recordatorio2h: false, confirmacion: true })
  const [navSettings, setNavSettings] = useState({ agenda: true, reservas: true, finanzas: true, clientes: true, servicios: true, gastos: false, marketing: true })
  const [dockShortcuts, setDockShortcuts] = useState(nav.slice(0, 4).map(n => n[0]))
  const { theme, toggle } = useTheme()

  const handlePinKey = (digit) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => { setPin(""); setPinStep((s) => s === "current" ? "new" : s === "new" ? "confirm" : "idle") }, 400)
    }
  }
  const handlePinBack = () => setPin((p) => p.slice(0, -1))

  const current = CFG_SECTIONS.find((s) => s.id === section)

  return (
    <div className="animate-in cfg-shell">
      {/* Left nav */}
      <aside className="cfg-nav">
        <p className="cfg-nav-head">Configuraciones</p>
        {CFG_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`cfg-nav-item ${section === s.id ? "is-active" : ""}`}
            onClick={() => setSection(s.id)}
          >
            <Icon name={s.icon} size={16} />
            <span>{s.label}</span>
          </button>
        ))}
      </aside>

      {/* Right content */}
      <div className="cfg-content">
        <h2 className="cfg-content-title">{current?.label}</h2>

        {/* CUENTA Y SEGURIDAD */}
        {section === "cuenta" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Datos personales</p>
              <div className="cfg-form-grid">
                <div className="cfg-field">
                  <label>Nombre</label>
                  <input className="input" defaultValue={barber?.name || ""} placeholder="Nombre completo" />
                </div>
                <div className="cfg-field">
                  <label>Usuario</label>
                  <input className="input" defaultValue={barber?.code || ""} placeholder="usuario" />
                </div>
                <div className="cfg-field">
                  <label>Rol</label>
                  <input className="input" defaultValue={barber?.role || "Barbero"} disabled />
                </div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: ".5rem" }}><Icon name="check" size={14} /> Guardar cambios</button>
            </div>

            <div className="cfg-card">
              <p className="cfg-card-head">Cambiar PIN de acceso</p>
              {pinStep === "idle" && (
                <button className="btn btn-dark" onClick={() => { setPin(""); setPinStep("current") }}>
                  <Icon name="key" size={14} /> Cambiar PIN
                </button>
              )}
              {pinStep !== "idle" && (
                <div style={{ display: "grid", gap: ".5rem" }}>
                  <p style={{ fontSize: ".84rem", color: "var(--muted)", margin: 0 }}>
                    {pinStep === "current" ? "Ingresa tu PIN actual" : pinStep === "new" ? "Ingresa el nuevo PIN" : "Confirma el nuevo PIN"}
                  </p>
                  <PinDots value={pin} />
                  {pinError && <p style={{ fontSize: ".78rem", color: "#d99a8f", margin: 0 }}>{pinError}</p>}
                  <div className="pin-pad">
                    {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
                      d === "" ? <span key={i} /> :
                      d === "⌫" ? <button key={i} type="button" className="pin-key" onClick={handlePinBack}>{d}</button> :
                      <button key={i} type="button" className="pin-key" onClick={() => handlePinKey(String(d))}>{d}</button>
                    ))}
                  </div>
                  <button className="btn btn-dark btn-sm" onClick={() => { setPinStep("idle"); setPin(""); setPinError("") }}>Cancelar</button>
                </div>
              )}
            </div>

            <div className="cfg-card">
              <p className="cfg-card-head">Sesion</p>
              <CfgRow label="Cerrar sesion" sub="Seras redirigido al ingreso">
                <button className="btn btn-dark btn-sm" onClick={onLogout}><Icon name="logout" size={14} /> Salir</button>
              </CfgRow>
            </div>
          </div>
        )}

        {/* APARIENCIA */}
        {section === "apariencia" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Tema de la interfaz</p>
              <CfgRow label="Modo oscuro" sub="El modo claro solo esta disponible en el panel interno">
                <ConfigSwitch checked={theme === "dark"} onChange={() => toggle()} />
              </CfgRow>
              <div className="cfg-theme-preview">
                <div className={`cfg-theme-tile ${theme === "dark" ? "is-active" : ""}`} onClick={() => theme !== "dark" && toggle()}>
                  <div className="cfg-theme-thumb dark" />
                  <span>Oscuro</span>
                </div>
                <div className={`cfg-theme-tile ${theme === "light" ? "is-active" : ""}`} onClick={() => theme !== "light" && toggle()}>
                  <div className="cfg-theme-thumb light" />
                  <span>Claro</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCESOS DIRECTOS */}
        {section === "accesos" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Footer bar — 4 accesos rapidos</p>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", margin: "0 0 1rem" }}>Elige los 4 modulos que aparecen en el dock móvil (el centro siempre abre el menú completo).</p>
              <div style={{ display: "grid", gap: ".6rem" }}>
                {nav.filter((n) => !n[0].includes("config")).map(([id, ic, label]) => (
                  <label key={id} style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".6rem .8rem", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", transition: "background .15s" }}>
                    <input
                      type="checkbox"
                      checked={dockShortcuts.includes(id)}
                      onChange={(e) => {
                        if (e.target.checked && dockShortcuts.length < 4) {
                          setDockShortcuts([...dockShortcuts, id])
                        } else if (!e.target.checked) {
                          setDockShortcuts(dockShortcuts.filter((s) => s !== id))
                        }
                      }}
                      style={{ accentColor: "var(--gold)", width: 18, height: 18 }}
                    />
                    <Icon name={ic} size={16} style={{ color: dockShortcuts.includes(id) ? "var(--gold)" : "var(--muted)" }} />
                    <span style={{ fontSize: ".88rem", flex: 1 }}>{label}</span>
                    {dockShortcuts.includes(id) && <span className="chip chip-gold" style={{ fontSize: ".66rem" }}>✓</span>}
                  </label>
                ))}
              </div>
              {dockShortcuts.length === 4 && <p style={{ fontSize: ".76rem", color: "var(--muted-2)", margin: "1rem 0 0" }}>✓ 4 accesos seleccionados</p>}
            </div>
          </div>
        )}

        {/* NAVEGACION */}
        {section === "navegacion" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Modulos visibles</p>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", margin: "0 0 1rem" }}>Activa o desactiva los modulos que aparecen en la barra lateral y el dock movil.</p>
              {[
                ["agenda",    "calendar", "Agenda",    true],
                ["reservas",  "scissors", "Reservas",  true],
                ["finanzas",  "wallet",   "Finanzas",  admin],
                ["clientes",  "user",     "Clientes",  true],
                ["servicios", "cut",      "Servicios", admin],
                ["gastos",    "wallet",   "Gastos",    admin],
                ["marketing", "spark",    "Marketing", true],
              ].map(([id, ic, label, allowed]) => (
                <CfgRow key={id} label={label}>
                  <ConfigSwitch
                    checked={navSettings[id] !== false}
                    disabled={!allowed}
                    onChange={(v) => setNavSettings((s) => ({ ...s, [id]: v }))}
                  />
                </CfgRow>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICACIONES */}
        {section === "notificaciones" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Alertas internas</p>
              <CfgRow label="Nueva reserva" sub="Notificacion cuando un cliente agenda">
                <ConfigSwitch checked={notifSettings.reserva} onChange={(v) => setNotifSettings((s) => ({ ...s, reserva: v }))} />
              </CfgRow>
              <CfgRow label="Cancelacion" sub="Cuando un cliente cancela su cita">
                <ConfigSwitch checked={notifSettings.cancelacion} onChange={(v) => setNotifSettings((s) => ({ ...s, cancelacion: v }))} />
              </CfgRow>
              <CfgRow label="Recordatorio de cita" sub="30 minutos antes de cada servicio">
                <ConfigSwitch checked={notifSettings.recordatorio} onChange={(v) => setNotifSettings((s) => ({ ...s, recordatorio: v }))} />
              </CfgRow>
              <CfgRow label="Novedades y marketing" sub="Actualizaciones del sistema">
                <ConfigSwitch checked={notifSettings.marketing} onChange={(v) => setNotifSettings((s) => ({ ...s, marketing: v }))} />
              </CfgRow>
            </div>
          </div>
        )}

        {/* WHATSAPP */}
        {section === "whatsapp" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Mensajeria automatica</p>
              <CfgRow label="WhatsApp activo" sub="Envio automatico de mensajes a clientes">
                <ConfigSwitch checked={waSettings.activo} onChange={(v) => setWaSettings((s) => ({ ...s, activo: v }))} />
              </CfgRow>
              <CfgRow label="Recordatorio 24h" sub="Mensaje el dia previo a la cita">
                <ConfigSwitch checked={waSettings.recordatorio24h} disabled={!waSettings.activo} onChange={(v) => setWaSettings((s) => ({ ...s, recordatorio24h: v }))} />
              </CfgRow>
              <CfgRow label="Recordatorio 2h" sub="Mensaje dos horas antes">
                <ConfigSwitch checked={waSettings.recordatorio2h} disabled={!waSettings.activo} onChange={(v) => setWaSettings((s) => ({ ...s, recordatorio2h: v }))} />
              </CfgRow>
              <CfgRow label="Confirmacion de reserva" sub="Mensaje inmediato al agendar">
                <ConfigSwitch checked={waSettings.confirmacion} disabled={!waSettings.activo} onChange={(v) => setWaSettings((s) => ({ ...s, confirmacion: v }))} />
              </CfgRow>
            </div>
            <div className="cfg-card">
              <p className="cfg-card-head">Numero de negocio</p>
              <div className="cfg-form-grid">
                <div className="cfg-field">
                  <label>Telefono WhatsApp Business</label>
                  <input className="input" placeholder="+56 9 xxxx xxxx" defaultValue="+56 9 1234 5678" />
                </div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: ".5rem" }}><Icon name="check" size={14} /> Guardar</button>
            </div>
          </div>
        )}

        {/* NEGOCIO */}
        {section === "negocio" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Datos del negocio</p>
              <div className="cfg-form-grid">
                <div className="cfg-field"><label>Nombre</label><input className="input" defaultValue="PIMP STUDIO" /></div>
                <div className="cfg-field"><label>Direccion</label><input className="input" defaultValue="Maipú, Santiago" /></div>
                <div className="cfg-field"><label>Telefono</label><input className="input" defaultValue="+56 9 1234 5678" /></div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: ".5rem" }}><Icon name="check" size={14} /> Guardar</button>
            </div>
            <div className="cfg-card">
              <p className="cfg-card-head">Horario operativo</p>
              <div className="ops-settings-grid">
                <label><span>Apertura</span><select className="input" defaultValue="09:00"><option>09:00</option><option>10:00</option></select></label>
                <label><span>Cierre</span><select className="input" defaultValue="20:00"><option>19:00</option><option>20:00</option><option>21:00</option></select></label>
                <label><span>Anticipacion minima</span><select className="input" defaultValue="120"><option value="60">1 hora</option><option value="120">2 horas</option><option value="240">4 horas</option></select></label>
                <label><span>Ventana de reservas</span><select className="input" defaultValue="30"><option value="14">14 dias</option><option value="30">30 dias</option></select></label>
                <label><span>Domingos</span><select className="input" defaultValue="closed"><option value="closed">Cerrado</option><option value="open">Abierto</option></select></label>
                <label><span>Cancelacion cliente</span><select className="input" defaultValue="24h"><option value="manual">Solo manual</option><option value="24h">Hasta 24h</option><option value="12h">Hasta 12h</option></select></label>
              </div>
            </div>
          </div>
        )}

        {/* EQUIPO */}
        {section === "equipo" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            {canManageTeam && (
              <div className="cfg-card">
                <p className="cfg-card-head">Crear cuenta de barbero</p>
                <div className="cfg-form-grid">
                  <div className="cfg-field"><label>Nombre</label><input className="input" placeholder="Nombre completo" value={barberDraft.name} onChange={(e) => setBarberDraft({ ...barberDraft, name: e.target.value })} /></div>
                  <div className="cfg-field"><label>Usuario</label><input className="input" placeholder="usuario" value={barberDraft.code} onChange={(e) => setBarberDraft({ ...barberDraft, code: e.target.value.toLowerCase().replace(/\s+/g, "-") })} /></div>
                  <div className="cfg-field"><label>Rol</label><input className="input" placeholder="Barbero" value={barberDraft.role} onChange={(e) => setBarberDraft({ ...barberDraft, role: e.target.value })} /></div>
                  <div className="cfg-field"><label>Nivel</label>
                    <select className="input" value={barberDraft.tier} onChange={(e) => setBarberDraft({ ...barberDraft, tier: e.target.value })}>
                      <option value="general">General</option><option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="cfg-field"><label>PIN inicial</label><input className="input" placeholder="1234" inputMode="numeric" maxLength={4} value={barberDraft.pin} onChange={(e) => setBarberDraft({ ...barberDraft, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></div>
                </div>
                <button className="btn btn-gold" style={{ marginTop: ".5rem" }} onClick={() => saveBarber(barberDraft)}><Icon name="check" size={14} /> Crear cuenta</button>
              </div>
            )}
            <div className="cfg-card">
              <p className="cfg-card-head">Usuarios y permisos</p>
              <div style={{ display: "grid", gap: ".85rem" }}>
                {barbers.map((item) => {
                  const lockedAdmin = item.name?.toLowerCase().includes("brunetti") || item.admin
                  return (
                    <div key={item.id} className={`cfg-barber-row ${item.active === false ? "is-disabled" : ""}`}>
                      <div className="cfg-barber-head">
                        <div className="cfg-barber-avatar">{(item.name || "B")[0].toUpperCase()}</div>
                        <div>
                          <strong style={{ fontSize: ".9rem" }}>{item.name}</strong>
                          <span style={{ fontSize: ".74rem", color: "var(--muted)", display: "block" }}>{item.role || "Barbero"} · @{item.code}</span>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
                          <button className={item.active === false ? "chip" : "chip chip-gold"} disabled={!canManageTeam || lockedAdmin} onClick={() => {
                            const next = { ...item, active: item.active === false }
                            updateBarberLocal(item.id, { active: next.active })
                            saveBarber(next)
                          }}>{item.active === false ? "Inactivo" : "Activo"}</button>
                          <button className="btn btn-dark btn-sm" disabled={!canManageTeam || lockedAdmin} onClick={() => saveBarber(item)}>Guardar</button>
                        </div>
                      </div>
                      <div className="cfg-perm-grid">
                        {[["canViewFinance","Finanzas"],["canEditServices","Servicios"],["canManageTeam","Equipo"],["canManageBlocks","Bloques"]].map(([key, lbl]) => (
                          <label key={key} className="cfg-perm-chip">
                            <input type="checkbox" disabled={!canManageTeam || lockedAdmin}
                              checked={lockedAdmin || (key === "canManageBlocks" ? item[key] !== false : Boolean(item[key]))}
                              onChange={(e) => updateBarberLocal(item.id, { [key]: e.target.checked })}
                            />
                            <span>{lbl}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* DATOS Y RESPALDOS */}
        {section === "datos" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Exportar datos</p>
              <div style={{ display: "grid", gap: ".7rem" }}>
                {[["Clientes","CSV con historial y contactos","user"],["Reservas","Historial completo de citas","calendar"],["Gastos","Registro de egresos por categoria","wallet"],["Servicios","Catalogo actual publicado","scissors"]].map(([label, sub, icon]) => (
                  <div key={label} className="cfg-setting-row">
                    <div>
                      <div className="cfg-setting-label">{label}</div>
                      <div className="cfg-setting-sub">{sub}</div>
                    </div>
                    <button className="btn btn-dark btn-sm"><Icon name={icon} size={13} /> Exportar CSV</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="cfg-card">
              <p className="cfg-card-head">Base de datos</p>
              <div className="settings-grid">
                <div><strong>Neon PostgreSQL</strong><span>Backup automatico diario. Revisar snapshot antes de cambios masivos.</span></div>
                <div><strong>Auditoria</strong><span>Cambios de agenda y servicios quedan trazables en el log del servidor.</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ACERCA DE */}
        {section === "acerca" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
              <span className="pimp-mark" style={{ width: 72, height: 72, margin: "0 auto 1rem", display: "block" }} />
              <h3 className="font-display" style={{ margin: "0 0 .3rem", fontSize: "1.4rem" }}>PIMP STUDIO</h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: ".84rem" }}>Panel interno v2.0</p>
              <p style={{ margin: ".5rem 0 0", color: "var(--muted-2)", fontSize: ".78rem" }}>Barberia Premium · Maipu, Santiago</p>
            </div>
            <div className="cfg-card">
              <div className="settings-grid">
                <div><strong>Version</strong><span>2.0.0 — React + Vite + Vercel</span></div>
                <div><strong>Ambiente</strong><span>Produccion — rama desarrollo</span></div>
                <div><strong>Soporte</strong><span>Panel gestionado internamente.</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   Shell + Topbar — UI envoltura responsive
   ============================================================ */
function DashboardShell({ tab, setTab, nav, barber, onLogout, children }) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brandmark size={40} sub="Panel interno" />
        <nav className="dashboard-nav">
          {nav.map(([id, ic, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`dashboard-nav-item ${tab === id ? 'is-active' : ''}`}
            >
              <Icon name={ic} size={17} /> {label}
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <button onClick={onLogout} className="dashboard-logout">
            <Icon name="logout" size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>
      {children}
      <MobileDock tab={tab} setTab={setTab} nav={nav} />
    </div>
  )
}

function DashboardTopbar({ title, barber, onLogout, tab, setTab, nav }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const initial = (barber?.name || 'B')[0].toUpperCase()
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-left">
        <button
          type="button"
          className="burger-btn"
          aria-label="Cambiar módulo"
          onClick={() => {
            const cur = nav.findIndex((n) => n[0] === tab)
            const next = nav[(cur + 1) % nav.length]
            if (next) setTab(next[0])
          }}
        >
          <Icon name="menu" size={18} />
        </button>
        <span className="pimp-mark" aria-hidden="true" />
        <div className="dashboard-topbar-title">
          <strong>{title}</strong>
          <small>PIMP STUDIO</small>
        </div>
      </div>
      <div className="dashboard-topbar-actions">
        <ThemeToggle />
        <span className="notif-pill" title="Notificaciones">
          <Icon name="bell" size={14} /> 3
        </span>
        <div className="user-chip" ref={ref}>
          <button
            type="button"
            className="user-chip-btn"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            title={barber?.name || 'Cuenta'}
          >
            {initial}
          </button>
          {open && (
            <div className="user-chip-pop" role="menu">
              <div className="user-pop-name">
                <strong>{barber?.name || 'Cuenta'}</strong>
                <span>{barber?.role || 'Barbero'}</span>
              </div>
              <button className="user-pop-item" type="button" onClick={onLogout}>
                <Icon name="logout" size={15} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
