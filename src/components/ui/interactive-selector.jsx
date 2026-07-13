import React, { useState } from "react"

/* Selector interactivo (inspirado en @thanh/interactive-selector de 21st.dev,
   reimplementado a mano — el código fuente original está bloqueado tras login,
   así que replicamos el patrón visual: un panel activo ancho + el resto
   angostos, con transición suave de flex-grow al pasar el mouse o tocar).
   `items` = { num, title, body, icon, image? }. Sin `image` muestra el ícono
   sobre el tinte dorado — cuando se agreguen fotos reales, basta con pasar
   `image` por item y el panel las usa como fondo automáticamente. */
export function InteractiveSelector({ items, className = "" }) {
  const [active, setActive] = useState(0)

  return (
    <div className={`interactive-selector ${className}`}>
      {items.map((item, i) => (
        <button
          key={item.num}
          type="button"
          className={`is-panel ${i === active ? "is-active" : ""}`}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onClick={() => setActive(i)}
          aria-pressed={i === active}
        >
          <span className="is-panel-bg" aria-hidden="true">
            {item.video ? (
              <video
                src={item.video}
                poster={item.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : item.image ? (
              <img src={item.image} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="is-panel-icon"><svg viewBox="0 0 24 24">{item.icon}</svg></span>
            )}
          </span>
          <span className="is-panel-content">
            <span className="is-num">{item.num}</span>
            <span className="is-title">{item.title}</span>
            <span className="is-body">{item.body}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default InteractiveSelector
