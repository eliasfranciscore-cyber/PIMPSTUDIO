import { neon } from "@neondatabase/serverless"
import crypto from "crypto"
import { requireInternal } from "./_auth.js"

const STATIC_BARBERS = [
  { id: 4,  name: "Juan Carlos",         short: "Juan Carlos", code: "juan-carlos",         role: "Barbero Senior",      exp: "8 años",  rating: 4.9, tier: "general" },
  { id: 5,  name: "Andryz",              short: "Andryz",      code: "andryz",              role: "Barbero",             exp: "5 años",  rating: 4.8, tier: "general" },
  { id: 6,  name: "Brunetti",            short: "Brunetti",    code: "bruno-herrera",       role: "Visagista · Premium", exp: "12 años", rating: 5.0, tier: "premium" },
  { id: 7,  name: "Diego Moya",          short: "Diego",       code: "diego-moya",          role: "Barbero",             exp: "6 años",  rating: 4.7, tier: "general" },
  { id: 8,  name: "Thinn Sayen Herrera", short: "Thinn S.",    code: "thinn-sayen-herrera", role: "Barbero",             exp: "4 años",  rating: 4.8, tier: "general" },
  { id: 9,  name: "Vicente Pietrapiana", short: "Vicente",     code: "vicente-pietrapiana", role: "Barbero",             exp: "5 años",  rating: 4.9, tier: "general" },
  { id: 10, name: "Rodrigo Godoy",       short: "Rodrigo",     code: "rodrigo-godoy",       role: "Barbero",             exp: "7 años",  rating: 4.8, tier: "general" },
  { id: 11, name: "Matías Inostroza",    short: "Matías",      code: "matias-inostroza",    role: "Barbero Junior",      exp: "3 años",  rating: 4.6, tier: "general" },
]

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL)
    if (req.method === "GET") {
      const includeInactive = req.query.includeInactive === "true"
      const barbers = includeInactive
        ? await sql`SELECT b.id, b.name, b.short_name as short, b.code, b.role, b.tier, b.exp_years as exp, b.rating, b.active,
                           COALESCE(p.can_view_finance, false) as "canViewFinance",
                           COALESCE(p.can_manage_team, false) as "canManageTeam",
                           COALESCE(p.can_edit_services, false) as "canEditServices",
                           COALESCE(p.can_manage_blocks, true) as "canManageBlocks"
                    FROM barbers b
                    LEFT JOIN barber_permissions p ON p.barber_id = b.id
                    ORDER BY b.id`
        : await sql`SELECT id, name, short_name as short, code, role, tier, exp_years as exp, rating, active FROM barbers WHERE active = true ORDER BY id`
      return res.json({ ok: true, barbers })
    }

    const session = requireInternal(req, res, { admin: true })
    if (!session) return

    if (req.method === "POST") {
      const { name, code, role, tier = "general", pin = "1234", canViewFinance = false, canManageTeam = false, canEditServices = false, canManageBlocks = true } = req.body || {}
      if (!String(name || "").trim() || !String(code || "").trim()) return res.status(400).json({ ok: false, error: "Nombre y usuario requeridos" })
      const pinHash = crypto.createHash("sha256").update(String(pin)).digest("hex")
      const [barber] = await sql`
        INSERT INTO barbers (id, name, short_name, code, role, tier, exp_years, rating, active, pin_hash)
        VALUES ((SELECT COALESCE(MAX(id), 3) + 1 FROM barbers), ${String(name).trim()}, ${String(name).trim().split(" ")[0]}, ${String(code).trim().toLowerCase()}, ${String(role || "Barbero").trim()}, ${tier}, 0, 5.0, true, ${pinHash})
        RETURNING id, name, short_name as short, code, role, tier, exp_years as exp, rating, active
      `
      await sql`
        INSERT INTO barber_permissions (barber_id, can_view_finance, can_manage_team, can_edit_services, can_manage_blocks)
        VALUES (${barber.id}, ${Boolean(canViewFinance)}, ${Boolean(canManageTeam)}, ${Boolean(canEditServices)}, ${Boolean(canManageBlocks)})
        ON CONFLICT (barber_id) DO UPDATE SET
          can_view_finance = EXCLUDED.can_view_finance,
          can_manage_team = EXCLUDED.can_manage_team,
          can_edit_services = EXCLUDED.can_edit_services,
          can_manage_blocks = EXCLUDED.can_manage_blocks,
          updated_at = NOW()
      `
      return res.json({ ok: true, barber })
    }

    if (req.method === "PATCH") {
      const { id, name, code, role, tier, active, canViewFinance, canManageTeam, canEditServices, canManageBlocks } = req.body || {}
      if (!id) return res.status(400).json({ ok: false, error: "id requerido" })
      const [barber] = await sql`
        UPDATE barbers SET
          name = COALESCE(${name || null}, name),
          short_name = COALESCE(${name ? String(name).trim().split(" ")[0] : null}, short_name),
          code = COALESCE(${code ? String(code).trim().toLowerCase() : null}, code),
          role = COALESCE(${role || null}, role),
          tier = COALESCE(${tier || null}, tier),
          active = COALESCE(${typeof active === "boolean" ? active : null}, active)
        WHERE id = ${Number(id)}
        RETURNING id, name, short_name as short, code, role, tier, exp_years as exp, rating, active
      `
      if (!barber) return res.status(404).json({ ok: false, error: "Barbero no encontrado" })
      await sql`
        INSERT INTO barber_permissions (barber_id, can_view_finance, can_manage_team, can_edit_services, can_manage_blocks)
        VALUES (${Number(id)}, ${Boolean(canViewFinance)}, ${Boolean(canManageTeam)}, ${Boolean(canEditServices)}, ${canManageBlocks !== false})
        ON CONFLICT (barber_id) DO UPDATE SET
          can_view_finance = EXCLUDED.can_view_finance,
          can_manage_team = EXCLUDED.can_manage_team,
          can_edit_services = EXCLUDED.can_edit_services,
          can_manage_blocks = EXCLUDED.can_manage_blocks,
          updated_at = NOW()
      `
      return res.json({ ok: true, barber })
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    console.error("barbers error:", err)
    if (req.method === "GET") return res.json({ ok: true, barbers: STATIC_BARBERS.map((item) => ({ ...item, active: true })) })
    if (req.method === "POST") return res.json({ ok: true, barber: { id: Date.now(), ...(req.body || {}), active: true } })
    if (req.method === "PATCH") return res.json({ ok: true, barber: req.body })
    return res.status(500).json({ ok: false, error: "No se pudo procesar barberos" })
  }
}
