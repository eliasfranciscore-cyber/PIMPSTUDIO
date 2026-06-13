import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, MobileScreen } from '../components/ui.jsx'
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
      <div style={{ padding: "0.6rem 1.3rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Brandmark size={34} />
        <button onClick={logout} className="chip" style={{ cursor: "pointer" }}><Icon name="logout" size={14} /> Salir</button>
      </div>

      <div style={{ padding: "0 1.3rem 2.2rem", display: "grid", gap: ".8rem", maxWidth: "900px", margin: "0 auto" }}>
        <div className="card animate-up" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", fontSize: "1.2rem", fontWeight: 700, color: "#1a1407", flexShrink: 0 }}>
            {(user.name || "C")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-display" style={{ fontWeight: 600, fontSize: "1rem" }}>{user.name || "Cliente"}</div>
            <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>+56 {user.phone?.replace(/(\d)(\d{4})(\d{4})/, "$1 $2 $3")}</div>
          </div>
          <span className="chip chip-gold" style={{ flexShrink: 0, fontSize: ".7rem" }}><Icon name="star" size={11} /> {past.length || user.visits || 0}</span>
        </div>

        <div className="account-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: ".6rem" }}>
          <div className="card"><strong style={{ fontSize: "1.3rem" }}>{past.length || user.visits || 0}</strong><span>Cortes</span></div>
          <div className="card"><strong style={{ fontSize: "1.1rem" }}>{CLP(user.totalSpent || past.reduce((sum, item) => sum + Number(item.price || 0), 0))}</strong><span>Gastado</span></div>
          <div className="card"><strong style={{ fontSize: "1rem" }}>{next ? next.date : "Sin cita"}</strong><span>Próxima</span></div>
        </div>

        <div className="animate-up" style={{ animationDelay: ".06s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".4rem" }}>
            <span className="eyebrow" style={{ fontSize: ".75rem" }}>Próxima cita</span>
            <button onClick={() => navigate("/reservar")} style={{ background: "none", border: 0, color: "var(--gold)", fontSize: ".65rem", letterSpacing: ".08em", textTransform: "uppercase" }}>+ Nueva</button>
          </div>
          {next ? (
            <div className="card card-line" style={{ padding: ".8rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 120px at 90% 0%, rgba(201,161,78,0.12), transparent 70%)" }} />
              <div style={{ position: "relative", display: "grid", gap: ".5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: ".5rem" }}>
                  <div>
                    <div className="font-display" style={{ fontSize: ".95rem", fontWeight: 600 }}>{next.service}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>con {nb?.name}</div>
                  </div>
                  <span className="chip chip-gold" style={{ textTransform: "uppercase", fontSize: ".6rem", padding: ".25rem .5rem", flexShrink: 0 }}>{next.status}</span>
                </div>
                <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                  <span className="chip" style={{ fontSize: ".65rem", padding: ".3rem .5rem" }}><Icon name="calendar" size={11} color="var(--gold)" /> {next.date}</span>
                  <span className="chip" style={{ fontSize: ".65rem", padding: ".3rem .5rem" }}><Icon name="clock" size={11} color="var(--gold)" /> {next.time} hrs</span>
                  <span className="chip" style={{ fontSize: ".65rem", padding: ".3rem .5rem" }}>{CLP(next.price)}</span>
                </div>
                <div style={{ display: "flex", gap: ".4rem" }}>
                  <button className="btn btn-dark btn-sm" style={{ flex: 1, fontSize: ".65rem", padding: ".35rem" }}>Reagendar</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: ".65rem", padding: ".35rem" }}>Cancelar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: ".8rem" }}>No tienes citas próximas.</div>
          )}
        </div>

        <div className="animate-up" style={{ animationDelay: ".12s" }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: ".4rem", fontSize: ".75rem" }}>Historial</span>
          <div style={{ display: "grid", gap: ".4rem" }}>
            {past.slice(0, 5).map((a) => {
              const b = barberById(a.barberId)
              return (
                <div key={a.id} className="card" style={{ padding: ".6rem .8rem", display: "flex", alignItems: "center", gap: ".6rem", fontSize: ".8rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,161,78,0.08)", border: "1px solid var(--gold-line)", display: "grid", placeItems: "center", color: "var(--gold)", flexShrink: 0 }}>
                    <Icon name="cut" size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{a.service}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".7rem" }}>{b?.short} · {a.date?.split("-").reverse().join("/")}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--gold)" }}>{CLP(a.price)}</div>
                    <div style={{ fontSize: ".65rem", color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{a.status}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-gold btn-block" onClick={() => navigate("/reservar")} style={{ fontSize: ".8rem", padding: ".6rem" }}><Icon name="calendar" size={14} /> Agendar nueva cita</button>
      </div>
    </MobileScreen>
  )
}
