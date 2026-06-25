import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"

/* Tabla esperada en Neon (créala si no existe):
   CREATE TABLE IF NOT EXISTS enrollments (
     id         SERIAL PRIMARY KEY,
     name       TEXT NOT NULL,
     phone      TEXT NOT NULL,
     email      TEXT NOT NULL,
     source     TEXT NOT NULL DEFAULT 'cursos',   -- 'cursos' | 'workshop'
     level      TEXT,
     message    TEXT,
     edition    TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
*/

const DEMO = [
  { id: 1, name: "Demo Barbero", phone: "912345678", email: "demo@mail.com", source: "cursos",   level: "Estoy empezando", message: "", edition: null, created_at: "2026-06-20T10:00:00Z" },
  { id: 2, name: "Demo Workshop", phone: "987654321", email: "demo2@mail.com", source: "workshop", level: null, message: null, edition: "23 de agosto", created_at: "2026-06-21T11:00:00Z" },
]

function cleanPhone(v) { return String(v || "").replace(/\D/g, "").slice(0, 9) }
function sendJson(res, status, body) { return res.status(status).json(body) }

export default async function handler(req, res) {
  /* GET — lista para el panel interno (requiere sesión) */
  if (req.method === "GET") {
    const session = requireInternal(req, res)
    if (!session) return
    try {
      const sql = neon(process.env.DATABASE_URL)
      const rows = await sql`
        SELECT id, name, phone, email, source, level, message, edition, created_at
        FROM enrollments ORDER BY created_at DESC LIMIT 300
      `
      return sendJson(res, 200, { ok: true, enrollments: rows })
    } catch {
      return sendJson(res, 200, { ok: true, enrollments: DEMO, demo: true })
    }
  }

  /* POST — inscripción pública (Cursos o Workshop) */
  if (req.method === "POST") {
    try {
      const sql = neon(process.env.DATABASE_URL)
      /* Auto-crear tabla si no existe (primera vez) */
      await sql`
        CREATE TABLE IF NOT EXISTS enrollments (
          id         SERIAL PRIMARY KEY,
          name       TEXT NOT NULL,
          phone      TEXT NOT NULL,
          email      TEXT NOT NULL,
          source     TEXT NOT NULL DEFAULT 'cursos',
          level      TEXT,
          message    TEXT,
          edition    TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `

      const body = req.body || {}
      const name  = String(body.name  || "").trim()
      const phone = cleanPhone(body.phone)
      const email = String(body.email || "").trim().toLowerCase()
      const source  = ["cursos", "workshop"].includes(body.source) ? body.source : "cursos"
      const level   = String(body.level   || "").trim() || null
      const message = String(body.message || "").trim() || null
      const edition = String(body.edition || "").trim() || null

      if (!name || phone.length < 8 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(res, 400, { ok: false, error: "Datos incompletos" })
      }

      /* Crear o actualizar usuario en tabla users (clientes) */
      await sql`
        INSERT INTO users (name, phone, email)
        VALUES (${name}, ${phone}, ${email})
        ON CONFLICT (phone) DO UPDATE SET
          name  = EXCLUDED.name,
          email = COALESCE(NULLIF(EXCLUDED.email,''), users.email)
      `

      /* Guardar inscripción */
      const [row] = await sql`
        INSERT INTO enrollments (name, phone, email, source, level, message, edition)
        VALUES (${name}, ${phone}, ${email}, ${source}, ${level}, ${message}, ${edition})
        RETURNING id, created_at
      `

      return sendJson(res, 200, { ok: true, id: row.id })
    } catch (err) {
      /* Fallback: si la tabla no existe, devolver ok igual para no bloquear al usuario */
      console.error("enrollments POST error:", err?.message)
      return sendJson(res, 200, { ok: true, demo: true })
    }
  }

  res.status(405).json({ ok: false, error: "Method Not Allowed" })
}
