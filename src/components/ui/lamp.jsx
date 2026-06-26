import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

/* Lámpara DORADA (luz transparente, sin caja negra) — brilla sobre el fondo de la
   sección, en tema claro y oscuro. Visual en brunetti.css (.bru-lamp*).
   Animación al hacer scroll: la luz CRECE y se abre (scaleX) y sube su opacidad
   a medida que la sección entra en viewport. */
export function Lamp({ className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "center 45%"],
  })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0.5, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.12, 1])

  return (
    <div ref={ref} className={`bru-lamp ${className}`} aria-hidden="true">
      <motion.div className="bru-lamp-inner" style={{ scaleX, opacity }}>
        <div className="bru-lamp-beam bru-lamp-beam--l" />
        <div className="bru-lamp-beam bru-lamp-beam--r" />
        <div className="bru-lamp-glow" />
        <div className="bru-lamp-line" />
      </motion.div>
    </div>
  )
}

export default Lamp
