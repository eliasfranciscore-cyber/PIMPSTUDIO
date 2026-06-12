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
        localStorage.setItem("ps_barber_token", data.token || "")
        navigate("/panel")
      } else {
        setErr(data.error || "Credenciales incorrectas")
      }
    } catch {
      if (username && pin === "1234") {
        localStorage.setItem("ps_barber", JSON.stringify({ name: username, role: "Barbero" }))
        localStorage.setItem("ps_barber_token", "")
        navigate("/panel")
      } else {
        setErr("Demo: usa PIN 1234 para probar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="barber-login-shell">
      <div className="barber-login-card">
        <div className="barber-login-visual">
          <img src="/assets/gallery-2.png" alt="PIMP STUDIO interior" />
          <div className="barber-login-overlay" />
          <div className="barber-login-copy">
            <span className="eyebrow">Acceso equipo</span>
            <Emblem size={88} />
            <h1 className="font-display">Panel interno de operación y agenda.</h1>
            <p>
              Un acceso sobrio para barberos y administración. Mantiene el mismo flujo actual,
              pero con una entrada más clara para escritorio y móvil.
            </p>
            <div className="barber-login-pill-row">
              <span className="chip chip-gold">Agenda</span>
              <span className="chip">Clientes</span>
              <span className="chip">Servicios</span>
            </div>
          </div>
        </div>

        <div className="barber-login-form-wrap">
          <div className="barber-login-form-panel">
            <div>
              <span className="eyebrow">Inicio de sesión</span>
              <h2 className="font-display">Ingresa a tu panel</h2>
              <p>Barberos y administración comparten este acceso.</p>
            </div>
            <form onSubmit={submit} className="barber-login-form">
              <div className="field">
                <label>Usuario</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu-usuario" autoComplete="username" />
              </div>
              <div className="field">
                <label>PIN de acceso</label>
                <input
                  className="input"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="• • • •"
                  inputMode="numeric"
                  style={{ letterSpacing: ".5em", fontSize: "1.2rem" }}
                />
              </div>
              {err && <div className="barber-login-error"><Icon name="bell" size={14} /> {err}</div>}
              <button className="btn btn-gold btn-block" type="submit" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Entrando…" : "Entrar al panel"} {!loading && <Icon name="arrowRight" size={15} />}
              </button>
            </form>
            <div className="barber-login-links">
              <button onClick={() => navigate("/")} type="button">← Ver web</button>
              <button type="button">¿Olvidaste tu PIN?</button>
            </div>
            <div className="barber-login-demo">
              Demo: usa cualquier usuario + PIN <strong style={{ color: "var(--gold)" }}>1234</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
