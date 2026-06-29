/* ================================================================
   Serverless: crear sesión de pago en Fintoc
   POST /api/fintoc-checkout
   Body: { amount, email, name, phone }
   Response: { sessionUrl, sessionId }
   ================================================================ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, email, name, phone } = req.body

  if (!amount || !email || !name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const secretKey = process.env.FINTOC_SECRET_KEY

  if (!secretKey) {
    console.error('FINTOC_SECRET_KEY not configured in Vercel')
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    // Crear sesión de pago en Fintoc
    // Ref: https://docs.fintoc.com/v1/reference/payments#crear-sesión-de-pago
    const response = await fetch('https://api.fintoc.com/v1/payments/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount)), // en centavos CLP
        currency: 'CLP',
        customer: {
          email,
          name,
          phone: phone.replace(/\D/g, ''),
        },
        // Metadatos para rastrear la inscripción al curso
        metadata: {
          product: 'curso-brunetti',
          customer_email: email,
        },
        // URLs de redirección tras pago
        success_url: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/cursos?pago=exito`,
        failure_url: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/cursos?pago=error`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Fintoc API error:', error)
      return res.status(response.status).json({ error: error.message || 'Payment service error' })
    }

    const data = await response.json()

    // Retornar el URL de la sesión para redirigir al usuario
    return res.status(200).json({
      sessionUrl: data.session_url,
      sessionId: data.id,
    })
  } catch (err) {
    console.error('Fintoc checkout error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
