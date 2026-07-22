import React, { useEffect, useState } from 'react'
import { Icon } from './ui.jsx'

/* Panel de "reservas con problemas de sincronización": muestra los intentos
   de reserva del flujo público que quedaron rechazados o con error real en
   los últimos 7 días (ver api/_bookingAudit.js). Nace del incidente donde
   un cliente mostró un pantallazo de una reserva "confirmada" que nunca
   llegó a la base de datos, y no había manera de diagnosticarlo después de
   que los logs de Vercel rotaran. Silencioso cuando no hay nada que ver. */
export default function BookingSyncIssues() {
  const [issues, setIssues] = useState(null) // null = cargando/desconocido
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("ps_barber_token") || ""
    fetch("/api/bookings?issues=1", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => setIssues(data.issues || []))
      .catch(() => setIssues([]))
  }, [])

  if (!issues?.length || dismissed) return null

  const REASON_LABEL = {
    "horario no disponible": "el horario ya estaba tomado",
    "usuario no encontrado": "el teléfono no tenía cuenta creada",
    "anticipación insuficiente": "reservó con muy poca anticipación",
    "fuera de la ventana de reserva": "fuera de los días permitidos para reservar",
  }

  return (
    <div className="card animate-in" style={{ padding: "1rem", border: "1px solid rgba(217,154,143,.4)", background: "rgba(217,154,143,.08)", display: "grid", gap: ".6rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontWeight: 600, fontSize: ".85rem", color: "#c94b3a" }}>
          <Icon name="bell" size={16} />
          {issues.length} intento{issues.length === 1 ? "" : "s"} de reserva con problemas (últimos 7 días)
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissed(true)} style={{ fontSize: ".65rem", padding: ".3rem .6rem" }}>Ocultar</button>
      </div>
      <div style={{ display: "grid", gap: ".4rem", maxHeight: 220, overflowY: "auto" }}>
        {issues.slice(0, 20).map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", fontSize: ".76rem", padding: ".4rem .5rem", borderRadius: 8, background: "var(--fill-soft)" }}>
            <span>
              <b>{it.date || "?"}</b> {it.time ? String(it.time).slice(0, 5) : ""} · tel. {it.phone || "?"}
              {it.outcome === "error" && <span style={{ color: "#c94b3a", marginLeft: ".4rem" }}>· error real, no se guardó</span>}
            </span>
            <span style={{ color: "var(--muted)", textAlign: "right", flexShrink: 0 }}>
              {REASON_LABEL[it.reason] || it.reason || "motivo desconocido"}
            </span>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: ".68rem", color: "var(--muted)" }}>
        Los rechazos normales (horario ya tomado, etc.) no son un bug — pero si un cliente dice que reservó y no le aparece, revisa acá antes que nada.
      </p>
    </div>
  )
}
