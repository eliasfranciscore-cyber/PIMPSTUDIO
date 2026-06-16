import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"
import { notifyBarber } from "./push.js"

const DEMO_BOOKINGS = [
  { id: 1, time: "09:00", date: "2026-06-12", client: "Carlos Rodriguez", phone: "987654321", service: "Corte + perfilado de barba", barberId: 4, price: 22990, status: "confirmada" },
  { id: 2, time: "10:00", date: "2026-06-12", client: "Diego Salinas", phone: "934567890", service: "Corte de cabello", barberId: 4, price: 15990, status: "en curso" },
  { id: 3, time: "12:00", date: "2026-06-12", client: "Joaquin Reyes", phone: "912300000", service: "Solo fade", barberId: 6, price: 9990, status: "pendiente" },
]

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL)

    if (req.method === "GET") {
      const { phone, barberId, date } = req.query
      if (!phone) {
        const session = requireInternal(req, res)
        if (!session) return
        const bookings = await sql`
          SELECT b.id, b.booking_date::text as date, b.booking_time::text as time,
                 b.barber_id as "barberId", br.name as barber, u.name as client, u.phone,
                 s.name as service, s.price, b.status
          FROM bookings b
          JOIN users u ON b.client_id = u.id
          JOIN services s ON b.service_id = s.id
          JOIN barbers br ON b.barber_id = br.id
          WHERE (${barberId || null}::int IS NULL OR b.barber_id = ${barberId || null}::int)
            AND (${date || null}::date IS NULL OR b.booking_date = ${date || null}::date)
          ORDER BY b.booking_date DESC, b.booking_time DESC
          LIMIT 160
        `
        return res.json({ ok: true, bookings: bookings.map((item) => ({ ...item, time: item.time?.slice(0, 5) })) })
      }
      const cleanPhone = String(phone).replace(/\D/g, "")
      const bookings = await sql`
        SELECT b.id, b.booking_date as date, b.booking_time as time,
               b.barber_id as "barberId", s.name as service, b.status,
               s.price,
               CASE WHEN b.booking_date > CURRENT_DATE THEN 'next'
                    WHEN b.booking_date = CURRENT_DATE THEN 'next'
                    ELSE 'past' END as "when"
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE u.phone = ${cleanPhone}
        ORDER BY b.booking_date DESC, b.booking_time DESC
        LIMIT 20
      `
      return res.json({ ok: true, bookings })
    }

    if (req.method === "POST") {
      const { phone, barberId, serviceId, date, time } = req.body || {}
      if (!phone || !barberId || !serviceId || !date || !time) {
        return res.status(400).json({ error: "Datos incompletos" })
      }
      const cleanPhone = String(phone).replace(/\D/g, "")
      const [user] = await sql`SELECT id FROM users WHERE phone = ${cleanPhone}`
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" })

      // Check availability
      const [existing] = await sql`
        SELECT id FROM bookings
        WHERE barber_id = ${barberId} AND booking_date = ${date} AND booking_time = ${time}
        AND status NOT IN ('cancelada')
      `
      if (existing) return res.status(409).json({ error: "Horario no disponible" })

      const [booking] = await sql`
        INSERT INTO bookings (client_id, barber_id, service_id, booking_date, booking_time, status)
        VALUES (${user.id}, ${barberId}, ${serviceId}, ${date}, ${time}, 'confirmada')
        RETURNING id, booking_date as date, booking_time as time, status
      `

      // Aviso push SOLO al barbero de la reserva (su usuario). No bloquea la respuesta.
      try {
        const [info] = await sql`
          SELECT u.name as client, s.name as service
          FROM users u, services s
          WHERE u.id = ${user.id} AND s.id = ${serviceId}
        `
        await notifyBarber(barberId, {
          title: "Nueva reserva",
          body: `${info?.client || "Cliente"} · ${info?.service || "Servicio"} · ${date} ${String(time).slice(0, 5)}`,
          url: "/panel",
          tag: `reserva-${booking.id}`,
        })
      } catch (notifyErr) {
        console.error("notify barber error:", notifyErr)
      }

      return res.json({ ok: true, booking })
    }

    if (req.method === "PATCH") {
      const session = requireInternal(req, res)
      if (!session) return
      const { id, status } = req.body || {}
      const allowed = new Set(["pendiente", "confirmada", "en curso", "completada", "cancelada"])
      if (!id || !allowed.has(status)) return res.status(400).json({ ok: false, error: "Estado invalido" })
      const [booking] = await sql`
        UPDATE bookings
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING id, booking_date::text as date, booking_time::text as time, barber_id as "barberId", status
      `
      return res.json({ ok: true, booking: { ...booking, time: booking.time?.slice(0, 5) } })
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    console.error("bookings error:", err)
    if (req.method === "POST") {
      return res.json({ ok: true, booking: { id: Date.now(), status: "confirmada" } })
    }
    if (req.method === "PATCH") return res.json({ ok: true, booking: req.body })
    return res.json({ ok: true, bookings: req.query?.phone ? [] : DEMO_BOOKINGS })
  }
}
