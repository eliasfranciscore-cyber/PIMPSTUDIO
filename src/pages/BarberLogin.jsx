import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon } from '../components/ui.jsx'

export default function BarberLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [pin, setPin] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || pin.length !== 4) { setErr("Ingresa usuario y PIN de 4 dígitos."); return }
    setErr("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth-barber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      })
      const data = await res.json()
      if (data.ok) {
        localStorage.setItem("ps_barber", JSON.stringify(data.barber))
        navigate("/panel")
      } else {
        setErr(data.error || "Credenciales incorrectas")
      }
    } catch {
      // fallback demo login
      if (username && pin === "1234") {
        localStorage.setItem("ps_barber", JSON.stringify({ name: username, role: "Barbero" }))
        navigate("/panel")
      } else {
        setErr("Demo: usa PIN 1234 para probar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "min(920px, 100%)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", borderRadius: 16, overflow: "hidden", border: "1px solid var(--hair)", boxShadow: "var(--shadow)" }}>
        {/* visual side */}
        <div style={{ position: "relative", minHeight: 420, display: "grid", placeItems: "center", padding: "2rem", borderRight: "1px solid var(--hair)" }}>
          <img src="/assets/gallery-2.png" alt="PIMP STUDIO interior" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,7,0.7), rgba(8,8,7,0.92))" }} />
          <div style={{ position: "relative", textAlign: "center", display: "grid", justifyItems: "center", gap: "1rem" }}>
            <Emblem size={92} />
            <h1 className="font-display" style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: ".04em" }}>PIMP STUDIO</h1>
            <span className="eyebrow">Acceso equipo · Panel interno</span>
          </div>
        </div>

        {/* form side */}
        <div style={{ display: "grid", placeItems: "center", padding: "2rem", background: "var(--panel)" }}>
          <div style={{ width: "min(360px,100%)", display: "grid", gap: "1.3rem" }}>
            <div>
              <h2 className="font-display" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>Iniciar sesión</h2>
              <p style={{ margin: ".3rem 0 0", color: "var(--muted)", fontSize: ".9rem" }}>Barberos y administración.</p>
            </div>
            <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
              <div className="field">
                <label>Usuario</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="tu-usuario" autoComplete="username" />
              </div>
              <div className="field">
                <label>PIN de acceso</label>
                <input className="input" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="• • • •" inputMode="numeric" style={{ letterSpacing: ".5em", fontSize: "1.2rem" }} />
              </div>
              {err && <div style={{ color: "#e0a89c", fontSize: ".82rem", display: "flex", alignItems: "center", gap: ".4rem" }}><Icon name="bell" size={14} /> {err}</div>}
              <button className="btn btn-gold btn-block" type="submit" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Entrando…" : "Entrar al panel"} {!loading && <Icon name="arrowRight" size={15} />}
              </button>
            </form>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem" }}>
              <button onClick={() => navigate("/")} style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}>← Ver web</button>
              <button style={{ background: "none", border: 0, color: "var(--gold)", cursor: "pointer" }}>¿Olvidaste tu PIN?</button>
            </div>
            <div style={{ borderTop: "1px solid var(--hair)", paddingTop: "1rem", fontSize: ".72rem", color: "var(--muted-2)", textAlign: "center" }}>
              Demo: usa cualquier usuario + PIN <strong style={{ color: "var(--gold)" }}>1234</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
