import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, Stat } from '../components/ui.jsx'
import { ThemeProvider, ThemeToggle, useTheme } from '../components/theme.jsx'
import MobileDock from '../components/MobileDock.jsx'
import { BARBERS, CLIENTS, EXPENSES, METRICS, SERVICES, TODAY_BOOKINGS, barberById, CLP, CLPk, isAdminUser } from '../data.js'
import { mergeBookings, readLocalBookings } from '../bookingsStore.js'
import BookingsInbox from '../components/BookingsInbox.jsx'
import DashboardResumen from '../components/DashboardResumen.jsx'
import ClientModal from '../components/ClientModal.jsx'
import BarberModal from '../components/BarberModal.jsx'
import {
  registerServiceWorker, notifyBarberOfBooking, pushEnabledFor,
  enablePush, disablePush, notifyLocal, permissionState,
  pushAvailableHere, pushSupported, isIOS, isStandalone,
} from '../push.js'

const AGENDA_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"]
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 min sin actividad → cerrar sesión
const DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

function getSvcIcon(svc) {
  const n = ((svc.name || '') + ' ' + (svc.cat || '')).toLowerCase()
  if (n.includes('asesor') || n.includes('visag') || n.includes('imagen')) return 'user'
  if (n.includes('barba') || n.includes('beard')) return 'cut'
  if (n.includes('quim') || n.includes('color') || n.includes('platin')) return 'spark'
  if (n.includes('fade') || n.includes('degra')) return 'trend'
  return 'scissors'
}

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
  const [tab, setTab] = useState("agenda")
  const [agendaBarber, setAgendaBarber] = useState(null)
  const [agendaDayKey, setAgendaDayKey] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [availability, setAvailability] = useState({})
  const [agendaBusy, setAgendaBusy] = useState("")
  const [barber, setBarber] = useState(null)
  const [barbers, setBarbers] = useState(BARBERS.map((item) => ({ ...item, active: true })))
  const [bookings, setBookings] = useState(mergeBookings(TODAY_BOOKINGS.map((item, index) => ({ ...item, id: index + 1, date: isoDate(new Date()) }))))
  const [clients, setClients] = useState(CLIENTS)
  const [clientQuery, setClientQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientHistory, setClientHistory] = useState([])
  const [clientEditing, setClientEditing] = useState(false)
  const [services, setServices] = useState(SERVICES.map((item) => ({ ...item, active: true })))
  const [expenses, setExpenses] = useState(EXPENSES)
  const [serviceDraft, setServiceDraft] = useState({ name: "", price: "", min: 60, cat: "general", desc: "", tne: false })
  const [expenseDraft, setExpenseDraft] = useState({ date: new Date().toISOString().slice(0, 10), category: "Insumos", detail: "", amount: "" })
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [serviceOpen, setServiceOpen] = useState(false)
  const [editSvcId, setEditSvcId] = useState(null)
  const [barberDraft, setBarberDraft] = useState({ name: "", code: "", role: "Barbero", tier: "general", pin: "1234", canViewFinance: false, canManageTeam: false, canEditServices: false, canManageBlocks: true })
  // Preferencias de navegación (persisten por dispositivo): qué módulos se ven y
  // qué 4 atajos van en el dock. Se aplican al nav/dock reales.
  const [navSettings, setNavSettings] = useState(() => { try { return JSON.parse(localStorage.getItem("ps_nav_settings") || "{}") } catch { return {} } })
  const [dockShortcuts, setDockShortcuts] = useState(() => { try { const s = JSON.parse(localStorage.getItem("ps_dock_shortcuts") || "null"); return Array.isArray(s) && s.length ? s : ["resumen", "agenda", "reservas", "clientes"] } catch { return ["resumen", "agenda", "reservas", "clientes"] } })
  useEffect(() => { try { localStorage.setItem("ps_nav_settings", JSON.stringify(navSettings)) } catch {} }, [navSettings])
  useEffect(() => { try { localStorage.setItem("ps_dock_shortcuts", JSON.stringify(dockShortcuts)) } catch {} }, [dockShortcuts])
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

  // Modo panel: bloquea el scroll del body para que el scroll viva dentro de
  // .dashboard-main. Así el topbar (sticky) y el dock (fixed) no rebotan con el
  // momentum scroll de iOS/PWA. Sólo afecta a /panel (no a la web pública).
  useEffect(() => {
    document.body.classList.add('dash-mode')
    return () => document.body.classList.remove('dash-mode')
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("ps_barber")
    if (!stored) { navigate("/ingreso"); return }
    const parsed = JSON.parse(stored)
    setBarber(parsed)
    setAgendaBarber(parsed.id || 6)
    setAgendaDayKey(isoDate(new Date()))
    const headers = authHeaders()
    fetch("/api/clients", { headers }).then((r) => r.json()).then((data) => { if (data.clients?.length) setClients(data.clients) }).catch(() => {})
    // App interna en modo "solo Brunetti": no cargamos otros barberos desde la API.
    // (El fetch a /api/barbers queda guardado para cuando se reactive el multi-barbero.)
    // fetch("/api/barbers?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.barbers?.length) setBarbers(data.barbers) }).catch(() => {})
    fetch("/api/bookings", { headers }).then((r) => r.json()).then((data) => { setBookings(mergeBookings(data.bookings?.length ? data.bookings : TODAY_BOOKINGS.map((item, index) => ({ ...item, id: index + 1, date: isoDate(new Date()) })))) }).catch(() => {})
    fetch("/api/services?includeInactive=true", { headers }).then((r) => r.json()).then((data) => { if (data.services?.length) setServices(data.services) }).catch(() => {})
    fetch("/api/expenses", { headers }).then((r) => r.json()).then((data) => { if (data.expenses?.length) setExpenses(data.expenses) }).catch(() => {})
  }, [])

  const logout = (reason = "") => {
    localStorage.removeItem("ps_barber")
    localStorage.removeItem("ps_barber_token")
    localStorage.removeItem("ps_last_act")
    navigate("/ingreso", reason ? { state: { msg: reason } } : undefined)
  }

  // Timeout de sesión por inactividad: 30 min sin interacción → logout automático
  useEffect(() => {
    const touch = () => localStorage.setItem("ps_last_act", String(Date.now()))
    touch()
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"]
    events.forEach((ev) => window.addEventListener(ev, touch, { passive: true }))
    const iv = setInterval(() => {
      const last = Number(localStorage.getItem("ps_last_act") || 0)
      if (last && Date.now() - last > SESSION_TIMEOUT_MS) logout("Tu sesión expiró por inactividad.")
    }, 60_000)
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, touch))
      clearInterval(iv)
    }
  }, [])
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

  // Service worker + aviso al barbero cuando entra una reserva suya.
  // El localStorage sincroniza entre pestañas del mismo navegador (evento
  // 'storage'); el aviso push entre dispositivos lo emite el backend.
  const seenBookingKeys = useRef(null)
  useEffect(() => {
    if (!barber) return
    registerServiceWorker()
    const keyOf = (b) => `${Number(b.barberId)}|${b.date}|${b.time}`
    if (!seenBookingKeys.current) seenBookingKeys.current = new Set(readLocalBookings().map(keyOf))
    const onStorage = (e) => {
      if (e.key && e.key !== "ps_bookings_local") return
      const local = readLocalBookings()
      setBookings((current) => mergeBookings(current))
      local.forEach((bk) => {
        const k = keyOf(bk)
        if (!seenBookingKeys.current.has(k)) {
          seenBookingKeys.current.add(k)
          if (pushEnabledFor(barber)) notifyBarberOfBooking(barber, bk)
        }
      })
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [barber])

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

  // Acceso por barbero: Bruno (admin) ve todo. El admin concede módulos por barbero
  // (barber.modules) para los módulos "abiertos"; Finanzas/Servicios/Gastos siguen
  // por permiso. Resumen y Config siempre disponibles.
  const ALWAYS = ["resumen", "config"]
  const MODULE_IDS = ["agenda", "reservas", "clientes", "marketing"]
  const barberModules = Array.isArray(barber?.modules) ? barber.modules : null
  const accessibleNav = nav.filter(([id]) => {
    if (admin || !barberModules) return true
    if (MODULE_IDS.includes(id)) return barberModules.includes(id)
    return true
  })
  // Preferencia personal de visibilidad (config → módulos visibles).
  const personalNav = accessibleNav.filter(([id]) => ALWAYS.includes(id) || navSettings[id] !== false)
  // ── Modo "solo Brunetti" ──────────────────────────────────────────────
  // BRUNETTI_ONLY = true oculta la sección "Equipo" en Config (gestión multi-barbero).
  // Todos los demás módulos (Finanzas, Clientes, Servicios, etc.) siguen visibles.
  // Para reactivar Equipo: BRUNETTI_ONLY = false.
  const BRUNETTI_ONLY = true
  const visibleNav = personalNav
  // Atajos del dock: los 4 elegidos, sólo si son accesibles/visibles.
  const dockItems = dockShortcuts.map((id) => visibleNav.find((n) => n[0] === id)).filter(Boolean).slice(0, 4)

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
    setExpenseOpen(false)
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

  const deleteBarber = async (target) => {
    if (!target?.id) return
    setBarbers((items) => items.filter((item) => item.id !== target.id))
    fetch(`/api/barbers?id=${target.id}`, { method: "DELETE", headers: authHeaders() }).catch(() => {})
  }

  const exportCSV = (type) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const toCSV = (headers, rows) => [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n")
    let name = "datos", csv = ""
    if (type === "Clientes") { name = "clientes"; csv = toCSV(["Nombre", "Telefono", "Email", "Visitas", "Total", "Ultima visita", "Estado"], clients.map((c) => [c.name, c.phone, c.email, c.visits, c.totalSpent, c.lastVisit, c.status])) }
    else if (type === "Reservas") { name = "reservas"; csv = toCSV(["Fecha", "Hora", "Cliente", "Telefono", "Servicio", "Barbero", "Precio", "Estado"], bookings.map((b) => { const bb = barberById(b.barberId); return [b.date, b.time, b.client, b.phone, b.service, bb?.short || bb?.name || "", b.price, b.status] })) }
    else if (type === "Gastos") { name = "gastos"; csv = toCSV(["Fecha", "Categoria", "Detalle", "Monto", "Responsable"], expenses.map((e) => [e.date, e.category, e.detail, e.amount, e.owner])) }
    else if (type === "Servicios") { name = "servicios"; csv = toCSV(["Nombre", "Precio", "Minutos", "Categoria", "Estado"], services.map((s) => [s.name, s.price, s.min, s.cat, s.active === false ? "oculto" : "publicado"])) }
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brunetti-${name}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
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

  const openClient = async (client, { edit = false } = {}) => {
    setSelectedClient(client)
    setClientEditing(edit)
    const local = bookings.filter((item) => item.phone === client.phone)
    setClientHistory(local)
    const data = await fetch(`/api/bookings?phone=${client.phone}`)
      .then((r) => r.headers.get("content-type")?.includes("application/json") ? r.json() : Promise.reject(new Error("api unavailable")))
      .catch(() => ({ bookings: local }))
    setClientHistory(data.bookings?.length ? data.bookings : local)
  }

  const clientKey = (c) => c.id ?? c.phone
  const saveClient = async (updated) => {
    setClients((list) => list.map((c) => clientKey(c) === clientKey(updated) ? { ...c, ...updated } : c))
    setSelectedClient((c) => (c && clientKey(c) === clientKey(updated) ? { ...c, ...updated } : c))
    fetch("/api/clients", { method: "POST", headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(updated) }).catch(() => {})
  }
  const deleteClient = async (client) => {
    setClients((list) => list.filter((c) => clientKey(c) !== clientKey(client)))
    setSelectedClient(null)
    setClientEditing(false)
    fetch(`/api/clients?phone=${client.phone}`, { method: "DELETE", headers: authHeaders() }).catch(() => {})
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
      nav={visibleNav}
      dockItems={dockItems}
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
          nav={visibleNav}
          notifCount={visibleBookings.filter((b) => b.status === 'pendiente').length}
        />

        {/* RESUMEN */}
        {tab === "resumen" && (
          <DashboardResumen metrics={m} bookings={bookings} barbers={barbers} expenses={expenses} />
        )}

        {/* AGENDA */}
        {tab === "agenda" && agendaDayKey && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <div className="agenda-controls">
              {/* Selector de barbero retirado: la agenda es exclusiva de Brunetti.
                  (Se conserva agendaBarber fijado a Bruno para la API de disponibilidad.) */}
              <label className="agenda-control">
                <span>Día</span>
                <select className="input" value={agendaDayKey} onChange={(e) => setAgendaDayKey(e.target.value)}>
                  {Array.from({ length: 14 }, (_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() + i)
                    const k = isoDate(d)
                    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : `${DAY_LABELS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
                    return <option key={k} value={k}>{label}</option>
                  })}
                </select>
              </label>
            </div>
            <Panel
              title={`${(barbers.find((item) => item.id === agendaBarber) || barberById(agendaBarber))?.name || "Barbero"}`}
              action={<span className="chip chip-gold">{(availability[agendaDayKey] || []).filter((s) => s.state === "free").length} libres</span>}
            >
              <div className="agenda-legend">
                <span><i className="free" /> Atiende</span>
                <span><i className="blocked" /> Bloqueado</span>
                <span><i className="booked" /> Reservado</span>
              </div>
              {["MAÑANA", "TARDE"].map((label) => {
                const slots = AGENDA_SLOTS.filter((t) => label === "MAÑANA" ? Number(t.slice(0, 2)) < 12 : Number(t.slice(0, 2)) >= 12)
                return (
                  <div key={label} className="agenda-period">
                    <p className="agenda-period-title">{label}</p>
                    <div className="agenda-tile-grid">
                      {slots.map((t) => {
                        const slotInfo = (availability[agendaDayKey] || []).find((item) => item.slot === t)
                        const state = slotInfo?.state || (slotInfo?.available === false ? "blocked" : "free")
                        const busy = agendaBusy === `${agendaDayKey}-${t}`
                        return (
                          <button
                            key={t}
                            className={`agenda-tile ${state}`}
                            disabled={state === "booked" || busy}
                            onClick={() => toggleSlot(agendaDayKey, t, state)}
                            title={state === "booked" ? "Reservado" : state === "blocked" ? "Tocar para atender" : "Tocar para bloquear"}
                          >
                            {busy ? "..." : t}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </Panel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: ".6rem" }}>
              <Stat icon="calendar" label="Reservados" value={(availability[agendaDayKey] || []).filter((item) => item.state === "booked").length} />
              <Stat icon="clock"    label="Disponibles" value={(availability[agendaDayKey] || []).filter((item) => item.state === "free").length} suffix="h" />
              <Stat icon="trend"    label="Bloqueados" value={(availability[agendaDayKey] || []).filter((item) => item.state === "blocked").length} accent />
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {tab === "reservas" && (
          <BookingsInbox
            bookings={visibleBookings}
            barbers={barbers}
            barber={barber}
            admin={admin}
            onStatus={(bk, status) => updateBookingStatus(bk, status)}
            onReschedule={() => setTab("agenda")}
          />
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
            <Panel title="Panel de clientes" action={<span className="chip chip-gold">Telefono como ID</span>}>
              <div className="client-search">
                <Icon name="user" size={15} />
                <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Buscar por nombre, telefono o correo" />
              </div>
              <div className="client-list">
                {filteredClients.map((client) => (
                  <div key={client.id || client.phone} className="client-row" onClick={() => openClient(client)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openClient(client) }}>
                    <div style={{ minWidth: 0 }}>
                      <strong>{client.name}</strong>
                      <span>+56 {client.phone} · {client.email || "sin correo"}</span>
                    </div>
                    <div><strong>{client.visits || 0}</strong><span>visitas</span></div>
                    <div><strong>{CLP(client.totalSpent || 0)}</strong><span>{client.lastVisit || "sin visitas"}</span></div>
                    <button className="btn btn-dark btn-sm client-row-edit" onClick={(e) => { e.stopPropagation(); openClient(client, { edit: true }) }}>
                      <Icon name="user" size={13} /> Editar
                    </button>
                  </div>
                ))}
                {!filteredClients.length && (
                  <div className="empty-state">No hay clientes que coincidan con la busqueda.</div>
                )}
              </div>
            </Panel>
          </div>
        )}

        {tab === "clientes" && selectedClient && (
          <ClientModal
            client={selectedClient}
            history={clientHistory}
            barbers={barbers}
            startEditing={clientEditing}
            onClose={() => setSelectedClient(null)}
            onSave={saveClient}
            onDelete={deleteClient}
            onSchedule={() => navigate("/reservar")}
          />
        )}

        {/* SERVICIOS */}
        {tab === "servicios" && (
          <div className="animate-in" style={{ display: "grid", gap: "1.1rem" }}>
            <button className="btn btn-gold btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }} onClick={() => setServiceOpen(true)}>
              <Icon name="spark" size={16} /> Nuevo servicio
            </button>
            <Panel title="Servicios publicados" action={<span className="chip chip-gold">{services.filter((s) => s.active !== false).length} activos</span>}>
              <div className="svc-grid">
                {services.map((svc) => {
                  const isEditing = editSvcId === svc.id
                  return (
                    <div key={svc.id} className={`svc-card ${isEditing ? "is-open" : ""}`} onClick={() => !isEditing && setEditSvcId(svc.id)}>
                      <div className="svc-card-ic"><Icon name={getSvcIcon(svc)} size={20} /></div>
                      <div className="svc-card-name">{svc.name}</div>
                      <div className="svc-card-price">{CLP(svc.price)}</div>
                      <div className="svc-card-meta"><Icon name="clock" size={11} /> {svc.min} min · {svc.cat}</div>
                      <span className={svc.active === false ? "chip" : "chip chip-gold"} style={{ fontSize: ".68rem" }}>{svc.active === false ? "Oculto" : "Publicado"}</span>
                      {isEditing && (
                        <div className="svc-card-edit" onClick={(e) => e.stopPropagation()}>
                          <input className="input" value={svc.name} onChange={(e) => setServices((items) => items.map((item) => item.id === svc.id ? { ...item, name: e.target.value } : item))} />
                          <input className="input" inputMode="numeric" placeholder="Precio" value={svc.price} onChange={(e) => setServices((items) => items.map((item) => item.id === svc.id ? { ...item, price: e.target.value.replace(/\D/g, "") } : item))} />
                          <input className="input" inputMode="numeric" placeholder="Minutos" value={svc.min} onChange={(e) => setServices((items) => items.map((item) => item.id === svc.id ? { ...item, min: e.target.value.replace(/\D/g, "") } : item))} />
                          <div style={{ display: "flex", gap: ".5rem" }}>
                            <button className={svc.active === false ? "chip" : "chip chip-gold"} onClick={() => saveService({ ...svc, active: svc.active === false })}>{svc.active === false ? "Oculto" : "Activo"}</button>
                            <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => { saveService(svc); setEditSvcId(null) }}><Icon name="check" size={14} /> Guardar</button>
                            <button className="btn btn-dark btn-sm" onClick={() => setEditSvcId(null)}><Icon name="close" size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
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
            <button className="btn btn-gold btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }} onClick={() => setExpenseOpen(true)}>
              <Icon name="wallet" size={16} /> Ingresar gasto
            </button>
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

        {/* MODAL INGRESAR GASTO */}
        {expenseOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setExpenseOpen(false)}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
            <div className="card" style={{ position: "relative", width: "100%", maxWidth: 420, padding: "1.6rem", display: "grid", gap: "1.1rem", zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="font-display" style={{ margin: 0, fontSize: "1.1rem" }}>Ingresar gasto</h3>
                <button style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", padding: ".3rem" }} onClick={() => setExpenseOpen(false)} aria-label="Cerrar">
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="admin-form-grid">
                <input className="input" type="date" value={expenseDraft.date} onChange={(e) => setExpenseDraft({ ...expenseDraft, date: e.target.value })} />
                <select className="input" value={expenseDraft.category} onChange={(e) => setExpenseDraft({ ...expenseDraft, category: e.target.value })}>
                  {["Insumos", "Equipamiento", "Arriendo", "Marketing", "Personal", "Servicios", "Otros"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input className="input" placeholder="Detalle del gasto" value={expenseDraft.detail} onChange={(e) => setExpenseDraft({ ...expenseDraft, detail: e.target.value })} />
                <input className="input" placeholder="Monto" inputMode="numeric" value={expenseDraft.amount} onChange={(e) => setExpenseDraft({ ...expenseDraft, amount: e.target.value.replace(/\D/g, "") })} />
                <button className="btn btn-gold btn-block" onClick={saveExpense}><Icon name="check" size={15} /> Registrar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NUEVO SERVICIO */}
        {serviceOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setServiceOpen(false)}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
            <div className="card" style={{ position: "relative", width: "100%", maxWidth: 420, padding: "1.6rem", display: "grid", gap: "1.1rem", zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="font-display" style={{ margin: 0, fontSize: "1.1rem" }}>Nuevo servicio</h3>
                <button style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", padding: ".3rem" }} onClick={() => setServiceOpen(false)} aria-label="Cerrar">
                  <Icon name="close" size={18} />
                </button>
              </div>
              <span className="chip" style={{ justifySelf: "start" }}>Impacta la web pública</span>
              <div className="admin-form-grid">
                <input className="input" placeholder="Nombre del servicio" value={serviceDraft.name} onChange={(e) => setServiceDraft({ ...serviceDraft, name: e.target.value })} />
                <input className="input" placeholder="Precio (CLP)" inputMode="numeric" value={serviceDraft.price} onChange={(e) => setServiceDraft({ ...serviceDraft, price: e.target.value.replace(/\D/g, "") })} />
                <input className="input" placeholder="Minutos" inputMode="numeric" value={serviceDraft.min} onChange={(e) => setServiceDraft({ ...serviceDraft, min: e.target.value.replace(/\D/g, "") })} />
                <select className="input" value={serviceDraft.cat} onChange={(e) => setServiceDraft({ ...serviceDraft, cat: e.target.value })}>
                  <option value="general">General</option>
                  <option value="premium">Premium</option>
                  <option value="quimico">Quimico</option>
                </select>
                <input className="input" placeholder="Descripción" value={serviceDraft.desc} onChange={(e) => setServiceDraft({ ...serviceDraft, desc: e.target.value })} />
                <button className="btn btn-gold btn-block" onClick={() => { saveService(); setServiceOpen(false) }}><Icon name="check" size={15} /> Crear servicio</button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIG */}
        {tab === "config" && (
          <ConfigPanel
            brunettiOnly={BRUNETTI_ONLY}
            barber={barber}
            barbers={barbers}
            admin={admin}
            canManageTeam={canManageTeam}
            barberDraft={barberDraft}
            setBarberDraft={setBarberDraft}
            saveBarber={saveBarber}
            updateBarberLocal={updateBarberLocal}
            deleteBarber={deleteBarber}
            onExport={exportCSV}
            onLogout={logout}
            nav={nav}
            navSettings={navSettings}
            setNavSettings={setNavSettings}
            dockShortcuts={dockShortcuts}
            setDockShortcuts={setDockShortcuts}
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

/* Notificaciones push para iOS (app instalada en inicio).
   Solo activa avisos para el barbero autenticado (su usuario): recibirá un push
   cuando un cliente agende una hora con él. */
function PushCard({ barber }) {
  const [perm, setPerm] = useState(() => permissionState())
  const [enabled, setEnabled] = useState(() => pushEnabledFor(barber))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const supported = pushSupported()
  const iosNeedsInstall = isIOS() && !isStandalone()

  const toggle = async () => {
    setBusy(true); setMsg("")
    if (enabled) {
      await disablePush(barber)
      setEnabled(false)
      setMsg("Notificaciones desactivadas.")
    } else {
      const r = await enablePush(barber)
      setPerm(r.permission)
      if (r.ok) {
        setEnabled(true)
        setMsg("Listo. Te avisaremos cuando agenden una hora contigo.")
      } else if (r.reason === "ios-needs-install") {
        setMsg("En iPhone: abre el menú Compartir y elige “Agregar a inicio”. Luego abre la app instalada y activa aquí.")
      } else if (r.reason === "denied") {
        setMsg("Permiso de notificaciones bloqueado. Actívalo en los ajustes del navegador/app.")
      } else if (r.reason === "unsupported") {
        setMsg("Este navegador no soporta notificaciones push.")
      } else {
        setMsg("No se pudo activar. Intenta nuevamente.")
      }
    }
    setBusy(false)
  }

  const test = async () => {
    const ok = await notifyLocal({
      title: "Brunetti",
      body: `Prueba de notificación para ${barber?.name || "ti"}.`,
    })
    setMsg(ok ? "Notificación de prueba enviada." : "Activa primero las notificaciones para probar.")
  }

  return (
    <div className="cfg-card">
      <p className="cfg-card-head">Notificaciones push · iOS</p>
      <CfgRow
        label="Avisarme de nuevas reservas"
        sub="Recibe un aviso cuando un cliente agende una hora contigo."
      >
        <ConfigSwitch checked={enabled} disabled={busy || iosNeedsInstall} onChange={toggle} />
      </CfgRow>

      {iosNeedsInstall && (
        <div style={{
          marginTop: ".8rem", padding: ".85rem 1rem", borderRadius: 12,
          border: "1px solid var(--gold-line)", background: "rgba(201,161,78,0.07)",
          fontSize: ".82rem", color: "var(--ink-soft)", lineHeight: 1.5,
        }}>
          <strong style={{ color: "var(--gold-lt)" }}>Para activar en iPhone:</strong> abre esta web en Safari,
          toca <b>Compartir</b> → <b>Agregar a inicio</b>. Abre la app instalada y vuelve aquí para activar las push.
        </div>
      )}

      {!supported && !iosNeedsInstall && (
        <p style={{ marginTop: ".7rem", fontSize: ".8rem", color: "var(--muted)" }}>
          Este dispositivo o navegador no soporta notificaciones push.
        </p>
      )}

      {enabled && (
        <button className="btn btn-dark btn-sm" style={{ marginTop: ".9rem" }} onClick={test}>
          <Icon name="bell" size={13} /> Enviar notificación de prueba
        </button>
      )}

      {msg && <p style={{ marginTop: ".8rem", fontSize: ".8rem", color: "var(--gold-lt)" }}>{msg}</p>}

      <p style={{ marginTop: ".9rem", fontSize: ".74rem", color: "var(--muted-2)", lineHeight: 1.5 }}>
        Solo tú recibirás estos avisos en tu cuenta. Estado del permiso: <b>{perm}</b>.
      </p>
    </div>
  )
}

function isStrongPassword(pw) {
  return /^[A-Za-z0-9]{8,64}$/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
}

function ConfigPanel({ brunettiOnly, barber, barbers, admin, canManageTeam, barberDraft, setBarberDraft, saveBarber, updateBarberLocal, deleteBarber, onExport, onLogout, nav, navSettings, setNavSettings, dockShortcuts, setDockShortcuts }) {
  const [section, setSection] = useState(null)
  // En modo "solo Brunetti" se oculta la gestión de Equipo/barberos (código conservado).
  const sections = brunettiOnly ? CFG_SECTIONS.filter((s) => s.id !== "equipo") : CFG_SECTIONS
  const [teamModal, setTeamModal] = useState(null) // null=cerrado; {barber:null}=crear; {barber:obj}=editar
  const [biz, setBiz] = useState(() => {
    try { return { name: "Brunetti Barber Studio", address: "Maipú, Santiago", phone: "+56 9 1234 5678", waPhone: "+56 9 1234 5678", ...JSON.parse(localStorage.getItem("ps_biz") || "{}") } } catch { return { name: "Brunetti Barber Studio", address: "Maipú, Santiago", phone: "+56 9 1234 5678", waPhone: "+56 9 1234 5678" } }
  })
  const [bizSaved, setBizSaved] = useState("")
  const saveBiz = () => {
    try { localStorage.setItem("ps_biz", JSON.stringify(biz)) } catch {}
    setBizSaved("ok"); setTimeout(() => setBizSaved(""), 1800)
  }
  const [pwOpen, setPwOpen] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwStatus, setPwStatus] = useState("") // "", "saving", "done"
  const [pwError, setPwError] = useState("")

  const changePassword = async () => {
    setPwError("")
    if (!isStrongPassword(pwForm.next)) {
      setPwError("La nueva contraseña debe tener 8 caracteres alfanuméricos, con al menos 1 mayúscula y 1 número.")
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Las contraseñas no coinciden.")
      return
    }
    setPwStatus("saving")
    try {
      const token = localStorage.getItem("ps_barber_token") || ""
      const res = await fetch("/api/auth-barber", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setPwStatus("done")
        setPwForm({ current: "", next: "", confirm: "" })
        setTimeout(() => { setPwStatus(""); setPwOpen(false) }, 2000)
      } else {
        setPwStatus("")
        setPwError(data.error || "No se pudo cambiar la contraseña.")
      }
    } catch {
      setPwStatus("")
      setPwError("No se pudo conectar con el servidor.")
    }
  }
  const [notifSettings, setNotifSettings] = useState({ reserva: true, cancelacion: true, recordatorio: true, marketing: false })
  const [waSettings, setWaSettings] = useState({ activo: true, recordatorio24h: true, recordatorio2h: false, confirmacion: true })
  const [acct, setAcct] = useState({ name: barber?.name || "", code: barber?.code || "" })
  const [acctSaved, setAcctSaved] = useState(false)
  const saveAccount = () => {
    const updated = { ...barber, name: acct.name.trim() || barber?.name, code: acct.code.trim() || barber?.code }
    try { localStorage.setItem("ps_barber", JSON.stringify(updated)) } catch {}
    setAcctSaved(true)
    setTimeout(() => setAcctSaved(false), 2500)
  }
  const { theme, toggle } = useTheme()

  const current = sections.find((s) => s.id === section)

  // If no section picked: show full-screen list
  if (!section) {
    return (
      <div className="animate-in cfg-list-screen">
        <p className="cfg-nav-head">Configuraciones</p>
        <div className="cfg-list">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className="cfg-list-item"
              onClick={() => setSection(s.id)}
            >
              <span className="cfg-list-icon"><Icon name={s.icon} size={18} /></span>
              <span className="cfg-list-label">{s.label}</span>
              <Icon name="arrowRight" size={16} style={{ opacity: .4 }} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in cfg-detail-screen">
      <button type="button" className="cfg-back" onClick={() => setSection(null)}>
        <Icon name="arrowLeft" size={16} /> Volver a ajustes
      </button>
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
                  <input className="input" value={acct.name} onChange={(e) => setAcct((a) => ({ ...a, name: e.target.value }))} placeholder="Nombre completo" />
                </div>
                <div className="cfg-field">
                  <label>Usuario</label>
                  <input className="input" value={acct.code} onChange={(e) => setAcct((a) => ({ ...a, code: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="usuario" />
                </div>
                <div className="cfg-field">
                  <label>Rol</label>
                  <input className="input" defaultValue={barber?.role || "Barbero"} disabled />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginTop: ".5rem" }}>
                <button className="btn btn-gold" onClick={saveAccount}><Icon name="check" size={14} /> Guardar cambios</button>
                {acctSaved && <span className="chip chip-gold" style={{ fontSize: ".72rem" }}><Icon name="check" size={12} /> Guardado</span>}
              </div>
            </div>

            <div className="cfg-card">
              <p className="cfg-card-head">Cambiar contraseña</p>
              {!pwOpen && (
                <button className="btn btn-dark" onClick={() => { setPwOpen(true); setPwError(""); setPwStatus(""); setPwForm({ current: "", next: "", confirm: "" }) }}>
                  <Icon name="key" size={14} /> Cambiar contraseña
                </button>
              )}
              {pwOpen && (
                <div style={{ display: "grid", gap: ".7rem" }}>
                  <div className="cfg-field">
                    <label>Contraseña actual</label>
                    <input className="input" type="password" autoComplete="current-password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} placeholder="Tu contraseña actual" />
                  </div>
                  <div className="cfg-field">
                    <label>Nueva contraseña</label>
                    <input className="input" type="password" autoComplete="new-password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value.slice(0, 64) }))} placeholder="8+ caracteres, 1 mayúscula y 1 número" />
                  </div>
                  <div className="cfg-field">
                    <label>Confirmar nueva contraseña</label>
                    <input className="input" type="password" autoComplete="new-password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value.slice(0, 64) }))} placeholder="Repite la nueva contraseña" />
                  </div>
                  <p style={{ fontSize: ".74rem", color: pwForm.next && !isStrongPassword(pwForm.next) ? "#d99a8f" : "var(--muted-2)", margin: 0 }}>
                    Mínimo 8 caracteres alfanuméricos, con al menos 1 mayúscula y 1 número.
                  </p>
                  {pwError && <p style={{ fontSize: ".8rem", color: "#d99a8f", margin: 0 }}>{pwError}</p>}
                  {pwStatus === "done" && <p style={{ fontSize: ".8rem", color: "var(--gold-lt)", margin: 0 }}><Icon name="check" size={12} /> Contraseña actualizada.</p>}
                  <div style={{ display: "flex", gap: ".5rem", marginTop: ".2rem" }}>
                    <button className="btn btn-gold btn-sm" disabled={pwStatus === "saving"} onClick={changePassword}>
                      {pwStatus === "saving" ? "Guardando…" : "Guardar contraseña"}
                    </button>
                    <button className="btn btn-dark btn-sm" onClick={() => { setPwOpen(false); setPwError(""); setPwStatus("") }}>Cancelar</button>
                  </div>
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
            <PushCard barber={barber} />
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
                  <input className="input" placeholder="+56 9 xxxx xxxx" value={biz.waPhone} onChange={(e) => setBiz((b) => ({ ...b, waPhone: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: ".5rem" }} onClick={saveBiz}><Icon name="check" size={14} /> {bizSaved ? "Guardado ✓" : "Guardar"}</button>
            </div>
          </div>
        )}

        {/* NEGOCIO */}
        {section === "negocio" && (
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div className="cfg-card">
              <p className="cfg-card-head">Datos del negocio</p>
              <div className="cfg-form-grid">
                <div className="cfg-field"><label>Nombre</label><input className="input" value={biz.name} onChange={(e) => setBiz((b) => ({ ...b, name: e.target.value }))} /></div>
                <div className="cfg-field"><label>Direccion</label><input className="input" value={biz.address} onChange={(e) => setBiz((b) => ({ ...b, address: e.target.value }))} /></div>
                <div className="cfg-field"><label>Telefono</label><input className="input" value={biz.phone} onChange={(e) => setBiz((b) => ({ ...b, phone: e.target.value }))} /></div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: ".5rem" }} onClick={saveBiz}><Icon name="check" size={14} /> {bizSaved ? "Guardado ✓" : "Guardar"}</button>
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
            <div className="cfg-card">
              <div className="cfg-card-head-row">
                <p className="cfg-card-head" style={{ margin: 0 }}>Usuarios y permisos</p>
                {canManageTeam && (
                  <button className="btn btn-gold btn-sm" onClick={() => setTeamModal({ barber: null })}>
                    <Icon name="user" size={14} /> Nuevo barbero
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gap: ".6rem" }}>
                {barbers.map((item) => {
                  const lockedAdmin = item.name?.toLowerCase().includes("brunetti") || item.admin
                  const activePerms = [["canViewFinance","Finanzas"],["canEditServices","Servicios"],["canManageTeam","Equipo"],["canManageBlocks","Bloques"]]
                    .filter(([k]) => lockedAdmin || (k === "canManageBlocks" ? item[k] !== false : Boolean(item[k])))
                    .map(([, l]) => l)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`cfg-barber-row is-tappable ${item.active === false ? "is-disabled" : ""}`}
                      onClick={() => canManageTeam && setTeamModal({ barber: item })}
                      disabled={!canManageTeam}
                    >
                      <div className="cfg-barber-head">
                        <div className="cfg-barber-avatar">{(item.name || "B")[0].toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: ".9rem" }}>{item.name} {lockedAdmin && <Icon name="key" size={11} color="var(--gold)" />}</strong>
                          <span style={{ fontSize: ".74rem", color: "var(--muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {activePerms.length ? activePerms.join(" · ") : "Sin permisos extra"}
                          </span>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                          <span className={item.active === false ? "chip" : "chip chip-gold"}>{item.active === false ? "Inactivo" : "Activo"}</span>
                          <Icon name="arrowRight" size={15} color="var(--muted)" />
                        </div>
                      </div>
                    </button>
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
                    <button className="btn btn-dark btn-sm" onClick={() => onExport(label)}><Icon name={icon} size={13} /> Exportar CSV</button>
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
              <h3 className="font-display" style={{ margin: "0 0 .3rem", fontSize: "1.4rem" }}>BRUNETTI</h3>
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

      {teamModal && (
        <BarberModal
          barber={teamModal.barber}
          canManage={canManageTeam}
          onClose={() => setTeamModal(null)}
          onSave={(payload) => { saveBarber(payload); setTeamModal(null) }}
          onDelete={(b) => { deleteBarber(b); setTeamModal(null) }}
        />
      )}
    </div>
  )
}

/* ============================================================
   Shell + Topbar — UI envoltura responsive
   ============================================================ */
function DashboardShell({ tab, setTab, nav, dockItems, barber, onLogout, children }) {
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
      <MobileDock tab={tab} setTab={setTab} nav={nav} shortcuts={dockItems} />
    </div>
  )
}

function DashboardTopbar({ title, barber, onLogout, tab, setTab, nav, notifCount = 0 }) {
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
          <small>Brunetti</small>
        </div>
      </div>
      <div className="dashboard-topbar-actions">
        <ThemeToggle />
        <button
          type="button"
          className="notif-pill"
          title={notifCount ? `${notifCount} reserva(s) pendiente(s)` : 'Sin pendientes'}
          onClick={() => setTab('reservas')}
          style={{ cursor: 'pointer' }}
        >
          <Icon name="bell" size={14} /> {notifCount}
        </button>
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
