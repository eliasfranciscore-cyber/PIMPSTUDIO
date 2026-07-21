import { neon } from "@neondatabase/serverless"
import { rateLimit, clientIp } from "./_rateLimit.js"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { phone, name, email, mode } = req.body || {}
  if (!phone) return res.status(400).json({ error: "Teléfono requerido" })

  const cleanPhone = String(phone).replace(/\D/g, "")
  if (cleanPhone.length !== 9) return res.status(400).json({ error: "Teléfono inválido" })

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Sin esto, este endpoint es un oráculo de enumeración: probar teléfonos
    // al azar en modo login revela si están registrados (y su nombre).
    const allowed = await rateLimit(sql, `auth-login:${clientIp(req)}`, { max: 15, windowSeconds: 300 })
    if (!allowed) return res.status(429).json({ error: "Demasiados intentos. Intenta de nuevo en unos minutos." })

    if (mode === "register") {
      if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" })
      const [user] = await sql`
        INSERT INTO users (phone, name, email)
        VALUES (${cleanPhone}, ${name.trim()}, ${email?.trim() || null})
        ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, email = COALESCE(EXCLUDED.email, users.email)
        RETURNING id, phone, name, email
      `
      return res.json({ ok: true, user })
    } else {
      // El front (Login.jsx) no lee el email de esta respuesta — no hace
      // falta devolverlo a quien solo escribió un número de teléfono.
      const [user] = await sql`SELECT id, phone, name FROM users WHERE phone = ${cleanPhone}`
      if (!user) return res.status(404).json({ error: "Número no registrado. Crea una cuenta primero." })
      return res.json({ ok: true, user })
    }
  } catch (err) {
    console.error("auth-login error:", err)
    if (mode === "register") {
      if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" })
      return res.json({ ok: true, user: { phone: cleanPhone, name: name.trim(), email: email || "" } })
    }
    const demo = {
      "987654321": { phone: "987654321", name: "Carlos Rodriguez", email: "carlos@ejemplo.com" },
      "912345678": { phone: "912345678", name: "Maria Gonzalez", email: "maria@ejemplo.com" },
    }[cleanPhone]
    if (!demo) return res.status(404).json({ error: "Numero no registrado. Crea una cuenta primero." })
    return res.json({ ok: true, user: demo })
  }
}
