/* ================================================================
   Unified Fintoc API: checkout + webhook
   POST /api/fintoc-payments (checkout mode)
   POST /api/fintoc-payments?webhook=1 (webhook mode)
   ================================================================ */

import { neon } from '@neondatabase/serverless'
import { notifyAll } from './push.js'

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY

function cleanPhone(v) { return String(v || '').replace(/\D/g, '').slice(0, 9) }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Modo webhook (Fintoc notifica de pago completado)
  if (req.query.webhook === '1') {
    return handleWebhook(req, res)
  }

  // Modo checkout (usuario inicia pago)
  return handleCheckout(req, res)
}

/* ============================================================
   CHECKOUT: crear sesión de pago en Fintoc
   ============================================================ */
async function handleCheckout(req, res) {
  const { amount, email, name, phone } = req.body

  if (!amount || !email || !name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const key = process.env.FINTOC_SECRET_KEY
  if (!key) {
    console.error('FINTOC_SECRET_KEY missing. Available keys:', Object.keys(process.env).filter(k => k.includes('FINTOC')))
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    const response = await fetch('https://api.fintoc.com/v1/payments/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount)),
        currency: 'CLP',
        customer: {
          email,
          name,
          phone: phone.replace(/\D/g, ''),
        },
        metadata: {
          product: 'curso-brunetti',
          customer_email: email,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Fintoc API error:', error)
      return res.status(response.status).json({ error: error.message || 'Payment service error' })
    }

    const data = await response.json()
    return res.status(200).json({
      sessionUrl: data.session_url,
      sessionId: data.id,
    })
  } catch (err) {
    console.error('Fintoc checkout error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/* ============================================================
   WEBHOOK: Fintoc notifica de pago completado
   ============================================================ */
async function handleWebhook(req, res) {
  try {
    const { id, status, amount, customer, metadata } = req.body

    console.log('[WEBHOOK] Fintoc notificación:', {
      id,
      status,
      amount,
      customer: customer?.email,
    })

    // Validar que sea un pago completado
    if (status !== 'paid' && status !== 'completed') {
      console.log('[WEBHOOK] Pago no completado:', status)
      return res.status(200).json({ received: true })
    }

    // Guardar pago confirmado
    const payment = {
      id,
      timestamp: new Date().toISOString(),
      customer: customer?.email,
      name: customer?.name,
      amount,
      status,
      metadata,
    }

    console.log('[WEBHOOK] Pago confirmado:', payment)

    const name = String(customer?.name || '').trim()
    const phone = cleanPhone(customer?.phone)
    const email = String(customer?.email || '').trim().toLowerCase()

    if (!name || phone.length < 8 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('[WEBHOOK] Datos de cliente incompletos, no se registra inscripción:', { name, phone, email })
      return res.status(200).json({ received: true, paymentId: id, message: 'Pago registrado (sin datos de cliente válidos)' })
    }

    try {
      const sql = neon(process.env.DATABASE_URL)

      /* Auto-crear tabla si no existe (mismo esquema que api/enrollments.js) */
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

      /* 1) Guardar la inscripción: es lo que lee el panel interno. */
      const [row] = await sql`
        INSERT INTO enrollments (name, phone, email, source, message)
        VALUES (${name}, ${phone}, ${email}, 'cursos', ${`Pago Fintoc ${id} · $${amount}`})
        RETURNING id, created_at
      `

      /* 2) Crear/actualizar el cliente en `users` — best-effort. */
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

      /* 3) Push al panel interno avisando de la nueva inscripción pagada. */
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
      // Igual confirmamos recepción a Fintoc (200) para que no reintente indefinidamente,
      // pero dejamos constancia del fallo en logs para investigar.
      return res.status(200).json({ received: true, paymentId: id, error: 'No se pudo guardar la inscripción' })
    }
  } catch (err) {
    console.error('[WEBHOOK] Error:', err)
    return res.status(200).json({
      received: false,
      error: err.message,
    })
  }
}
