/* ================================================================
   Unified Flow API: checkout + confirmación (webhook) + retorno
   POST /api/flow-payments                 (checkout: crea sesión de pago)
   POST /api/flow-payments?webhook=1        (Flow confirma pago, server-to-server)
   POST /api/flow-payments?return=1         (navegador vuelve tras pagar)
   GET  /api/flow-payments?status=1&token=  (frontend consulta estado, solo lectura)
   ================================================================ */

import crypto from 'crypto'
import { neon } from '@neondatabase/serverless'
import { notifyAll } from './push.js'

const FLOW_API_BASE = process.env.FLOW_ENV === 'production'
  ? 'https://www.flow.cl/api'
  : 'https://sandbox.flow.cl/api'

function cleanPhone(v) { return String(v || '').replace(/\D/g, '').slice(0, 9) }

function signParams(params, secret) {
  const keys = Object.keys(params).filter((k) => k !== 's').sort()
  const toSign = keys.map((k) => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', secret).update(toSign).digest('hex')
}

function siteOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

async function flowRequest(path, method, params) {
  const apiKey = process.env.FLOW_API_KEY
  const secret = process.env.FLOW_SECRET_KEY
  if (!apiKey || !secret) {
    throw new Error('FLOW_API_KEY / FLOW_SECRET_KEY no configuradas')
  }

  const signed = { ...params, apiKey, s: '' }
  signed.s = signParams(signed, secret)

  if (method === 'GET') {
    const qs = new URLSearchParams(signed).toString()
    const response = await fetch(`${FLOW_API_BASE}${path}?${qs}`)
    const data = await response.json()
    if (!response.ok) throw Object.assign(new Error(data.message || 'Flow API error'), { status: response.status, data })
    return data
  }

  const response = await fetch(`${FLOW_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(signed).toString(),
  })
  const data = await response.json()
  if (!response.ok) throw Object.assign(new Error(data.message || 'Flow API error'), { status: response.status, data })
  return data
}

export default async function handler(req, res) {
  if (req.query.status === '1') return handleStatus(req, res)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.query.webhook === '1') return handleWebhook(req, res)
  if (req.query.return === '1') return handleReturn(req, res)
  return handleCheckout(req, res)
}

/* ============================================================
   CHECKOUT: crear sesión de pago en Flow
   ============================================================ */
async function handleCheckout(req, res) {
  const { amount, email, name, phone } = req.body

  if (!amount || !email || !name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!process.env.FLOW_API_KEY || !process.env.FLOW_SECRET_KEY) {
    console.error('FLOW_API_KEY / FLOW_SECRET_KEY missing.')
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  const origin = siteOrigin(req)
  const commerceOrder = `curso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  try {
    const data = await flowRequest('/payment/create', 'POST', {
      commerceOrder,
      subject: 'Curso Brunetti · Visagismo & Barbería',
      currency: 'CLP',
      amount: Math.round(parseFloat(amount)),
      email,
      urlConfirmation: `${origin}/api/flow-payments?webhook=1`,
      urlReturn: `${origin}/api/flow-payments?return=1`,
      optional: JSON.stringify({ name, phone: phone.replace(/\D/g, '') }),
    })

    return res.status(200).json({
      sessionUrl: `${data.url}?token=${data.token}`,
      token: data.token,
    })
  } catch (err) {
    console.error('Flow checkout error:', err.data || err.message)
    return res.status(err.status || 500).json({ error: err.message || 'Payment service error' })
  }
}

/* ============================================================
   STATUS: consulta de solo lectura para la UI (no escribe DB)
   ============================================================ */
async function handleStatus(req, res) {
  const token = req.query.token
  if (!token) return res.status(400).json({ error: 'Missing token' })

  try {
    const data = await flowRequest('/payment/getStatus', 'GET', { token })
    return res.status(200).json({
      status: data.status, // 1 pendiente, 2 pagado, 3 rechazado, 4 anulado
      paid: data.status === 2,
      amount: data.amount,
    })
  } catch (err) {
    console.error('Flow status error:', err.data || err.message)
    return res.status(err.status || 500).json({ error: err.message || 'Payment service error' })
  }
}

/* ============================================================
   RETURN: el navegador vuelve tras pagar (Flow hace POST con `token`)
   Solo redirige a la SPA con el token en query string; la confirmación
   real (guardar inscripción) ocurre en handleWebhook.
   ============================================================ */
async function handleReturn(req, res) {
  const token = req.body?.token
  const origin = siteOrigin(req)
  res.writeHead(302, { Location: `${origin}/cursos?flow_token=${encodeURIComponent(token || '')}` })
  return res.end()
}

/* ============================================================
   WEBHOOK: Flow notifica de pago (server-to-server), confirmamos
   el estado real vía getStatus antes de guardar nada.
   ============================================================ */
async function handleWebhook(req, res) {
  const token = req.body?.token
  if (!token) {
    console.error('[WEBHOOK] Sin token en notificación de Flow')
    return res.status(200).json({ received: true })
  }

  try {
    const data = await flowRequest('/payment/getStatus', 'GET', { token })

    console.log('[WEBHOOK] Flow notificación:', {
      flowOrder: data.flowOrder,
      commerceOrder: data.commerceOrder,
      status: data.status,
      amount: data.amount,
    })

    if (data.status !== 2) {
      console.log('[WEBHOOK] Pago no completado, status:', data.status)
      return res.status(200).json({ received: true })
    }

    const id = String(data.flowOrder)
    const amount = data.amount
    let optional = {}
    try { optional = JSON.parse(data.optional || '{}') } catch { /* optional puede venir vacío */ }

    const name = String(optional.name || '').trim()
    const phone = cleanPhone(optional.phone)
    const email = String(data.payer || '').trim().toLowerCase()

    if (!name || phone.length < 8 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('[WEBHOOK] Datos de cliente incompletos, no se registra inscripción:', { name, phone, email })
      return res.status(200).json({ received: true, paymentId: id, message: 'Pago registrado (sin datos de cliente válidos)' })
    }

    try {
      const sql = neon(process.env.DATABASE_URL)

      await sql`
        CREATE TABLE IF NOT EXISTS enrollments (
          id         SERIAL PRIMARY KEY,
          name       TEXT NOT NULL,
          phone      TEXT NOT NULL,
          email      TEXT NOT NULL,
          source     TEXT NOT NULL DEFAULT 'cursos',
          level      TEXT,
          message    TEXT,
          edition    TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `

      /* Idempotencia: Flow puede reintentar el webhook, no dupliquemos la inscripción. */
      const [existing] = await sql`
        SELECT id FROM enrollments WHERE message LIKE ${`%Pago Flow ${id}%`} LIMIT 1
      `
      if (existing) {
        return res.status(200).json({ received: true, paymentId: id, enrollmentId: existing.id, message: 'Pago ya registrado' })
      }

      const [row] = await sql`
        INSERT INTO enrollments (name, phone, email, source, message)
        VALUES (${name}, ${phone}, ${email}, 'cursos', ${`Pago Flow ${id} · $${amount}`})
        RETURNING id, created_at
      `

      try {
        await sql`
          INSERT INTO users (name, phone, email, updated_at)
          VALUES (${name}, ${phone}, ${email}, NOW())
          ON CONFLICT (phone) DO UPDATE SET
            name  = EXCLUDED.name,
            email = COALESCE(NULLIF(EXCLUDED.email,''), users.email),
            updated_at = NOW()
        `
      } catch (uerr) {
        console.error('[WEBHOOK] users upsert (no bloquea):', uerr?.message)
      }

      try {
        await notifyAll({
          title: 'Nueva inscripción · Curso (pagado)',
          body: `${name} · ${phone} · $${amount}`,
          url: '/panel',
          tag: `inscripcion-${row.id}`,
        })
      } catch (nerr) {
        console.error('[WEBHOOK] notify (no bloquea):', nerr?.message)
      }

      return res.status(200).json({
        received: true,
        paymentId: id,
        enrollmentId: row.id,
        message: 'Pago e inscripción registrados',
      })
    } catch (dbErr) {
      console.error('[WEBHOOK] Error guardando inscripción:', dbErr?.message)
      return res.status(200).json({ received: true, paymentId: id, error: 'No se pudo guardar la inscripción' })
    }
  } catch (err) {
    console.error('[WEBHOOK] Error:', err.data || err.message)
    return res.status(200).json({ received: false, error: err.message })
  }
}
