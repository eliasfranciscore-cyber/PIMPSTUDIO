import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"

const ALL_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","14:00","15:00","16:00","17:00","18:00","18:30","19:00","19:30"]

export default async function handler(req, res) {
  const source = req.method === "GET" ? req.query : (req.body || {})
  const { barberId, date, slot, reason } = source
  if (!barberId || !date) return res.status(400).json({ error: "barberId y date requeridos" })

  try {
    const sql = neon(process.env.DATABASE_URL)
    if (req.method === "POST") {
      const session = requireInternal(req, res)
      if (!session) return
      if (!slot) return res.status(400).json({ ok: false, error: "slot requerido" })
      const [block] = await sql`
        INSERT INTO availability_blocks (barber_id, block_date, slot_time, reason)
        VALUES (${Number(barberId)}, ${date}, ${slot}, ${reason || "Bloqueado desde panel"})
        ON CONFLICT (barber_id, block_date, slot_time) DO UPDATE SET reason = EXCLUDED.reason
        RETURNING id, barber_id as "barberId", block_date::text as date, slot_time::text as slot, reason
      `
      return res.json({ ok: true, block: { ...block, slot: block.slot?.slice(0, 5) } })
    }

    if (req.method === "DELETE") {
      const session = requireInternal(req, res)
      if (!session) return
      if (!slot) return res.status(400).json({ ok: false, error: "slot requerido" })
      await sql`
        DELETE FROM availability_blocks
        WHERE barber_id = ${Number(barberId)} AND block_date = ${date} AND slot_time = ${slot}
      `
      return res.json({ ok: true })
    }

    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

    const booked = await sql`
      SELECT booking_time::text as slot FROM bookings
      WHERE barber_id = ${barberId} AND booking_date = ${date} AND status NOT IN ('cancelada')
    `
    const blocked = await sql`
      SELECT slot_time::text as slot FROM availability_blocks
      WHERE barber_id = ${barberId} AND block_date = ${date}
    `
    const bookedSet = new Set(booked.map(r => r.slot?.slice(0,5)))
    const blockedSet = new Set(blocked.map(r => r.slot?.slice(0,5)))
    const unavailable = new Set([...bookedSet, ...blockedSet])
    const slots = ALL_SLOTS.map(s => ({
      slot: s,
      available: !unavailable.has(s),
      state: bookedSet.has(s) ? "booked" : blockedSet.has(s) ? "blocked" : "free",
    }))
    return res.json({ ok: true, slots })
  } catch (err) {
    console.error("availability error:", err)
    if (req.method === "POST") return res.json({ ok: true, block: { id: Date.now(), barberId, date, slot, reason } })
    if (req.method === "DELETE") return res.json({ ok: true })
    return res.json({ ok: true, slots: ALL_SLOTS.map(s => ({ slot: s, available: true })) })
  }
}
