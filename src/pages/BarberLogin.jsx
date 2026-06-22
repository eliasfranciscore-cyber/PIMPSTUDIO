import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon } from '../components/ui.jsx'

export default function BarberLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || password.length < 8) { setErr("Ingresa tu usuario y contraseña (mínimo 8 caracteres)."); return }
    setErr("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth-barber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()
      if (data.ok) {
        localStorage.setItem("ps_barber", JSON.stringify(data.barber))
        localStorage.setItem("ps_barber_token", data.token || "")
        navigate("/panel")
      } else {
        setErr(data.error || "Usuario o contraseña incorrectos")
      }
    } catch {
      setErr("No se pudo conectar. Revisa tu conexión e inténtalo nuevamente.")
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
            <span className="eyebrow">Acceso Brunetti</span>
            <Emblem size={88} />
            <h1 className="font-display">Panel interno · agenda de Brunetti.</h1>
            <p>
              Desde aquí Bruno gestiona su agenda y sus reservas en BRUNETTI.
              Acceso exclusivo de administración.
            </p>
            <div className="barber-login-pill-row">
              <span className="chip chip-gold">Agenda</span>
              <span className="chip">Reservas</span>
            </div>
          </div>
        </div>

        <div className="barber-login-form-wrap">
          <div className="barber-login-form-panel">
            <div>
              <span className="eyebrow">Acceso equipo</span>
              <h2 className="font-display">Ingresa a tu panel</h2>
            </div>
            <form onSubmit={submit} className="barber-login-form">
              <div className="field">
                <label>Usuario</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu-usuario" autoComplete="username" />
              </div>
              <div className="field">
                <label>Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    style={{ paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    style={{ position: "absolute", right: ".6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "var(--muted)", fontSize: ".72rem", letterSpacing: ".08em", textTransform: "uppercase", padding: ".3rem" }}
                  >
                    {showPass ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
              {err && <div className="barber-login-error"><Icon name="bell" size={14} /> {err}</div>}
              <button className="btn btn-gold btn-block" type="submit" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Entrando…" : "Entrar al panel"} {!loading && <Icon name="arrowRight" size={15} />}
              </button>
            </form>
            <div className="barber-login-links">
              <button onClick={() => navigate("/")} type="button">← Ver web</button>
              <button type="button" onClick={() => setErr("Pide a la administración que restablezca tu contraseña, o cámbiala en Ajustes una vez dentro.")}>¿Olvidaste tu contraseña?</button>
            </div>
            <div className="barber-login-demo">
              ¿Primera vez? La administración te entrega tu contraseña.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
