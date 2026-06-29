/* ================================================================
   Unified Fintoc API: checkout + webhook
   POST /api/fintoc-payments (checkout mode)
   POST /api/fintoc-payments?webhook=1 (webhook mode)
   ================================================================ */

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY

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

  if (!FINTOC_SECRET_KEY) {
    console.error('FINTOC_SECRET_KEY not configured')
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    const response = await fetch('https://api.fintoc.com/v1/payments/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FINTOC_SECRET_KEY}`,
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

    // TODO: Guardar en DB (Vercel KV, Supabase, MongoDB, etc)
    // TODO: Enviar email al usuario
    // TODO: Notificar al admin (Slack, Telegram, etc)

    return res.status(200).json({
      received: true,
      paymentId: id,
      message: 'Pago registrado',
    })
  } catch (err) {
    console.error('[WEBHOOK] Error:', err)
    return res.status(200).json({
      received: false,
      error: err.message,
    })
  }
}
