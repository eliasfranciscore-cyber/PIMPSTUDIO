import React, { useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"

/* Efecto "container scroll" (Aceternity) portado a mano: en vez de instalar el
   paquete vía shadcn (este proyecto no usa shadcn/Tailwind-por-componente,
   solo CSS propio en brunetti.css/pimp.css — ver lamp.jsx para el mismo
   patrón), reimplementamos solo la lógica de scroll con framer-motion
   (ya es dependencia) y el look en CSS puro.
   La tarjeta entra inclinada (rotateX) y se endereza a medida que la sección
   sube por el viewport. */
export function ContainerScroll({ children, className = "" }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 30%"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0.94, 1])

  return (
    <div ref={ref} className={`bru-scroll-perspective ${className}`}>
      <motion.div className="bru-scroll-card" style={{ rotateX, scale }}>
        {children}
      </motion.div>
    </div>
  )
}

export default ContainerScroll
