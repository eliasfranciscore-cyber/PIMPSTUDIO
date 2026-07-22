/* PIMP STUDIO — Rate limiting simple sobre Postgres (Neon).
   ------------------------------------------------------------------
   Vercel ejecuta cada función serverless sin estado compartido entre
   invocaciones, así que un contador en memoria no sirve para limitar
   nada entre requests reales. Usamos la misma base de datos que ya
   tiene el proyecto en vez de sumar un servicio nuevo (Upstash/Redis) —
   a esta escala, una tabla con un UPSERT atómico por ventana fija
   alcanza de sobra.

   Si el rate limiter mismo falla (tabla bloqueada, DB caída), se abre
   en vez de cerrar: nunca debe ser la causa de que una reserva real no
   se pueda hacer — sería el mismo tipo de bug que ya corregimos hoy,
   aplicado al propio mecanismo de protección. */

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"]
  if (fwd) return String(fwd).split(",")[0].trim()
  return req.socket?.remoteAddress || "unknown"
}

/* Devuelve true si la request puede seguir, false si se pasó del límite.
   `key` debe incluir el nombre del endpoint (ej. "bookings-post:1.2.3.4")
   para que los límites de distintas rutas no se mezclen entre sí. */
export async function rateLimit(sql, key, { max = 20, windowSeconds = 60 } = {}) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key          TEXT PRIMARY KEY,
        count        INTEGER NOT NULL DEFAULT 1,
        window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    const [row] = await sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, NOW())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < NOW() - (${windowSeconds} || ' seconds')::interval THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < NOW() - (${windowSeconds} || ' seconds')::interval THEN NOW()
          ELSE rate_limits.window_start
        END
      RETURNING count
    `
    return row.count <= max
  } catch (err) {
    console.error("rateLimit error (fail-open):", err)
    return true
  }
}
