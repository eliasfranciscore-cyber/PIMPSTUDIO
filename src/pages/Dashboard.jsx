import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, Stat } from '../components/ui.jsx'
import { BARBERS, CLIENTS, EXPENSES, METRICS, SERVICES, TODAY_BOOKINGS, barberById, CLP, CLPk, isAdminUser } from '../data.js'

const AGENDA_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","14:00","15:00","16:00","17:00","18:00","18:30","19:00","19:30"]
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
    <div className="card" style={{ padding: "1.3rem", ...style }}>
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
  const [clients, setClients] = useState(CLIENTS)
  const [services, setServices] = useState(SERVICES.map((item) => ({ ...item, active: true })))
  const [expenses, setExpenses] = useState(EXPENSES)
  const [serviceDraft, setServiceDraft] = useState({ name: "", price: "", min: 60, cat: "general", desc: "", tne: false })
  const [expenseDraft, setExpenseDraft] = useState({ date: new Date().toISOString().slice(0, 10), category: "Insumos", detail: "", amount: "" })
  const m = METRICS
  const maxRev = Math.max(...m.barberRanking.map((r) => r.rev))

  useEffect(() => {
    const stored = localStorage.getItem("ps_barber")
    if (!stored) { navigate("/ingreso"); return }
    const parsed = JSON.parse(stored)
    setBarber(parsed)
    const headers = authHeaders()
    fetch("/api/clients", { headers }).then((r) => r.json()).then((data) => { if (data.clients?.length) setClients(data.clients) }).catch(() => {})
    fetch("/api/barbers?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.barbers?.length) setBarbers(data.barbers) }).catch(() => {})
    fetch("/api/services?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.services?.length) setServices(data.services) }).catch(() => {})
    fetch("/api/expenses", { headers }).then((r) => r.json()).then((data) => { if (data.expenses?.length) setExpenses(data.expenses) }).catch(() => {})
  }, [])

  const logout = () => { localStorage.removeItem("ps_barber"); localStorage.removeItem("ps_barber_token"); navigate("/") }
  const admin = isAdminUser(barber)
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
    ...(admin ? [["finanzas", "wallet", "Finanzas"]] : []),
    ["clientes",  "user",     "Clientes"],
    ["servicios", "cut",      "Servicios"],
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
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "210px 1fr" }}>
      {/* SIDEBAR */}
      <aside style={{ borderRight: "1px solid var(--hair)", padding: "1.3rem 1rem", display: "flex", flexDirection: "column", gap: "1.4rem", background: "rgba(0,0,0,0.25)", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <Brandmark size={36} sub="Panel interno" />
        <nav style={{ display: "grid", gap: ".25rem" }}>
          {nav.map(([id, ic, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: ".7rem", padding: ".7rem .8rem", borderRadius: 10, border: 0, textAlign: "left",
              background: tab === id ? "rgba(201,161,78,0.1)" : "transparent",
              color: tab === id ? "var(--gold-lt)" : "var(--muted)", fontSize: ".88rem", transition: "all .2s",
              boxShadow: tab === id ? "inset 2px 0 0 var(--gold)" : "none", cursor: "pointer",
            }}><Icon name={ic} size={17} /> {label}</button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: ".5rem" }}>
          <div className="card" style={{ padding: ".8rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", fontSize: ".9rem", fontWeight: 700, color: "#1a1407", flexShrink: 0 }}>
              {(barber.name || "B")[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 600 }}>{barber.name}</div>
              <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>{barber.role || "Barbero"}</div>
            </div>
          </div>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".6rem .8rem", borderRadius: 10, border: "1px solid var(--hair)", background: "transparent", color: "var(--muted)", fontSize: ".82rem", cursor: "pointer" }}><Icon name="logout" size={15} /> Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ padding: "1.5rem", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap", gap: ".8rem" }}>
          <div>
            <h1 className="font-display" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, textTransform: "capitalize" }}>{nav.find(n => n[0] === tab)?.[2]}</h1>
            <p style={{ margin: ".2rem 0 0", color: "var(--muted)", fontSize: ".85rem" }}>Panel interno · PIMP STUDIO</p>
          </div>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <span className="chip"><Icon name="bell" size={14} /> 3</span>
            <button className="btn btn-gold btn-sm"><Icon name="spark" size={14} /> Exportar</button>
          </div>
        </div>

        {/* RESUMEN */}
        {tab === "resumen" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem" }}>
              <Stat icon="wallet"   label="Ingresos semana"  value={CLP(m.revenueWeek)}  delta={m.revenueWeekDelta}  accent />
              <Stat icon="calendar" label="Reservas"         value={m.bookingsWeek}       delta={m.bookingsWeekDelta} />
              <Stat icon="chart"    label="Ticket promedio"  value={CLP(m.avgTicket)}     delta={m.avgTicketDelta} />
              <Stat icon="trend"    label="Ocupación"        value={m.occupancy}          suffix="%" delta={m.occupancyDelta} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.1rem" }}>
              <Panel title="Ingresos por día" action={<span className="chip chip-gold">{CLP(m.revenueWeek)}</span>}>
                <BarChart data={m.revenueByDay} fmt={CLP} />
              </Panel>
              <Panel title="Ranking barberos" action={<span style={{ fontSize: ".74rem", color: "var(--muted)" }}>Esta semana</span>}>
                <div style={{ display: "grid", gap: ".7rem" }}>
                  {m.barberRanking.slice(0, 5).map((r, i) => {
                    const b = barberById(r.id)
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
                <div style={{ display: "flex", gap: ".45rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button className="chip" onClick={() => setWeekOffset(weekOffset - 1)}><Icon name="arrowLeft" size={13} /> Semana</button>
                  <span className="chip chip-gold">{weekDays[0]?.key} al {weekDays[5]?.key}</span>
                  <button className="chip" onClick={() => setWeekOffset(weekOffset + 1)}>Semana <Icon name="arrowRight" size={13} /></button>
                </div>
              }
            >
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
            <Panel title="Reservas de hoy" action={<span className="chip">{TODAY_BOOKINGS.length} citas</span>}>
              <div style={{ display: "grid", gap: ".4rem", overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.6fr 1fr 90px 110px", gap: ".5rem", padding: "0 .6rem .5rem", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted-2)", minWidth: 600 }}>
                  <span>Hora</span><span>Cliente</span><span>Servicio</span><span>Barbero</span><span>Total</span><span>Estado</span>
                </div>
                {TODAY_BOOKINGS.map((bk, i) => {
                  const b = barberById(bk.barberId)
                  const stc = { "confirmada": ["rgba(201,161,78,0.1)", "var(--gold-lt)"], "en curso": ["rgba(120,180,140,0.12)", "#9fd0a0"], "pendiente": ["rgba(255,255,255,0.05)", "var(--muted)"] }[bk.status] || ["transparent", "var(--muted)"]
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.6fr 1fr 90px 110px", gap: ".5rem", alignItems: "center", padding: ".7rem .6rem", borderRadius: 9, background: "rgba(255,255,255,0.02)", border: "1px solid var(--hair)", fontSize: ".84rem", minWidth: 600 }}>
                      <span className="font-display gold-text" style={{ fontWeight: 600 }}>{bk.time}</span>
                      <span style={{ fontWeight: 500 }}>{bk.client}</span>
                      <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bk.service}</span>
                      <span style={{ color: "var(--ink-soft)" }}>{b?.short}</span>
                      <span style={{ color: "var(--ink-soft)" }}>{CLP(bk.price)}</span>
                      <span style={{ fontSize: ".72rem", padding: ".3rem .6rem", borderRadius: 99, background: stc[0], color: stc[1], textAlign: "center", textTransform: "capitalize" }}>{bk.status}</span>
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
              <Stat icon="wallet"   label="Ingresos mes"    value={CLP(16840000)} delta={9.6} accent />
              <Stat icon="chart"    label="Ticket promedio" value={CLP(m.avgTicket)} delta={3.2} />
              <Stat icon="scissors" label="Servicios mes"   value="734" delta={6.4} />
              <Stat icon="trend"    label="Proyección"      value={CLP(17900000)} delta={6.3} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.1rem" }}>
              <Panel title="Ingresos por día"><BarChart data={m.revenueByDay} fmt={CLP} /></Panel>
              <Panel title="Ingresos por servicio">
                <div style={{ display: "grid", gap: ".75rem" }}>
                  {[["Corte de cabello", 38], ["Corte + barba", 26], ["Químicos / color", 18], ["Brunetti premium", 12], ["Perfilado barba", 6]].map(([n, p]) => (
                    <div key={n} style={{ display: "grid", gap: ".3rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}><span style={{ color: "var(--ink-soft)" }}>{n}</span><span className="gold-text" style={{ fontWeight: 600 }}>{p}%</span></div>
                      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: "var(--gold-grad)", borderRadius: 99 }} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <Panel title="Ingresos por barbero">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: ".8rem" }}>
                {m.barberRanking.map((r) => {
                  const b = barberById(r.id)
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
            <Panel title="Panel de clientes" action={<span className="chip chip-gold">Telefono como ID</span>}>
              <div style={{ display: "grid", gap: ".55rem" }}>
                {clients.map((client) => (
                  <div key={client.id || client.phone} className="admin-row">
                    <div>
                      <strong>{client.name}</strong>
                      <span>+56 {client.phone} · {client.email || "sin correo"}</span>
                    </div>
                    <div><strong>{client.visits || 0}</strong><span>visitas</span></div>
                    <div><strong>{CLP(client.totalSpent || 0)}</strong><span>{client.lastVisit || "sin visitas"}</span></div>
                    <span className="chip">{client.status || "activo"}</span>
                  </div>
                ))}
              </div>
            </Panel>
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
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <Panel title="Seguridad y permisos" action={<span className="chip chip-gold">{admin ? "Admin" : "Barbero"}</span>}>
              <div style={{ display: "grid", gap: ".7rem" }}>
                {BARBERS.map((item) => {
                  const isBrunetti = item.name.toLowerCase().includes("brunetti")
                  return (
                    <div key={item.id} className="admin-row">
                      <div><strong>{item.name}</strong><span>{item.role}</span></div>
                      <span className={isBrunetti ? "chip chip-gold" : "chip"}>{isBrunetti ? "Admin completo" : "Finanzas ocultas"}</span>
                      <span className="chip">Agenda activa</span>
                      <span className="chip">Bloques horarios</span>
                    </div>
                  )
                })}
              </div>
            </Panel>
            <Panel title="Base operacional">
              <div className="settings-grid">
                <div><strong>Cliente</strong><span>Telefono de 9 digitos como identificador unico.</span></div>
                <div><strong>Servicios</strong><span>La web publica consume `/api/services`.</span></div>
                <div><strong>Agenda</strong><span>Reservas bloquean barbero, fecha y hora.</span></div>
                <div><strong>Neon</strong><span>Ejecutar `db/schema.sql` y `db/seed.sql` en la base.</span></div>
              </div>
            </Panel>
          </div>
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
    </div>
  )
}
