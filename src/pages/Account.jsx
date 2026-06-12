import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, MobileScreen, StatusBar } from '../components/ui.jsx'
import { CLIENT_APPTS, barberById, CLP, MONTHS_ES } from '../data.js'

export default function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [appts, setAppts] = useState(CLIENT_APPTS)

  useEffect(() => {
    const stored = localStorage.getItem("ps_user")
    if (!stored) { navigate("/login"); return }
    const parsed = JSON.parse(stored)
    setUser(parsed)
    fetch("/api/clients?phone=" + parsed.phone)
      .then(r => r.json())
      .then(data => { if (data.client) setUser((current) => ({ ...current, ...data.client })) })
      .catch(() => {})
    fetch("/api/bookings?phone=" + parsed.phone)
      .then(r => r.json())
      .then(data => { if (data.bookings?.length) setAppts(data.bookings) })
      .catch(() => {})
  }, [])

  const logout = () => { localStorage.removeItem("ps_user"); navigate("/") }
  const next = appts.find((a) => a.when === "next")
  const past = appts.filter((a) => a.when === "past")
  const nb = next && barberById(next.barberId)

  if (!user) return null

  return (
    <MobileScreen>
      <StatusBar />
      <div style={{ padding: "0.6rem 1.3rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Brandmark size={34} />
        <button onClick={logout} className="chip" style={{ cursor: "pointer" }}><Icon name="logout" size={14} /> Salir</button>
      </div>

      <div style={{ padding: "0 1.3rem 2.2rem", display: "grid", gap: "1.1rem" }}>
        <div className="card animate-up" style={{ padding: "1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", fontSize: "1.4rem", fontWeight: 700, color: "#1a1407", flexShrink: 0 }}>
            {(user.name || "C")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontWeight: 600, fontSize: "1.15rem" }}>{user.name || "Cliente"}</div>
            <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>+56 {user.phone?.replace(/(\d)(\d{4})(\d{4})/, "$1 $2 $3")}</div>
          </div>
          <span className="chip chip-gold"><Icon name="star" size={12} /> {past.length || user.visits || 0} visitas</span>
        </div>

        <div className="account-stats">
          <div className="card"><strong>{past.length || user.visits || 0}</strong><span>Cortes registrados</span></div>
          <div className="card"><strong>{CLP(user.totalSpent || past.reduce((sum, item) => sum + Number(item.price || 0), 0))}</strong><span>Historial pagado</span></div>
          <div className="card"><strong>{next ? next.date : "Sin cita"}</strong><span>Proxima reserva</span></div>
        </div>

        <div className="animate-up" style={{ animationDelay: ".06s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
            <span className="eyebrow">Próxima cita</span>
            <button onClick={() => navigate("/reservar")} style={{ background: "none", border: 0, color: "var(--gold)", fontSize: ".76rem", letterSpacing: ".08em", textTransform: "uppercase" }}>+ Nueva</button>
          </div>
          {next ? (
            <div className="card card-line" style={{ padding: "1.2rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 120px at 90% 0%, rgba(201,161,78,0.12), transparent 70%)" }} />
              <div style={{ position: "relative", display: "grid", gap: ".9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{next.service}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".84rem" }}>con {nb?.name}</div>
                  </div>
                  <span className="chip chip-gold" style={{ textTransform: "uppercase" }}>{next.status}</span>
                </div>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                  <span className="chip"><Icon name="calendar" size={13} color="var(--gold)" /> {next.date}</span>
                  <span className="chip"><Icon name="clock" size={13} color="var(--gold)" /> {next.time} hrs</span>
                  <span className="chip">{CLP(next.price)}</span>
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button className="btn btn-dark btn-sm" style={{ flex: 1 }}>Reagendar</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Cancelar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "1.6rem", textAlign: "center", color: "var(--muted)" }}>No tienes citas próximas.</div>
          )}
        </div>

        <div className="animate-up" style={{ animationDelay: ".12s" }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: ".6rem" }}>Historial</span>
          <div style={{ display: "grid", gap: ".6rem" }}>
            {past.map((a) => {
              const b = barberById(a.barberId)
              return (
                <div key={a.id} className="card" style={{ padding: ".95rem 1.1rem", display: "flex", alignItems: "center", gap: ".9rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,161,78,0.08)", border: "1px solid var(--gold-line)", display: "grid", placeItems: "center", color: "var(--gold)", flexShrink: 0 }}>
                    <Icon name="cut" size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: ".92rem" }}>{a.service}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".76rem" }}>{b?.short} · {a.date?.split("-").reverse().join("/")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".84rem", color: "var(--ink-soft)" }}>{CLP(a.price)}</div>
                    <div style={{ fontSize: ".68rem", color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".06em" }}>{a.status}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-gold btn-block" onClick={() => navigate("/reservar")}><Icon name="calendar" size={16} /> Agendar nueva cita</button>
      </div>
    </MobileScreen>
  )
}
