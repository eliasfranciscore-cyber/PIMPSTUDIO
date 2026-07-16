import { neon } from "@neondatabase/serverless"
import { notifyBarber } from "./push.js"

const BUSINESS_TZ = "America/Santiago"

/* PIMP STUDIO — Recordatorios push de reservas (60min y 15min antes)
   ------------------------------------------------------------------
   Pensado para correr cada 5 minutos vía cron (Vercel Cron u otro disparador
   externo — ver vercel.json). Protegido con CRON_SECRET si está seteado:
   el llamador debe enviar Authorization: Bearer <CRON_SECRET>.

   La ventana de +55/+65 y +10/+20 minutos absorbe el margen entre disparos
   del cron para no perder reservas si el cron corre unos minutos tarde.

   `column` viene siempre de una lista fija interna (nunca de input externo),
   así que se arma el texto del SQL directamente — el driver de Neon no
   soporta interpolar nombres de columna como parámetro. */

async function sendDueReminders(sql, { column, label, fromMin, toMin }) {
  const rows = await sql(
    `SELECT b.id, b.barber_id as "barberId", u.name as client,
            COALESCE(b.custom_service, s.name) as service,
            b.booking_date::text as date, b.booking_time::text as time
     FROM bookings b
     JOIN users u ON b.client_id = u.id
     LEFT JOIN services s ON b.service_id = s.id
     WHERE b.status NOT IN ('cancelada', 'completada')
       AND b.${column} = false
       AND ((b.booking_date + b.booking_time) AT TIME ZONE $1)
           BETWEEN (NOW() + ($2 || ' minutes')::interval)
               AND (NOW() + ($3 || ' minutes')::interval)`,
    [BUSINESS_TZ, String(fromMin), String(toMin)]
  )
  if (!rows.length) return 0

  await Promise.all(rows.map((b) =>
    notifyBarber(b.barberId, {
      title: `Turno en ${label}`,
      body: `${b.client || "Cliente"} · ${b.service || "Servicio"} · ${String(b.time).slice(0, 5)}`,
      url: "/panel",
      tag: `recordatorio-${column}-${b.id}`,
    }).catch((err) => console.error(`notifyBarber (${label}) error:`, err))
  ))

  const ids = rows.map((b) => b.id)
  await sql(`UPDATE bookings SET ${column} = true WHERE id = ANY($1)`, [ids])
  return rows.length
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.authorization || ""
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: "unauthorized" })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    const sent60 = await sendDueReminders(sql, { column: "reminder_60_sent", label: "1 hora", fromMin: 55, toMin: 65 })
    const sent15 = await sendDueReminders(sql, { column: "reminder_15_sent", label: "15 minutos", fromMin: 10, toMin: 20 })
    return res.json({ ok: true, sent60, sent15 })
  } catch (err) {
    console.error("cron-reminders error:", err)
    return res.status(500).json({ ok: false, error: "reminder job failed" })
  }
}
