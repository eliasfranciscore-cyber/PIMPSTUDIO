import { neon } from "@neondatabase/serverless"

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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })
  try {
    const sql = neon(process.env.DATABASE_URL)
    const barbers = await sql`SELECT id, name, code, role, tier, exp_years as exp, rating FROM barbers WHERE active = true ORDER BY id`
    return res.json({ ok: true, barbers })
  } catch {
    return res.json({ ok: true, barbers: STATIC_BARBERS })
  }
}
