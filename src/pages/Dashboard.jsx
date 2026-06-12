import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, Stat } from '../components/ui.jsx'
import { BARBERS, METRICS, TODAY_BOOKINGS, barberById, CLP, CLPk, slotState } from '../data.js'

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
  const [barber, setBarber] = useState(null)
  const m = METRICS
  const maxRev = Math.max(...m.barberRanking.map((r) => r.rev))

  useEffect(() => {
    const stored = localStorage.getItem("ps_barber")
    if (!stored) { navigate("/ingreso"); return }
    setBarber(JSON.parse(stored))
  }, [])

  const logout = () => { localStorage.removeItem("ps_barber"); navigate("/") }

  const nav = [
    ["resumen",   "grid",     "Resumen"],
    ["agenda",    "calendar", "Agenda"],
    ["reservas",  "scissors", "Reservas"],
    ["finanzas",  "wallet",   "Finanzas"],
    ["marketing", "spark",    "Marketing"],
  ]

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
              {BARBERS.slice(0, 6).map((b) => (
                <button key={b.id} onClick={() => setAgendaBarber(b.id)} className="chip" style={{ cursor: "pointer", borderColor: agendaBarber === b.id ? "var(--gold-line)" : "var(--hair-2)", color: agendaBarber === b.id ? "var(--gold-lt)" : "var(--ink-soft)", background: agendaBarber === b.id ? "rgba(201,161,78,0.08)" : "transparent" }}>{b.short}</button>
              ))}
            </div>
            <Panel title={`Agenda · ${barberById(agendaBarber)?.name}`} action={<span className="chip chip-gold">Esta semana</span>}>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "60px repeat(6,1fr)", gap: ".3rem", minWidth: 620 }}>
                  <div />
                  {["Lun 9", "Mar 10", "Mié 11", "Jue 12", "Vie 13", "Sáb 14"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: ".72rem", color: "var(--muted)", fontWeight: 600, paddingBottom: ".3rem" }}>{d}</div>)}
                  {["09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"].map((t) => (
                    <React.Fragment key={t}>
                      <div style={{ fontSize: ".7rem", color: "var(--muted-2)", display: "flex", alignItems: "center" }}>{t}</div>
                      {[0, 1, 2, 3, 4, 5].map((day) => {
                        const st = slotState(agendaBarber, `2026-06-${9 + day}`, t)
                        const map = {
                          booked:  { bg: "rgba(201,161,78,0.16)", bd: "var(--gold-line)", tx: "var(--gold-lt)" },
                          blocked: { bg: "rgba(255,255,255,0.03)", bd: "var(--hair)", tx: "var(--muted-2)" },
                          free:    { bg: "rgba(255,255,255,0.015)", bd: "var(--hair)", tx: "var(--muted-2)" },
                        }
                        const s = map[st]
                        return <div key={day} style={{ height: 38, borderRadius: 7, border: `1px solid ${s.bd}`, background: s.bg, display: "grid", placeItems: "center", fontSize: ".7rem", color: s.tx }}>{st === "booked" ? "●" : st === "blocked" ? "—" : ""}</div>
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Panel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              <Stat icon="calendar" label="Reservas hoy" value="12" />
              <Stat icon="clock"    label="Horas libres" value="3.5" suffix="h" />
              <Stat icon="trend"    label="Ocupación hoy" value="82" suffix="%" accent />
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
