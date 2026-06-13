import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Icon, MobileScreen } from '../components/ui.jsx'
import { GlareCard } from '../components/GlareCard.jsx'
import { BARBERS, SERVICES, SERVICE_BARBERS, SLOT_GROUPS, DAYS_ES, MONTHS_ES, slotState, barberById, CLP, tne } from '../data.js'

const ALL_BOOKING_SLOTS = Object.values(SLOT_GROUPS).flat()

function localBlockKey(barberId, date, slot) {
  return `${barberId}|${date}|${slot}`
}

function readLocalBlocks() {
  try { return JSON.parse(localStorage.getItem("ps_availability_blocks") || "{}") } catch { return {} }
}

export default function Booking() {
  const navigate = useNavigate()
  const [barbers, setBarbers] = useState(BARBERS)
  const [services, setServices] = useState(SERVICES)
  const [availableSlots, setAvailableSlots] = useState([])
  const [step, setStep] = useState(0)
  const [barberId, setBarberId] = useState(null)
  const [serviceId, setServiceId] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())
  const [dateKey, setDateKey] = useState(null)
  const [slot, setSlot] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("ps_user")
    if (!user) navigate("/login")
    fetch("/api/barbers").then((r) => r.json()).then((data) => { if (data.barbers?.length) setBarbers(data.barbers) }).catch(() => {})
    fetch("/api/services").then((r) => r.json()).then((data) => { if (data.services?.length) setServices(data.services.filter((item) => item.active !== false)) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!barberId || !dateKey) { setAvailableSlots([]); return }
    fetch(`/api/availability?barberId=${barberId}&date=${dateKey}`)
      .then((r) => r.headers.get("content-type")?.includes("application/json") ? r.json() : Promise.reject(new Error("api unavailable")))
      .then((data) => {
        const localBlocks = readLocalBlocks()
        const slots = (data.slots?.length ? data.slots : ALL_BOOKING_SLOTS.map((slot) => ({ slot, available: true }))).map((item) => {
          if (localBlocks[localBlockKey(barberId, dateKey, item.slot)]) return { ...item, available: false, state: "blocked" }
          return item
        })
        setAvailableSlots(slots)
      })
      .catch(() => {
        const localBlocks = readLocalBlocks()
        setAvailableSlots(ALL_BOOKING_SLOTS.map((slot) => ({ slot, available: !localBlocks[localBlockKey(barberId, dateKey, slot)] })))
      })
  }, [barberId, dateKey])

  const barber = barbers.find((b) => b.id === barberId) || barberById(barberId)
  const service = services.find((s) => s.id === serviceId)
  const allowedServices = barberId ? services.filter((s) => SERVICE_BARBERS[barberId] ? SERVICE_BARBERS[barberId].includes(s.id) : true) : []
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

      <div className="booking-shell" style={{ padding: "0 1.2rem 5rem", display: "grid", gap: ".8rem", maxWidth: "1000px", margin: "0 auto" }}>
        {/* PASO 0 — BARBERO */}
        {step === 0 && (
          <div className="animate-in" style={{ display: "grid", gap: ".8rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0", fontSize: "1.05rem" }}>Elige tu barbero</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: ".6rem" }}>
              {barbers.map((b) => (
                <GlareCard
                  key={b.id}
                  as="button"
                  type="button"
                  onClick={() => { setBarberId(b.id); setServiceId(null) }}
                  style={{
                    border: barberId === b.id ? "2px solid var(--gold-line)" : "1px solid rgba(255,255,255,0.1)",
                    padding: ".8rem",
                    display: "grid",
                    gap: ".4rem",
                    cursor: "pointer",
                    placeItems: "center",
                    textAlign: "center",
                    background: barberId === b.id ? "linear-gradient(135deg, rgba(214, 188, 70, 0.15), rgba(214, 188, 70, 0.05))" : "rgba(0,0,0,0.3)",
                    transition: "all .2s",
                    borderRadius: "12px",
                    width: "100%",
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--hair-2)", background: "var(--panel)" }}>
                    <img src="/assets/pimp-studio-logo.jpg" alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                  </div>
                  <div style={{ display: "grid", gap: ".2rem", width: "100%" }}>
                    <div className="font-display" style={{ fontWeight: 600, fontSize: ".9rem", display: "flex", alignItems: "center", gap: ".3rem", justifyContent: "center" }}>{b.name} {b.tier === "premium" && <Icon name="star" size={10} color="var(--gold)" />}</div>
                  </div>
                </GlareCard>
              ))}
            </div>
          </div>
        )}

        {/* PASO 1 — SERVICIO */}
        {step === 1 && (
          <div className="animate-in" style={{ display: "grid", gap: ".8rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0", fontSize: "1.05rem" }}>Servicio con {barber?.short}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".6rem" }}>
              {allowedServices.map((s) => (
                <GlareCard
                  key={s.id}
                  as="button"
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  style={{
                    border: serviceId === s.id ? "2px solid var(--gold-line)" : "1px solid rgba(255,255,255,0.1)",
                    padding: ".7rem",
                    display: "grid",
                    gap: ".3rem",
                    cursor: "pointer",
                    textAlign: "center",
                    background: serviceId === s.id ? "linear-gradient(135deg, rgba(214, 188, 70, 0.15), rgba(214, 188, 70, 0.05))" : "rgba(0,0,0,0.3)",
                    transition: "all .2s",
                    borderRadius: "12px",
                    width: "100%",
                  }}
                >
                  <span className="font-display" style={{ fontWeight: 600, fontSize: ".85rem" }}>{s.name}</span>
                  <span className="font-display gold-text" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{CLP(s.price)}</span>
                  <div style={{ display: "flex", gap: ".3rem", color: "var(--muted)", fontSize: ".7rem", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="clock" size={12} /> {s.min} min
                  </div>
                </GlareCard>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 — FECHA + HORA */}
        {step === 2 && (
          <div className="animate-in" style={{ display: "grid", gap: ".8rem" }}>
            <h3 className="font-display" style={{ margin: ".2rem 0", fontSize: "1.05rem" }}>Elige fecha y hora</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: ".8rem", alignItems: "start" }}>
              {/* CALENDARIO COMPACTO */}
              <div className="card" style={{ padding: ".7rem", display: "grid", gap: ".5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".3rem" }}>
                  <span className="font-display" style={{ fontWeight: 600, fontSize: ".85rem", letterSpacing: ".02em" }}>{MONTHS_ES[month]}</span>
                  <button onClick={() => setMonth(Math.min(11, month + 1))} style={{ background: "none", border: 0, color: "var(--gold-lt)", padding: 2 }}><Icon name="arrowRight" size={16} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: ".2rem", marginBottom: ".3rem" }}>
                  {DAYS_ES.map((d) => <div key={d} style={{ textAlign: "center", fontSize: ".5rem", letterSpacing: ".04em", color: "var(--muted-2)", textTransform: "uppercase", padding: ".1rem 0" }}>{d[0]}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: ".2rem" }}>
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} />
                    const k = dk(d)
                    const disabled = isPast(d) || isSunday(d)
                    const sel = dateKey === k
                    return (
                      <button key={i} disabled={disabled} onClick={() => { setDateKey(k); setSlot(null) }} style={{
                        aspectRatio: "1", borderRadius: 6, border: sel ? "0" : "1px solid transparent",
                        background: sel ? "var(--gold-grad)" : disabled ? "transparent" : "rgba(255,255,255,0.03)",
                        color: sel ? "#1a1407" : disabled ? "var(--muted-2)" : "var(--ink)",
                        fontSize: ".65rem", fontWeight: sel ? 700 : 400, cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? .35 : 1, transition: "all .15s", padding: 0
                      }}>{d}</button>
                    )
                  })}
                </div>
                <div style={{ fontSize: ".6rem", color: "var(--muted-2)", textAlign: "center", marginTop: ".3rem" }}>Dom cerrado</div>
              </div>

              {/* HORAS DISPONIBLES */}
              {dateKey && (
                <div className="animate-up" style={{ display: "grid", gap: ".6rem" }}>
                  {Object.entries(SLOT_GROUPS).map(([grp, list]) => (
                    <div key={grp}>
                      <div style={{ fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: ".4rem", fontWeight: 600 }}>{grp}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".3rem" }}>
                        {list.map((t) => {
                          const fromApi = availableSlots.find((item) => item.slot === t)
                          const st = fromApi ? (fromApi.available ? "free" : "booked") : slotState(barberId, dateKey, t)
                          const taken = st !== "free"
                          const sel = slot === t
                          return (
                            <button key={t} disabled={taken} onClick={() => setSlot(t)} style={{
                              padding: ".4rem 0", borderRadius: 6, fontSize: ".7rem", fontWeight: sel ? 700 : 400,
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
          </div>
        )}

        {/* PASO 3 — CONFIRMADO */}
        {step === 3 && (
          <div className="animate-scale" style={{ display: "grid", justifyItems: "center", gap: ".7rem", textAlign: "center", padding: "1rem 0", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ width: 60, height: 60, borderRadius: 999, background: "var(--gold-grad)", display: "grid", placeItems: "center", color: "#1a1407", boxShadow: "var(--shadow-gold)" }}>
              <Icon name="check" size={32} stroke={2.4} />
            </div>
            <div>
              <h2 className="font-display" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>¡Reserva confirmada!</h2>
              <p style={{ margin: ".3rem 0 0", color: "var(--muted)", fontSize: ".8rem" }}>Te enviaremos un recordatorio por WhatsApp.</p>
            </div>
            <div className="card card-line" style={{ width: "100%", padding: ".8rem", display: "grid", gap: ".5rem", textAlign: "left", fontSize: ".8rem" }}>
              {[["Barbero", barber?.name], ["Servicio", service?.name], ["Fecha", dateKey && `${dateKey.split("-")[2]} ${MONTHS_ES[parseInt(dateKey.split("-")[1]) - 1]}`], ["Hora", `${slot} hrs`], ["Total", service && CLP(service.price)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", fontSize: ".75rem" }}>{k}</span>
                  <span className="font-display" style={{ fontWeight: 600, fontSize: ".85rem", color: k === "Total" ? "var(--gold-lt)" : "var(--ink)" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".4rem", width: "100%" }}>
              <button className="btn btn-gold" style={{ padding: ".4rem .6rem", fontSize: ".7rem" }} onClick={() => navigate("/cuenta")}>Ver citas</button>
              <button className="btn btn-ghost" style={{ padding: ".4rem .6rem", fontSize: ".7rem" }} onClick={reset}>Reservar otra</button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: ".7rem 1.2rem 1.2rem", background: "linear-gradient(180deg, transparent, var(--bg) 30%)", display: "flex", gap: ".6rem", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "1000px", margin: "0 auto", right: 0, left: 0 }}>
          {(barber || service) && (
            <div style={{ display: "flex", flexDirection: "column", gap: ".3rem", fontSize: ".7rem", color: "var(--muted)", flex: 1 }}>
              <span>{barber?.short}{service ? ` · ${service.name}` : ""}</span>
              {service && <span className="gold-text font-display" style={{ fontWeight: 700, fontSize: ".85rem" }}>{CLP(service.price)}</span>}
            </div>
          )}
          <button className="btn btn-gold" disabled={!canNext || saving}
            onClick={step === 2 ? confirm : () => setStep(step + 1)}
            style={{ opacity: (canNext && !saving) ? 1 : .4, pointerEvents: (canNext && !saving) ? "auto" : "none", padding: ".45rem .8rem", fontSize: ".7rem", flexShrink: 0, whiteSpace: "nowrap" }}>
            {saving ? "Confirmando…" : (step === 2 ? "Confirmar" : "Continuar")} {!saving && <Icon name="arrowRight" size={12} />}
          </button>
        </div>
      )}
    </MobileScreen>
  )
}
