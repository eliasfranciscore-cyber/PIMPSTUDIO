import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon } from '../components/ui.jsx'
import { BARBERS } from '../data.js'

const MAX_ATTEMPTS = 3
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutos

function getLockout() {
  try {
    return JSON.parse(localStorage.getItem("ps_login_lockout") || "null")
  } catch { return null }
}
function setLockout(data) {
  localStorage.setItem("ps_login_lockout", JSON.stringify(data))
}
function clearLockout() {
  localStorage.removeItem("ps_login_lockout")
}

export default function BarberLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(() => {
    const lk = getLockout()
    if (lk && lk.until > Date.now()) return lk.until
    if (lk) clearLockout()
    return null
  })
  const [attempts, setAttempts] = useState(() => getLockout()?.attempts || 0)

  // Si ya hay una sesión guardada y vigente, entra directo al panel sin pedir
  // login otra vez (el panel cierra sesión solo tras 30 min de inactividad).
  React.useEffect(() => {
    if (localStorage.getItem("ps_barber")) navigate("/panel", { replace: true })
  }, [])

  // countdown timer para mostrar minutos restantes del bloqueo
  React.useEffect(() => {
    if (!lockedUntil) return
    const iv = setInterval(() => {
      if (Date.now() >= lockedUntil) { clearLockout(); setLockedUntil(null); setAttempts(0); setErr("") }
    }, 5000)
    return () => clearInterval(iv)
  }, [lockedUntil])

  const recordFailure = () => {
    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS
      setLockout({ attempts: next, until })
      setLockedUntil(until)
    } else {
      setLockout({ attempts: next, until: 0 })
    }
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    if (lockedUntil && Date.now() < lockedUntil) return
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
        clearLockout()
        localStorage.setItem("ps_barber", JSON.stringify(data.barber))
        localStorage.setItem("ps_barber_token", data.token || "")
        navigate("/panel")
      } else {
        const n = recordFailure()
        if (n >= MAX_ATTEMPTS) {
          setErr(`Demasiados intentos fallidos. Panel bloqueado por 15 minutos.`)
        } else {
          setErr(`${data.error || "Usuario o contraseña incorrectos"} (${MAX_ATTEMPTS - n} intento${MAX_ATTEMPTS - n === 1 ? "" : "s"} restante${MAX_ATTEMPTS - n === 1 ? "" : "s"})`)
        }
      }
    } catch {
      // Fallback local para desarrollo (Vite no sirve serverless functions).
      // Credenciales: usuario = code del barbero | contraseña = 8+ caracteres.
      if (import.meta.env.DEV) {
        const devBarber = BARBERS.find((b) =>
          b.code === username.trim().toLowerCase() || b.name.toLowerCase() === username.trim().toLowerCase()
        ) || BARBERS[0]
        if (devBarber && password.length >= 8) {
          clearLockout()
          localStorage.setItem("ps_barber", JSON.stringify({ ...devBarber, admin: true }))
          localStorage.setItem("ps_barber_token", "dev-token")
          navigate("/panel")
          setLoading(false)
          return
        }
      }
      const n = recordFailure()
      if (n >= MAX_ATTEMPTS) {
        setErr("Demasiados intentos fallidos. Panel bloqueado por 15 minutos.")
      } else {
        setErr(`No se pudo conectar. Revisa tu conexión. (${MAX_ATTEMPTS - n} intento${MAX_ATTEMPTS - n === 1 ? "" : "s"} restante${MAX_ATTEMPTS - n === 1 ? "" : "s"})`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    // El acceso interno es siempre de estética oscura (foto + panel negro).
    // Forzamos la paleta dark localmente para que los textos (título, labels)
    // sean legibles aunque la web pública esté en tema claro.
    <div className="barber-login-shell" data-theme="dark">
      <div className="barber-login-card">
        <div className="barber-login-visual">
          <img src="/assets/gallery-2.jpg" alt="Brunetti interior" />
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
              {(err || lockedUntil) && (
                <div className="barber-login-error">
                  <Icon name="bell" size={14} />
                  {lockedUntil && Date.now() < lockedUntil
                    ? `Panel bloqueado por intentos fallidos. Reintenta en ${Math.ceil((lockedUntil - Date.now()) / 60000)} min.`
                    : err}
                </div>
              )}
              <button
                className="btn btn-gold btn-block"
                type="submit"
                disabled={loading || !!(lockedUntil && Date.now() < lockedUntil)}
                style={{ opacity: (loading || (lockedUntil && Date.now() < lockedUntil)) ? 0.45 : 1 }}
              >
                {loading
                  ? "Verificando…"
                  : lockedUntil && Date.now() < lockedUntil
                    ? `Bloqueado · ${Math.ceil((lockedUntil - Date.now()) / 60000)} min restantes`
                    : "Entrar al panel"}
                {!loading && !(lockedUntil && Date.now() < lockedUntil) && <Icon name="arrowRight" size={15} />}
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
