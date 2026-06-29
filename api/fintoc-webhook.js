/* ================================================================
   Webhook: Fintoc confirma pagos completados
   POST /api/fintoc-webhook
   Fintoc envía notificación cuando un pago se completa exitosamente
   ================================================================ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    // TODO: Guardar en DB (Vercel KV, Supabase, MongoDB, etc)
    // Por ahora solo loguear
    console.log('[WEBHOOK] Pago confirmado:', payment)

    // TODO: Enviar email al usuario con link de Skool
    // Ejemplo con Resend:
    // await resend.emails.send({
    //   from: 'noreply@brunetti.cl',
    //   to: customer.email,
    //   subject: '✓ Acceso al Curso Brunetti',
    //   html: `Hola ${customer.name}, tu pago de $${amount} fue confirmado.
    //          Accede aquí: https://www.skool.com/brunetti-academy-2840/classroom`
    // })

    // TODO: Notificar al admin (Telegram, email, Slack, etc)
    console.log(`[NOTIFICACIÓN] Nuevo pago: ${customer.name} - $${amount} CLP`)

    return res.status(200).json({
      received: true,
      paymentId: id,
      message: 'Pago registrado y confirmado',
    })
  } catch (err) {
    console.error('[WEBHOOK] Error:', err)
    // Siempre retornar 200 a Fintoc (evita reintentos)
    return res.status(200).json({
      received: false,
      error: err.message,
    })
  }
}
