import { neon } from "@neondatabase/serverless"

const STATIC_SERVICES = [
  { id: 5,  name: "Asesoría de corte",              price: 24990, min: 90,  cat: "general",  tne: true,  desc: "Consulta profesional para encontrar tu estilo ideal." },
  { id: 6,  name: "Corte de cabello",               price: 15990, min: 60,  cat: "general",  tne: true,  desc: "Corte profesional con técnicas modernas y clásicas." },
  { id: 7,  name: "Corte + perfilado de barba",     price: 22990, min: 75,  cat: "general",  tne: true,  desc: "Servicio completo de corte y arreglo de barba." },
  { id: 8,  name: "Perfilado de barba",             price: 11990, min: 45,  cat: "general",  tne: true,  desc: "Perfilado y arreglo profesional de barba." },
  { id: 9,  name: "Solo fade",                      price: 9990,  min: 40,  cat: "general",  tne: true,  desc: "Degradado perfecto y limpio." },
  { id: 10, name: "Asesoría de Imagen · Visagista", price: 39990, min: 120, cat: "premium",  tne: false, desc: "Consulta personalizada según tu fisonomía." },
  { id: 11, name: "Corte de cabello",               price: 19990, min: 60,  cat: "premium",  tne: false, desc: "Corte de precisión con técnicas avanzadas." },
  { id: 12, name: "Corte de cabello y barba",       price: 29990, min: 90,  cat: "premium",  tne: false, desc: "Servicio premium completo de corte y barba." },
  { id: 13, name: "Ondulación permanente",          price: 65990, min: 180, cat: "quimico",  tne: false, desc: "Forma y textura duradera al cabello." },
  { id: 14, name: "Platinado Global",               price: 89990, min: 240, cat: "quimico",  tne: false, desc: "Decoloración completa para un rubio platino." },
  { id: 15, name: "Visos Platinados",               price: 74990, min: 210, cat: "quimico",  tne: false, desc: "Mechas platinadas para un look sofisticado." },
]

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })
  try {
    const sql = neon(process.env.DATABASE_URL)
    const services = await sql`SELECT id, name, price, duration_min as min, category as cat, tne_eligible as tne, description as desc FROM services WHERE active = true ORDER BY id`
    return res.json({ ok: true, services })
  } catch {
    return res.json({ ok: true, services: STATIC_SERVICES })
  }
}
