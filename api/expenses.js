import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"

const DEMO_EXPENSES = [
  { id: 1, date: "2026-06-03", category: "Insumos", detail: "Cera, navajas y peines", amount: 145000, owner: "Brunetti" },
  { id: 2, date: "2026-06-05", category: "Marketing", detail: "Campana Instagram", amount: 85000, owner: "Brunetti" },
  { id: 3, date: "2026-06-08", category: "Arriendo", detail: "Local Monumento 1750", amount: 620000, owner: "Administracion" },
]

function validateExpense(body = {}) {
  const date = String(body.date || "").slice(0, 10)
  const category = String(body.category || "").trim()
  const detail = String(body.detail || "").trim()
  const amount = Number(body.amount || 0)
  const owner = String(body.owner || "Brunetti").trim()
  if (!date) return { error: "Fecha requerida" }
  if (!category) return { error: "Categoria requerida" }
  if (!detail) return { error: "Detalle requerido" }
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Monto invalido" }
  return { date, category, detail, amount: Math.round(amount), owner }
}

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL)
    const session = requireInternal(req, res, { admin: true })
    if (!session) return

    if (req.method === "GET") {
      const expenses = await sql`
        SELECT id, expense_date::text as date, category, detail, amount, owner
        FROM expenses
        ORDER BY expense_date DESC, id DESC
        LIMIT 120
      `
      return res.json({ ok: true, expenses })
    }

    if (req.method === "POST") {
      const payload = validateExpense(req.body)
      if (payload.error) return res.status(400).json({ ok: false, error: payload.error })
      const [expense] = await sql`
        INSERT INTO expenses (expense_date, category, detail, amount, owner)
        VALUES (${payload.date}, ${payload.category}, ${payload.detail}, ${payload.amount}, ${payload.owner})
        RETURNING id, expense_date::text as date, category, detail, amount, owner
      `
      return res.json({ ok: true, expense })
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" })
  } catch (err) {
    console.error("expenses error:", err)
    const session = requireInternal(req, res, { admin: true })
    if (!session) return
    if (req.method === "GET") return res.json({ ok: true, expenses: DEMO_EXPENSES })
    if (req.method === "POST") {
      const payload = validateExpense(req.body)
      if (payload.error) return res.status(400).json({ ok: false, error: payload.error })
      return res.json({ ok: true, expense: { id: Date.now(), ...payload } })
    }
    return res.status(500).json({ ok: false, error: "No se pudo procesar gastos" })
  }
}
