import { neon } from "@neondatabase/serverless"

const ALL_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","14:00","15:00","16:00","17:00","18:00","18:30","19:00","19:30"]

export default async function handler(req, res) {
  const { barberId, date } = req.query
  if (!barberId || !date) return res.status(400).json({ error: "barberId y date requeridos" })

  try {
    const sql = neon(process.env.DATABASE_URL)
    const booked = await sql`
      SELECT booking_time::text as slot FROM bookings
      WHERE barber_id = ${barberId} AND booking_date = ${date} AND status NOT IN ('cancelada')
    `
    const blocked = await sql`
      SELECT slot_time::text as slot FROM availability_blocks
      WHERE barber_id = ${barberId} AND block_date = ${date}
    `
    const unavailable = new Set([...booked.map(r => r.slot?.slice(0,5)), ...blocked.map(r => r.slot?.slice(0,5))])
    const slots = ALL_SLOTS.map(s => ({ slot: s, available: !unavailable.has(s) }))
    return res.json({ ok: true, slots })
  } catch (err) {
    console.error("availability error:", err)
    return res.json({ ok: true, slots: ALL_SLOTS.map(s => ({ slot: s, available: true })) })
  }
}
