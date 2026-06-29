import React, { useState } from 'react'

const CURSO_PRICE = '9990' // CLP
const CHECKOUT_ITEMS = [
  '6 módulos · 21 lecciones en video',
  'Acceso inmediato a la comunidad Brunetti en Skool',
  'Método de visagismo aplicado — lectura de rostro',
  'Sistema de fade, orden de corte y marca personal',
  'Acceso de por vida al material y actualizaciones',
]

export default function FintocCheckout() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    const validPhone = form.phone.replace(/\D/g, '').length >= 8

    if (!form.name.trim() || !validEmail || !validPhone) {
      setError('Revisa todos los campos requeridos.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/fintoc-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: CURSO_PRICE,
          email: form.email.trim(),
          name: form.name.trim(),
          phone: form.phone,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      const data = await response.json()
      window.location.href = data.sessionUrl
    } catch (err) {
      setError(err.message || 'Error al procesar pago')
      setLoading(false)
    }
  }

  return (
    <div className="checkout-card" data-reveal>
      {/* — Info — */}
      <div className="checkout-info">
        <p className="checkout-label">Lo que recibes</p>
        <h3 className="checkout-title">Curso Brunetti · Visagismo &amp; Barbería</h3>
        <ul className="checkout-list">
          {CHECKOUT_ITEMS.map((item) => (
            <li key={item}>
              <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* — Pago — */}
      <div className="checkout-pay">
        <div className="checkout-price-block">
          <span className="checkout-price-label">Precio de lanzamiento</span>
          <div className="checkout-price-row">
            <span className="checkout-amount">${CURSO_PRICE.slice(0, -3)}.{CURSO_PRICE.slice(-3)}</span>
            <span className="checkout-currency">CLP</span>
          </div>
          <span className="checkout-price-sub">Pago único · sin cuotas · sin renovación</span>
        </div>

        <form onSubmit={onSubmit} className="checkout-form">
          <div className="frow">
            <label htmlFor="fintoc-name">Nombre completo</label>
            <input
              type="text"
              id="fintoc-name"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="frow two">
            <div className="frow">
              <label htmlFor="fintoc-email">Email</label>
              <input
                type="email"
                id="fintoc-email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="frow">
              <label htmlFor="fintoc-phone">Teléfono</label>
              <input
                type="tel"
                id="fintoc-phone"
                name="phone"
                placeholder="9 1234 5678"
                value={form.phone}
                onChange={onChange}
                required
              />
            </div>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary checkout-cta"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'ACCEDER AL CURSO AHORA'}
          </button>
        </form>

        <div className="checkout-secure">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2l7 4v6c0 5-3.5 9-7 10C8.5 21 5 17 5 12V6l7-4z" /></svg>
          Pago seguro vía transferencia bancaria con Fintoc
        </div>

        <div className="checkout-fintoc-badge">
          <span>Procesado por</span>
          <svg viewBox="0 0 80 20" width="56" height="14" aria-label="Fintoc">
            <text x="0" y="15" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="700" fill="currentColor">fintoc</text>
          </svg>
        </div>

        <p className="checkout-after">
          Tras el pago recibirás acceso a la comunidad Brunetti en Skool con todos los módulos desbloqueados.
        </p>
      </div>
    </div>
  )
}
