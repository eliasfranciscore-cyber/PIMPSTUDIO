import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { username, pin } = req.body || {}
  if (!username || !pin) return res.status(400).json({ error: "Usuario y PIN requeridos" })

  try {
    const sql = neon(process.env.DATABASE_URL)
    const pinHash = crypto.createHash("sha256").update(pin).digest("hex")
    const [barber] = await sql`
      SELECT id, name, code, role, tier FROM barbers
      WHERE (code = ${username.toLowerCase()} OR name ILIKE ${username})
      AND pin_hash = ${pinHash} AND active = true
    `
    if (!barber) return res.status(401).json({ error: "Credenciales incorrectas" })
    return res.json({ ok: true, barber })
  } catch (err) {
    console.error("auth-barber error:", err)
    // Demo fallback: PIN 1234 works for any username
    if (pin === "1234") {
      return res.json({ ok: true, barber: { name: username, role: "Barbero", tier: "general" } })
    }
    return res.status(401).json({ error: "Credenciales incorrectas" })
  }
}
