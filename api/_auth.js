import crypto from "crypto"

/* Secreto de firma de sesiones internas. SIN respaldo público: si no hay un
   secreto fuerte configurado (PS_SESSION_SECRET o ADMIN_API_TOKEN, ≥16 chars),
   el sistema falla CERRADO — no firma ni acepta ninguna sesión. Esto evita que
   un token pueda forjarse con un secreto conocido del repositorio.
   Configurar en producción: `vercel env add PS_SESSION_SECRET`. */
const SECRET = process.env.PS_SESSION_SECRET || process.env.ADMIN_API_TOKEN || ""
const HAS_SECRET = SECRET.length >= 16
// Los tokens firmados nunca caducaban (se guardaba iat pero nunca se
// validaba). Un token robado o compartido por error quedaba válido para
// siempre. 30 días alcanza para uso normal en el celular del barbero
// (PWA instalada) sin forzar logins frecuentes.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
if (!HAS_SECRET && process.env.NODE_ENV === "production") {
  console.error("[_auth] PS_SESSION_SECRET no configurado: las sesiones internas se rechazarán.")
}

function b64url(input) {
  return Buffer.from(input).toString("base64url")
}

function sign(payload) {
  if (!HAS_SECRET) return null
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")
}

export function createSession(barber) {
  const body = b64url(JSON.stringify({
    id: barber.id || null,
    name: barber.name,
    code: barber.code || "",
    role: barber.role || "Barbero",
    tier: barber.tier || "general",
    admin: Boolean(barber.admin) || /brunetti|bruno|admin/i.test(`${barber.name || ""} ${barber.code || ""} ${barber.role || ""}`),
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  }))
  const mac = sign(body)
  if (!mac) return null
  return `${body}.${mac}`
}

export function readSession(req) {
  const header = req.headers.authorization || req.headers.Authorization || ""
  const token = String(header).replace(/^Bearer\s+/i, "")
  if (!token || !token.includes(".")) return null
  const [body, mac] = token.split(".")
  const expected = sign(body)
  // Falla cerrado: sin secreto (expected === null) no se acepta ninguna sesión.
  if (!expected || expected !== mac) return null
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    if (!session?.name) return null
    // Tokens emitidos antes de agregar `exp` no lo traen: se aceptan sin
    // caducidad (no queremos desloguear a todo el mundo de golpe al
    // desplegar esto). Todo login nuevo desde ahora sí expira.
    if (session.exp && Date.now() > session.exp) return null
    return session
  } catch {
    return null
  }
}

export function requireInternal(req, res, options = {}) {
  const session = readSession(req)
  if (!session) {
    res.status(401).json({ ok: false, error: "Sesion interna requerida" })
    return null
  }
  if (options.admin && !session.admin) {
    res.status(403).json({ ok: false, error: "Permiso de administrador requerido" })
    return null
  }
  return session
}
