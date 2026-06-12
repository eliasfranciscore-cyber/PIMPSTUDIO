import crypto from "crypto"

const SECRET = process.env.PS_SESSION_SECRET || process.env.ADMIN_API_TOKEN || "pimpstudio-demo-secret"

function b64url(input) {
  return Buffer.from(input).toString("base64url")
}

function sign(payload) {
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
  }))
  return `${body}.${sign(body)}`
}

export function readSession(req) {
  const header = req.headers.authorization || req.headers.Authorization || ""
  const token = String(header).replace(/^Bearer\s+/i, "")
  if (!token || !token.includes(".")) return null
  const [body, mac] = token.split(".")
  if (sign(body) !== mac) return null
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    if (!session?.name) return null
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
