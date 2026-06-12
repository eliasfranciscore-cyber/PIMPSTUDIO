import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon, MobileScreen, StatusBar } from '../components/ui.jsx'
import { BARBERS, SERVICES, SERVICE_BARBERS, SLOT_GROUPS, DAYS_ES, MONTHS_ES, slotState, barberById, CLP, tne } from '../data.js'

export default function Booking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [barberId, setBarberId] = useState(null)
  const [serviceId, setServiceId] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())
  const [dateKey, setDateKey] = useState(null)
  const [slot, setSlot] = useState(null)
  const [saving, setSaving] = useState(false)

  const barber = barberById(barberId)
  const service = SERVICES.find((s) => s.id === serviceId)
  const allowedServices = barberId ? SERVICES.filter((s) => SERVICE_BARBERS[barberId]?.includes(s.id)) : []
  const steps = ["Barbero", "Servicio", "Fecha", "Listo"]
  const canNext = (step === 0 && barberId) || (step === 1 && serviceId) || (step === 2 && dateKey && slot)

  const reset = () => { setStep(0); setBarberId(null); setServiceId(null); setDateKey(null); setSlot(null) }

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = new Date().toISOString().split("T")[0]
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dk = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  const isPast = (d) => dk(d) < todayKey
  const isSunday = (d) => new Date(year, month, d).getDay() === 0

  const confirm = async () => {
    setSaving(true)
    try {
      const user = JSON.parse(localStorage.getItem("ps_user") || "{}")
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, barberId, serviceId, date: dateKey, time: slot }),
      })
    } catch { /* fallback: still show confirmation */ }
    setSaving(false)
    setStep(3)
  }

  return (
    <MobileScreen>
      <StatusBar />
      <div style={{ padding: "0.5rem 1.2rem 0.9rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
        <button onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--hair)", borderRadius: 999, width: 38, height: 38, display: "grid", placeItems: "center", color: "var(--ink)", flexShrink: 0 }}>
          <Icon name="arrowLeft" size={17} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)" }}>Paso {Math.min(step + 1, 4)} de 4</div>
          <div className="font-display" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Reservar cita</div>
        </div>
        <Emblem size={34} />
      </div>

      <div style={{ padding: "0 1.2rem 1rem", display: "flex", gap: ".4rem" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? "var(--gold-grad)" : "rgba(255,255,255,0.08)", transition: "background .4s" }} />
        ))}
      </div>

      <div style={{ padding: "0 1.2rem 6rem", display: "grid", gap: "1rem" }}>
        {/* PASO 0 — BARBERO */}
        {step === 0 && (
          <div className="animate-in" style={{ display: "grid", gap: ".7rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0", fontSize: "1.05rem" }}>Elige tu barbero</h3>
            {BARBERS.map((b) => (
              <button key={b.id} onClick={() => { setBarberId(b.id); setServiceId(null) }} className="card" style={{
                textAlign: "left", padding: ".85rem", display: "flex", alignItems: "center", gap: ".9rem", cursor: "pointer",
                borderColor: barberId === b.id ? "var(--gold-line)" : "var(--hair)",
                boxShadow: barberId === b.id ? "0 0 0 2px var(--gold-glow)" : "var(--shadow)", transition: "all .2s",
              }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--hair-2)", flexShrink: 0, background: "var(--panel)" }}>
                  <img src="/assets/pimp-studio-logo.jpg" alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-display" style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: ".4rem" }}>{b.name} {b.tier === "premium" && <Icon name="star" size={12} color="var(--gold)" />}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem" }}>{b.role} · {b.exp}</div>
                </div>
                <div style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, border: barberId === b.id ? "0" : "1px solid var(--hair-2)", background: barberId === b.id ? "var(--gold-grad)" : "transparent", color: "#1a1407" }}>
                  {barberId === b.id && <Icon name="check" size={14} />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PASO 1 — SERVICIO */}
        {step === 1 && (
          <div className="animate-in" style={{ display: "grid", gap: ".7rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0", fontSize: "1.05rem" }}>Servicio con {barber?.short}</h3>
            {allowedServices.map((s) => (
              <button key={s.id} onClick={() => setServiceId(s.id)} className="card" style={{
                textAlign: "left", padding: "1rem", display: "grid", gap: ".4rem", cursor: "pointer",
                borderColor: serviceId === s.id ? "var(--gold-line)" : "var(--hair)",
                boxShadow: serviceId === s.id ? "0 0 0 2px var(--gold-glow)" : "var(--shadow)", transition: "all .2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-display" style={{ fontWeight: 600 }}>{s.name}</span>
                  <span className="font-display gold-text" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{CLP(s.price)}</span>
                </div>
                <div style={{ display: "flex", gap: ".5rem", color: "var(--muted)", fontSize: ".78rem", alignItems: "center" }}>
                  <Icon name="clock" size={13} /> {s.min} min {s.tne && <span style={{ color: "var(--muted-2)" }}>· TNE {CLP(tne(s.price))}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2 — FECHA + HORA */}
        {step === 2 && (
          <div className="animate-in" style={{ display: "grid", gap: "1rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0 -.2rem", fontSize: "1.05rem" }}>Elige fecha y hora</h3>
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".8rem" }}>
                <button onClick={() => setMonth(Math.max(0, month - 1))} disabled={month <= new Date().getMonth()} style={{ background: "none", border: 0, color: "var(--ink)", padding: 4 }}><Icon name="arrowLeft" size={18} /></button>
                <span className="font-display" style={{ fontWeight: 600, letterSpacing: ".04em" }}>{MONTHS_ES[month]} {year}</span>
                <button onClick={() => setMonth(Math.min(11, month + 1))} style={{ background: "none", border: 0, color: "var(--ink)", padding: 4 }}><Icon name="arrowRight" size={18} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: ".25rem", marginBottom: ".3rem" }}>
                {DAYS_ES.map((d) => <div key={d} style={{ textAlign: "center", fontSize: ".64rem", letterSpacing: ".06em", color: "var(--muted-2)", textTransform: "uppercase", padding: ".2rem 0" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: ".25rem" }}>
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />
                  const k = dk(d)
                  const disabled = isPast(d) || isSunday(d)
                  const sel = dateKey === k
                  return (
                    <button key={i} disabled={disabled} onClick={() => { setDateKey(k); setSlot(null) }} style={{
                      aspectRatio: "1", borderRadius: 9, border: sel ? "0" : "1px solid transparent",
                      background: sel ? "var(--gold-grad)" : disabled ? "transparent" : "rgba(255,255,255,0.03)",
                      color: sel ? "#1a1407" : disabled ? "var(--muted-2)" : "var(--ink)",
                      fontSize: ".82rem", fontWeight: sel ? 700 : 400, cursor: disabled ? "default" : "pointer",
                      opacity: disabled ? .35 : 1, transition: "all .15s",
                    }}>{d}</button>
                  )
                })}
              </div>
              <div style={{ marginTop: ".7rem", fontSize: ".7rem", color: "var(--muted-2)", textAlign: "center" }}>Domingos cerrado</div>
            </div>

            {dateKey && (
              <div className="animate-up" style={{ display: "grid", gap: ".8rem" }}>
                {Object.entries(SLOT_GROUPS).map(([grp, list]) => (
                  <div key={grp}>
                    <div style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: ".5rem" }}>{grp}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".4rem" }}>
                      {list.map((t) => {
                        const st = slotState(barberId, dateKey, t)
                        const taken = st !== "free"
                        const sel = slot === t
                        return (
                          <button key={t} disabled={taken} onClick={() => setSlot(t)} style={{
                            padding: ".55rem 0", borderRadius: 8, fontSize: ".8rem", fontWeight: sel ? 700 : 400,
                            border: sel ? "0" : "1px solid var(--hair-2)",
                            background: sel ? "var(--gold-grad)" : taken ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                            color: sel ? "#1a1407" : taken ? "var(--muted-2)" : "var(--ink)",
                            textDecoration: taken ? "line-through" : "none", cursor: taken ? "default" : "pointer",
                            opacity: taken ? .45 : 1, transition: "all .15s",
                          }}>{t}</button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3 — CONFIRMADO */}
        {step === 3 && (
          <div className="animate-scale" style={{ display: "grid", justifyItems: "center", gap: "1.1rem", textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: "var(--gold-grad)", display: "grid", placeItems: "center", color: "#1a1407", boxShadow: "var(--shadow-gold)" }}>
              <Icon name="check" size={40} stroke={2.4} />
            </div>
            <div>
              <h2 className="font-display" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>¡Reserva confirmada!</h2>
              <p style={{ margin: ".4rem 0 0", color: "var(--muted)", fontSize: ".9rem" }}>Te enviaremos un recordatorio por WhatsApp.</p>
            </div>
            <div className="card card-line" style={{ width: "100%", padding: "1.2rem", display: "grid", gap: ".7rem", textAlign: "left" }}>
              {[["Barbero", barber?.name], ["Servicio", service?.name], ["Fecha", dateKey && `${dateKey.split("-")[2]} ${MONTHS_ES[parseInt(dateKey.split("-")[1]) - 1]}`], ["Hora", `${slot} hrs`], ["Total", service && CLP(service.price)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>{k}</span>
                  <span className="font-display" style={{ fontWeight: 600, color: k === "Total" ? "var(--gold-lt)" : "var(--ink)" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: ".5rem", width: "100%" }}>
              <button className="btn btn-gold btn-block" onClick={() => navigate("/cuenta")}>Ver mis citas</button>
              <button className="btn btn-ghost btn-block" onClick={reset}>Reservar otra</button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: ".9rem 1.2rem 1.4rem", background: "linear-gradient(180deg, transparent, var(--bg) 30%)", display: "grid", gap: ".6rem" }}>
          {(barber || service) && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".8rem", color: "var(--muted)" }}>
              <span>{barber?.short}{service ? ` · ${service.name}` : ""}</span>
              {service && <span className="gold-text font-display" style={{ fontWeight: 700, fontSize: "1rem" }}>{CLP(service.price)}</span>}
            </div>
          )}
          <button className="btn btn-gold btn-block" disabled={!canNext || saving}
            onClick={step === 2 ? confirm : () => setStep(step + 1)}
            style={{ opacity: (canNext && !saving) ? 1 : .4, pointerEvents: (canNext && !saving) ? "auto" : "none" }}>
            {saving ? "Confirmando…" : (step === 2 ? "Confirmar reserva" : "Continuar")} {!saving && <Icon name="arrowRight" size={15} />}
          </button>
        </div>
      )}
    </MobileScreen>
  )
}
