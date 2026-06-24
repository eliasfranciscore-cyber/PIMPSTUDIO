import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, Reveal } from './ui.jsx'

export function LampBanner({ kicker, title, text, align = "center" }) {
  return (
    <section className={`lamp-section lamp-align-${align}`}>
      <div className="lamp-rig" />
      <div className="lamp-glow" />
      <div className="lamp-line" />
      <Reveal className="lamp-content">
        {kicker && <p className="lamp-kicker">{kicker}</p>}
        <h2 className="font-display">{title}</h2>
        {text && <p className="lamp-sub">{text}</p>}
      </Reveal>
    </section>
  )
}

export function Testimonials({ items }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 5200)
    return () => window.clearInterval(timer)
  }, [items.length])

  const active = items[index]
  const prev = items[(index + items.length - 1) % items.length]

  return (
    <section className="feature-section testimonials-section" id="sec-opiniones">
      <div className="feature-head">
        <p className="kicker">Opiniones</p>
        <h2 className="font-display">Lo que dicen nuestros clientes</h2>
      </div>
      <div className="testimonials-shell">
        <div className="tm-stage">
          {items.map((item, itemIndex) => (
            <figure
              key={item.name}
              className={`tm-photo ${itemIndex === index ? "is-active" : ""} ${itemIndex === (index + items.length - 1) % items.length ? "is-prev" : ""}`}
            >
              <img src={item.img} alt={item.name} />
            </figure>
          ))}
        </div>
        <div className="tm-body">
          <p className="tm-quote">{active.quote}</p>
          <div className="tm-meta">
            <strong>{active.name}</strong>
            <span>{active.role}</span>
          </div>
          <div className="tm-controls">
            <button className="tm-btn" type="button" onClick={() => setIndex((index + items.length - 1) % items.length)} aria-label="Anterior">
              <Icon name="arrowLeft" size={18} />
            </button>
            <button className="tm-btn" type="button" onClick={() => setIndex((index + 1) % items.length)} aria-label="Siguiente">
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
          <div className="tm-preview-chip">
            <span className="chip chip-gold">{prev.name}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeatureCarousel({ items }) {
  const trackRef = useRef(null)
  const [modalIndex, setModalIndex] = useState(-1)

  const active = modalIndex >= 0 ? items[modalIndex] : null

  const scrollByStep = (dir) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector(".ac-card")
    const step = card ? card.clientWidth + 16 : 300
    track.scrollBy({ left: step * dir, behavior: "smooth" })
  }

  return (
    <>
      <section className="feature-section apple-carousel" id="sec-experiencias">
        <div className="feature-head">
          <p className="kicker">Explora</p>
          <h2 className="font-display">Servicios y experiencias</h2>
          <p>Desliza para conocer lo que hacemos. Toca cualquier tarjeta para ver el detalle.</p>
        </div>
        <div className="ac-arrows">
          <button className="ac-arrow" type="button" aria-label="Anterior" onClick={() => scrollByStep(-1)}>
            <Icon name="arrowLeft" size={18} />
          </button>
          <button className="ac-arrow" type="button" aria-label="Siguiente" onClick={() => scrollByStep(1)}>
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
        <div ref={trackRef} className="ac-track">
          {items.map((item, itemIndex) => (
            <article key={item.title} className="ac-card" tabIndex={0} onClick={() => setModalIndex(itemIndex)} onKeyDown={(e) => { if (e.key === "Enter") setModalIndex(itemIndex) }}>
              <img src={item.img} alt={item.title} />
              <div className="ac-text">
                <p className="ac-cat">{item.cat}</p>
                <h3 className="ac-title font-display">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {active && (
        <div className="ac-modal is-open" role="dialog" aria-modal="true">
          <button className="ac-modal-scrim" aria-label="Cerrar" onClick={() => setModalIndex(-1)} />
          <div className="ac-modal-card">
            <button className="ac-close" type="button" onClick={() => setModalIndex(-1)} aria-label="Cerrar modal">
              <Icon name="close" size={18} />
            </button>
            <img src={active.img} alt={active.title} />
            <div className="ac-modal-body">
              <p className="ac-cat">{active.cat}</p>
              <h3 className="font-display">{active.title}</h3>
              <p>{active.body}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function ImageCompare({ beforeSrc, afterSrc, beforeLabel = "Antes", afterLabel = "Después" }) {
  const frameRef = useRef(null)
  const [position, setPosition] = useState(50)
  const draggingRef = useRef(false)

  const clipPath = useMemo(() => `inset(0 ${100 - position}% 0 0)`, [position])

  useEffect(() => {
    const onMove = (event) => {
      if (!draggingRef.current || !frameRef.current) return
      const rect = frameRef.current.getBoundingClientRect()
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
      const next = ((clientX - rect.left) / rect.width) * 100
      setPosition(Math.max(2, Math.min(98, next)))
    }
    const stop = () => { draggingRef.current = false }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", stop)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", stop)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", stop)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", stop)
    }
  }, [])

  const start = (event) => {
    draggingRef.current = true
    const rect = frameRef.current.getBoundingClientRect()
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(2, Math.min(98, next)))
  }

  return (
    <section className="feature-section compare-section" id="sec-transformaciones">
      <div className="feature-head">
        <p className="kicker">Antes / Después</p>
        <h2 className="font-display">La transformación Brunetti</h2>
        <p>Arrastra el control para ver el cambio. Así se ve la diferencia de un trabajo bien hecho.</p>
      </div>
      <div className="compare">
        <div ref={frameRef} className="cmp-frame" onMouseDown={start} onTouchStart={start}>
          <img className="cmp-img cmp-after" src={afterSrc} alt={afterLabel} />
          <img className="cmp-img cmp-before" src={beforeSrc} alt={beforeLabel} style={{ clipPath }} />
          <span className="cmp-tag before">{beforeLabel}</span>
          <span className="cmp-tag after">{afterLabel}</span>
          <div className="cmp-divider" style={{ left: `${position}%` }} />
          <div className="cmp-handle" style={{ left: `${position}%` }}>
            <Icon name="arrowLeft" size={14} />
            <Icon name="arrowRight" size={14} />
          </div>
        </div>
      </div>
    </section>
  )
}
