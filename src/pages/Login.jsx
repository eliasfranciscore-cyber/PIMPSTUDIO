import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon, MobileScreen } from '../components/ui.jsx'

// Si el teléfono ya tiene reservas (activas o pasadas), lo mandamos a /cuenta
// en vez de forzarlo a agendar una nueva. Ante cualquier falla, asumimos que
// no tiene (mejor UX: lo dejamos seguir al flujo de reserva de siempre).
async function hasExistingBookings(phone) {
  try {
    const res = await fetch("/api/bookings?phone=" + phone)
    const data = await res.json()
    return Boolean(data?.bookings?.length)
  } catch {
    return false
  }
}

function fmtPhone(v) {
  const d = String(v || "").replace(/\D/g, "").slice(0, 9)
  if (d.length <= 1) return d
  if (d.length <= 5) return `${d[0]} ${d.slice(1)}`
  return `${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const d = phone.replace(/\D/g, "")
    if (d.length !== 9) { setErr("El número debe tener 9 dígitos."); return }
    if (mode === "register" && (!name.trim() || !email.trim())) { setErr("Completa nombre y correo."); return }
    setErr("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: d, name: name.trim(), email: email.trim(), mode }),
      })
      const data = await res.json()
      if (data.ok) {
        localStorage.setItem("ps_user", JSON.stringify(data.user))
        navigate(await hasExistingBookings(d) ? "/cuenta" : "/reservar")
      } else {
        if (res.status === 404 && mode === "login") {
          setMode("register")
          setErr("No encontramos ese telefono. Completa tus datos para registrarte.")
          return
        }
        setErr(data.error || "Error de autenticación")
      }
    } catch {
      setErr("No pudimos conectar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreen>
      <div style={{ minHeight: "100vh", display: "grid", alignContent: "center", padding: "1.4rem 1.5rem 2rem", gap: "1.4rem", maxWidth: "500px", margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: 0, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".8rem", justifySelf: "start" }}>
          <Icon name="arrowLeft" size={15} /> Volver al inicio
        </button>

        <div className="animate-up" style={{ display: "grid", justifyItems: "center", gap: ".8rem", textAlign: "center" }}>
          <Emblem size={78} />
          <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem" }}>Ingresa con tu telefono o registra tus datos una sola vez.</p>
        </div>

        <div className="card animate-up" style={{ padding: "1.3rem", display: "grid", gap: "1rem", animationDelay: ".08s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".4rem", background: "var(--fill-track)", padding: 4, borderRadius: 999, border: "1px solid var(--hair)" }}>
            {[["login", "Ingresar"], ["register", "Registrarme"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setErr("") }} className="font-display" style={{
                border: 0, borderRadius: 999, padding: ".6rem", fontSize: ".78rem", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600,
                background: mode === m ? "var(--gold-grad)" : "transparent", color: mode === m ? "var(--on-gold)" : "var(--muted)", transition: "all .25s",
              }}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: ".9rem" }}>
            {mode === "register" && (
              <>
                <div className="field animate-up">
                  <label>Nombre completo</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div className="field animate-up">
                  <label>Correo electrónico</label>
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.cl" type="email" />
                </div>
              </>
            )}
            <div className="field">
              <label>Número de teléfono</label>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", background: "var(--fill-card)", border: "1px solid var(--hair-2)", borderRadius: 8, padding: "0 .8rem" }}>
                <span style={{ color: "var(--muted)", fontSize: ".95rem", borderRight: "1px solid var(--hair)", paddingRight: ".6rem" }}>🇨🇱 +56</span>
                <input value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))} placeholder="9 1234 5678" inputMode="numeric"
                  style={{ flex: 1, background: "transparent", border: 0, color: "var(--ink)", padding: ".85rem 0", fontSize: "1.05rem", letterSpacing: ".06em", outline: "none" }} />
              </div>
            </div>
            {err && <div style={{ color: "#e0a89c", fontSize: ".8rem", display: "flex", alignItems: "center", gap: ".4rem" }}><Icon name="bell" size={14} /> {err}</div>}
            <button className="btn btn-gold btn-block" type="submit" style={{ marginTop: ".2rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Entrando…" : (mode === "login" ? "Ingresar" : "Crear cuenta")} {!loading && <Icon name="arrowRight" size={15} />}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", color: "var(--muted-2)", fontSize: ".74rem", margin: 0, lineHeight: 1.5 }}>
          Al continuar aceptas nuestros términos. Guardamos tu número para identificarte en próximas visitas.
        </p>
      </div>
    </MobileScreen>
  )
}
