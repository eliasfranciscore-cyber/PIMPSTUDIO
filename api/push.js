import { neon } from "@neondatabase/serverless"
import { requireInternal } from "./_auth.js"

/* PIMP STUDIO — Suscripciones Web Push (por barbero)
   ------------------------------------------------------------------
   POST   (sesión interna): guarda la suscripción del barbero autenticado.
   DELETE (sesión interna): elimina una suscripción por endpoint.
   notifyBarber(barberId, payload): envía un push SOLO al barbero indicado.

   Requiere claves VAPID en variables de entorno para enviar:
     VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
   y el paquete 'web-push'. Si faltan, las funciones degradan sin romper. */

let webpushModule = null
async function getWebPush() {
  if (webpushModule) return webpushModule
  try {
    const mod = await import("web-push")
    const webpush = mod.default || mod
    const pub = process.env.VAPID_PUBLIC_KEY
    const priv = process.env.VAPID_PRIVATE_KEY
    if (pub && priv) {
      webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contacto@brunetticutz.cl", pub, priv)
      webpushModule = webpush
      return webpush
    }
    console.error("getWebPush: VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY ausentes")
  } catch (err) {
    console.error("getWebPush import error:", err?.message)
  }
  return null
}

export async function notifyBarber(barberId, payload) {
  if (!barberId) return { ok: false, sent: 0 }
  const webpush = await getWebPush()
  if (!webpush) return { ok: false, sent: 0, reason: "push-not-configured" }
  try {
    const sql = neon(process.env.DATABASE_URL)
    const subs = await sql`
      SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE barber_id = ${Number(barberId)}
    `
    let sent = 0
    await Promise.all(subs.map(async (s) => {
      const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        sent++
      } catch (err) {
        // Suscripción caducada/expirada: limpiarla.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE id = ${s.id}`.catch(() => {})
        } else {
          console.error("notifyBarber sendNotification error:", err?.statusCode, err?.body || err?.message)
        }
      }
    }))
    return { ok: true, sent }
  } catch (err) {
    console.error("notifyBarber error:", err)
    return { ok: false, sent: 0 }
  }
}

/* Envía un push a TODAS las suscripciones registradas. Útil para avisos que no
   son de un barbero concreto (p. ej. inscripciones a Cursos/Workshop). En el
   modo "solo Brunetti" todas las suscripciones son del equipo de Bruno. */
export async function notifyAll(payload) {
  const webpush = await getWebPush()
  if (!webpush) return { ok: false, sent: 0, reason: "push-not-configured" }
  try {
    const sql = neon(process.env.DATABASE_URL)
    const subs = await sql`SELECT id, endpoint, p256dh, auth FROM push_subscriptions`
    let sent = 0
    await Promise.all(subs.map(async (s) => {
      const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        sent++
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE id = ${s.id}`.catch(() => {})
        } else {
          console.error("notifyAll sendNotification error:", err?.statusCode, err?.body || err?.message)
        }
      }
    }))
    return { ok: true, sent }
  } catch (err) {
    console.error("notifyAll error:", err)
    return { ok: false, sent: 0 }
  }
}

export default async function handler(req, res) {
  const session = requireInternal(req, res)
  if (!session) return

  try {
    const sql = neon(process.env.DATABASE_URL)

    if (req.method === "POST") {
      const { subscription } = req.body || {}
      const endpoint = subscription?.endpoint
      const p256dh = subscription?.keys?.p256dh
      const auth = subscription?.keys?.auth
      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ ok: false, error: "Suscripción inválida" })
      }
      // Auto-crear la tabla si no existe (primera vez en una DB nueva), igual
      // que enrollments. Sin FK a barbers para no fallar si esa tabla aún no está.
      await sql`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id         SERIAL PRIMARY KEY,
          barber_id  INTEGER,
          endpoint   TEXT UNIQUE NOT NULL,
          p256dh     TEXT NOT NULL,
          auth       TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      // Cada barbero solo registra suscripciones para SU usuario (id de sesión).
      const barberId = session.id
      await sql`
        INSERT INTO push_subscriptions (barber_id, endpoint, p256dh, auth)
        VALUES (${Number(barberId)}, ${endpoint}, ${p256dh}, ${auth})
        ON CONFLICT (endpoint) DO UPDATE SET barber_id = EXCLUDED.barber_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
      `
      return res.json({ ok: true })
    }

    if (req.method === "DELETE") {
      const { endpoint } = req.body || {}
      if (!endpoint) return res.status(400).json({ ok: false, error: "endpoint requerido" })
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND barber_id = ${Number(session.id)}`
      return res.json({ ok: true })
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" })
  } catch (err) {
    console.error("push error:", err)
    // No bloquear la UI por errores de almacenamiento del push.
    return res.json({ ok: true, degraded: true })
  }
}
