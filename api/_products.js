/* ================================================================
   Catálogo de productos del módulo "Essentials" (tienda de clientes).
   No es una función serverless propia: Vercel Hobby tope 12 funciones,
   así que api/services.js delega aquí cuando ?scope=shop (igual patrón
   que push.js absorbió el cron de recordatorios).
   ================================================================ */

import { neon } from "@neondatabase/serverless"
import { put } from "@vercel/blob"
import { requireInternal } from "./_auth.js"

const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Polera Barber Club",
    brand: "Barber Club",
    description: "Ven y sé parte del Club usando Polera Boxy Fit con estilo streetwear.",
    price: 19990,
    oldPrice: null,
    stock: 10,
    active: true,
    sortOrder: 0,
    imgFront: "/assets/products/polera-barber-club-1.png",
    imgBack: "/assets/products/polera-barber-club-2.png",
    imgDetail: "/assets/products/polera-barber-club-3.png",
  },
]

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(200) NOT NULL,
      brand       VARCHAR(120) DEFAULT '',
      description TEXT         DEFAULT '',
      price       INTEGER      NOT NULL,
      old_price   INTEGER,
      stock       INTEGER      NOT NULL DEFAULT 0,
      active      BOOLEAN      NOT NULL DEFAULT true,
      sort_order  INTEGER      NOT NULL DEFAULT 0,
      img_front   TEXT,
      img_back    TEXT,
      img_detail  TEXT,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `
}

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || "",
    description: row.description || "",
    price: row.price,
    oldPrice: row.old_price,
    stock: row.stock,
    active: row.active,
    sortOrder: row.sort_order,
    imgFront: row.img_front,
    imgBack: row.img_back,
    imgDetail: row.img_detail,
  }
}

export async function handleProducts(req, res) {
  // Verifica sesión ANTES de tocar la base de datos: si esto viviera dentro
  // del try/catch de más abajo, una caída de la DB (o DATABASE_URL ausente)
  // saltaría directo al fallback de demo sin haber validado nada, dejando
  // ver la lista completa (incluyendo ocultos) a cualquiera sin sesión.
  const includeInactive = req.method === "GET" && req.query.includeInactive === "true"
  if (includeInactive) {
    const session = requireInternal(req, res)
    if (!session) return
  } else if (req.method !== "GET") {
    const session = requireInternal(req, res, { admin: true })
    if (!session) return
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    await ensureTable(sql)

    if (req.method === "GET") {
      const rows = includeInactive
        ? await sql`SELECT * FROM products ORDER BY sort_order, id`
        : await sql`SELECT * FROM products WHERE active = true AND stock > 0 ORDER BY sort_order, id`
      return res.json({ ok: true, products: rows.map(toClient) })
    }

    if (req.method === "POST") {
      if (req.query.upload === "1") return uploadImage(req, res, sql)

      const { name, brand, description, price, oldPrice, stock } = req.body || {}
      if (!String(name || "").trim() || !Number.isFinite(Number(price))) {
        return res.status(400).json({ ok: false, error: "Datos incompletos" })
      }
      const [row] = await sql`
        INSERT INTO products (name, brand, description, price, old_price, stock, active, sort_order)
        VALUES (
          ${String(name).trim()}, ${String(brand || "").trim()}, ${String(description || "").trim()},
          ${Number(price)}, ${oldPrice ? Number(oldPrice) : null}, ${Number(stock) || 0}, true,
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM products)
        )
        RETURNING *
      `
      return res.json({ ok: true, product: toClient(row) })
    }

    if (req.method === "PATCH") {
      if (req.body?.reorder && Array.isArray(req.body.order)) {
        const order = req.body.order.map(Number).filter(Number.isFinite)
        for (let i = 0; i < order.length; i++) {
          await sql`UPDATE products SET sort_order = ${i}, updated_at = NOW() WHERE id = ${order[i]}`
        }
        return res.json({ ok: true })
      }

      const { id, name, brand, description, price, oldPrice, stock, active } = req.body || {}
      if (!id) return res.status(400).json({ ok: false, error: "id requerido" })
      const [row] = await sql`
        UPDATE products SET
          name        = COALESCE(${name ?? null}, name),
          brand       = COALESCE(${brand ?? null}, brand),
          description = COALESCE(${description ?? null}, description),
          price       = COALESCE(${price != null ? Number(price) : null}, price),
          old_price   = ${oldPrice !== undefined ? (oldPrice ? Number(oldPrice) : null) : sql`old_price`},
          stock       = COALESCE(${stock != null ? Number(stock) : null}, stock),
          active      = COALESCE(${typeof active === "boolean" ? active : null}, active),
          updated_at  = NOW()
        WHERE id = ${Number(id)}
        RETURNING *
      `
      return res.json({ ok: true, product: row ? toClient(row) : null })
    }

    if (req.method === "DELETE") {
      const id = Number(req.query.id || (req.body || {}).id)
      if (!id) return res.status(400).json({ ok: false, error: "id requerido" })
      await sql`DELETE FROM products WHERE id = ${id}`
      return res.json({ ok: true })
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    console.error("products error:", err)
    if (req.method === "GET") {
      const list = includeInactive ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.active && p.stock > 0)
      return res.json({ ok: true, products: list })
    }
    // La sesión ya se validó arriba antes del try; llegar aquí es un error real de DB.
    return res.status(500).json({ ok: false, error: "No se pudo procesar productos" })
  }
}

/* Sube una foto de producto a Vercel Blob y guarda la URL en la columna
   correspondiente (front = portada, back = hover, detail = dentro del modal). */
async function uploadImage(req, res, sql) {
  const { id, slot, dataUrl } = req.body || {}
  if (!id || !["front", "back", "detail"].includes(slot) || !dataUrl) {
    return res.status(400).json({ ok: false, error: "Datos incompletos" })
  }
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/.exec(dataUrl)
  if (!match) return res.status(400).json({ ok: false, error: "Formato de imagen no soportado" })

  const [, mime, base64] = match
  const buffer = Buffer.from(base64, "base64")
  if (buffer.length > 8 * 1024 * 1024) {
    return res.status(400).json({ ok: false, error: "Imagen muy pesada (máx. 8MB)" })
  }

  const ext = mime === "image/jpeg" || mime === "image/jpg" ? "jpg" : mime.split("/")[1]
  const blob = await put(`products/${id}-${slot}-${Date.now()}.${ext}`, buffer, {
    access: "public",
    contentType: mime,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  const [row] = slot === "front"
    ? await sql`UPDATE products SET img_front = ${blob.url}, updated_at = NOW() WHERE id = ${Number(id)} RETURNING *`
    : slot === "back"
    ? await sql`UPDATE products SET img_back = ${blob.url}, updated_at = NOW() WHERE id = ${Number(id)} RETURNING *`
    : await sql`UPDATE products SET img_detail = ${blob.url}, updated_at = NOW() WHERE id = ${Number(id)} RETURNING *`

  return res.json({ ok: true, url: blob.url, product: row ? toClient(row) : null })
}
