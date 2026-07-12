/* PIMP STUDIO — Correos transaccionales vía Resend (API REST directa, sin SDK)
   ------------------------------------------------------------------
   sendBookingConfirmationEmail(...): avisa al cliente que su reserva quedó
   confirmada. Requiere RESEND_API_KEY; si falta o el cliente no dejó email,
   degrada sin romper el flujo de reserva (mismo patrón que notifyBarber en
   push.js). */

const RESEND_API_URL = "https://api.resend.com/emails"
const SITE_URL = process.env.SITE_URL || "https://brunetticutz.cl"
const LOGO_URL = `${SITE_URL}/assets/brunetti-hero-wordmark.webp`
const WORKSHOP_LOGO_URL = `${SITE_URL}/assets/brunetti-workshop-wordmark.webp`

async function sendViaResend({ to, subject, html }) {
  if (!to) return { ok: false, reason: "no-email" }
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("sendViaResend: RESEND_API_KEY ausente")
    return { ok: false, reason: "email-not-configured" }
  }
  const from = process.env.RESEND_FROM || "Brunetticutz <reservas@brunetticutz.cl>"
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      console.error("sendViaResend: Resend respondió", response.status, errText)
      return { ok: false, reason: "resend-error" }
    }
    return { ok: true }
  } catch (err) {
    console.error("sendViaResend error:", err?.message)
    return { ok: false, reason: "network-error" }
  }
}

function formatCLP(price) {
  if (price == null) return null
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(price)
}

function formatDate(dateStr) {
  try {
    return new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", weekday: "long", day: "numeric", month: "long" }).format(new Date(`${dateStr}T00:00:00`))
  } catch {
    return dateStr
  }
}

export async function sendBookingConfirmationEmail({ to, name, service, barber, date, time, price }) {
  const prettyDate = formatDate(date)
  const prettyTime = String(time || "").slice(0, 5)
  const prettyPrice = formatCLP(price)

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; background: #f7f3ea; padding: 32px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e0d1;">
        <div style="background: #16130f; padding: 24px; text-align: center;">
          <img src="${LOGO_URL}" alt="Brunetticutz" width="220" style="width: 220px; max-width: 70%; height: auto; display: inline-block;" />
        </div>
        <div style="padding: 28px 24px;">
          <h1 style="margin: 0 0 4px; font-size: 20px; color: #1c1a17;">¡Reserva confirmada${name ? `, ${name}` : ""}!</h1>
          <p style="margin: 0 0 20px; color: #4a453d; font-size: 14px;">Te esperamos en Brunetticutz. Estos son los detalles de tu hora:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1c1a17;">
            <tr><td style="padding: 6px 0; color: #8a847d;">Servicio</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${service || "-"}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a847d;">Barbero</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${barber || "-"}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a847d;">Fecha</td><td style="padding: 6px 0; text-align: right; font-weight: 600; text-transform: capitalize;">${prettyDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a847d;">Hora</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${prettyTime}</td></tr>
            ${prettyPrice ? `<tr><td style="padding: 6px 0; color: #8a847d;">Precio</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${prettyPrice}</td></tr>` : ""}
          </table>
          <div style="text-align: center; margin: 26px 0 6px;">
            <a href="${SITE_URL}/cuenta" style="display: inline-block; background: #d9b158; color: #1c1a17; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 999px;">Ver o gestionar mi reserva</a>
          </div>
          <p style="margin: 14px 0 0; color: #8a847d; font-size: 12px; text-align: center;">Puedes cancelar o cambiar la hora desde ahí, con al menos 10 horas de anticipación.</p>
        </div>
      </div>
    </div>
  `.trim()

  return sendViaResend({ to, subject: "Tu reserva en Brunetticutz está confirmada", html })
}

export async function sendWorkshopConfirmationEmail({ to, name, edition }) {
  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; background: #f4f0f9; padding: 32px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e6dcf2;">
        <div style="background: #17111f; padding: 24px; text-align: center;">
          <img src="${WORKSHOP_LOGO_URL}" alt="Brunetticutz" width="220" style="width: 220px; max-width: 70%; height: auto; display: inline-block;" />
        </div>
        <div style="padding: 28px 24px;">
          <h1 style="margin: 0 0 4px; font-size: 20px; color: #211a2b;">¡Cupo confirmado${name ? `, ${name}` : ""}!</h1>
          <p style="margin: 0 0 20px; color: #4a4353; font-size: 14px;">Quedaste inscrito en el Workshop de Brunetticutz. Sin pago en este paso — coordinamos el resto por WhatsApp.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #211a2b;">
            <tr><td style="padding: 6px 0; color: #8a80a0;">Edición</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${edition || "-"}</td></tr>
          </table>
          <p style="margin: 22px 0 0; color: #8a80a0; font-size: 12px; text-align: center;">Te vamos a escribir por WhatsApp con los detalles finales antes de la fecha.</p>
        </div>
      </div>
    </div>
  `.trim()

  return sendViaResend({ to, subject: "Tu cupo en el Workshop de Brunetticutz está confirmado", html })
}
