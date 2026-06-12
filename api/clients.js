import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"

const DEMO_CLIENTS = [
  { id: 1, name: "Carlos Rodriguez", phone: "987654321", email: "carlos@ejemplo.com", visits: 4, totalSpent: 68960, lastVisit: "2026-05-22", status: "activo" },
  { id: 2, name: "Maria Gonzalez", phone: "912345678", email: "maria@ejemplo.com", visits: 2, totalSpent: 55980, lastVisit: "2026-06-04", status: "activo" },
  { id: 3, name: "Pedro Soto", phone: "956789012", email: "pedro@ejemplo.com", visits: 1, totalSpent: 9990, lastVisit: "2026-06-09", status: "nuevo" },
]

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 9)
}

function validateClient(body = {}) {
  const name = String(body.name || "").trim()
  const phone = cleanPhone(body.phone)
  const email = String(body.email || "").trim().toLowerCase()
  if (!name) return { error: "Nombre requerido" }
  if (phone.length !== 9) return { error: "El telefono debe tener 9 digitos" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Correo invalido" }
  return { name, phone, email }
}

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL)

    if (req.method === "GET") {
      const phone = cleanPhone(req.query.phone)
      if (phone) {
        const [client] = await sql`
          SELECT u.id, u.name, u.phone, u.email,
                 COUNT(b.id)::int as visits,
                 COALESCE(SUM(CASE WHEN b.status = 'completada' THEN s.price ELSE 0 END), 0)::int as "totalSpent",
                 MAX(b.booking_date)::text as "lastVisit",
                 CASE WHEN COUNT(b.id) > 0 THEN 'activo' ELSE 'nuevo' END as status
          FROM users u
          LEFT JOIN bookings b ON b.client_id = u.id
          LEFT JOIN services s ON s.id = b.service_id
          WHERE u.phone = ${phone}
          GROUP BY u.id
        `
        if (!client) return res.status(404).json({ ok: false, error: "Cliente no registrado" })
        return res.json({ ok: true, client })
      }

      const session = requireInternal(req, res)
      if (!session) return
      const clients = await sql`
        SELECT u.id, u.name, u.phone, u.email,
               COUNT(b.id)::int as visits,
               COALESCE(SUM(CASE WHEN b.status = 'completada' THEN s.price ELSE 0 END), 0)::int as "totalSpent",
               MAX(b.booking_date)::text as "lastVisit",
               CASE WHEN COUNT(b.id) > 0 THEN 'activo' ELSE 'nuevo' END as status
        FROM users u
        LEFT JOIN bookings b ON b.client_id = u.id
        LEFT JOIN services s ON s.id = b.service_id
        GROUP BY u.id
        ORDER BY MAX(u.updated_at) DESC NULLS LAST, u.id DESC
        LIMIT 100
      `
      return res.json({ ok: true, clients })
    }

    if (req.method === "POST") {
      const payload = validateClient(req.body)
      if (payload.error) return res.status(400).json({ ok: false, error: payload.error })
      const [client] = await sql`
        INSERT INTO users (name, phone, email, updated_at)
        VALUES (${payload.name}, ${payload.phone}, ${payload.email}, NOW())
        ON CONFLICT (phone) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = NOW()
        RETURNING id, name, phone, email
      `
      return res.json({ ok: true, client: { ...client, visits: 0, totalSpent: 0, status: "nuevo" } })
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" })
  } catch (err) {
    console.error("clients error:", err)
    if (req.method === "GET") {
      const phone = cleanPhone(req.query.phone)
      if (phone) {
        const client = DEMO_CLIENTS.find((item) => item.phone === phone)
        if (!client) return res.status(404).json({ ok: false, error: "Cliente no registrado" })
        return res.json({ ok: true, client })
      }
      const session = requireInternal(req, res)
      if (!session) return
      return res.json({ ok: true, clients: DEMO_CLIENTS })
    }
    if (req.method === "POST") {
      const payload = validateClient(req.body)
      if (payload.error) return res.status(400).json({ ok: false, error: payload.error })
      return res.json({ ok: true, client: { id: Date.now(), ...payload, visits: 0, totalSpent: 0, status: "nuevo" } })
    }
    return res.status(500).json({ ok: false, error: "No se pudo procesar clientes" })
  }
}
