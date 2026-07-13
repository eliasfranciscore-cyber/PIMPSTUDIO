import React, { useEffect, useRef } from "react"

/* Fondo de partículas doradas (inspirado en @tsparticles/react SparklesCore de
   Aceternity). En vez de sumar la dependencia de tsparticles (motor de
   partículas completo, pesado para un efecto puramente decorativo), lo
   reimplementamos a mano con <canvas> + requestAnimationFrame — mismo patrón
   que Lamp/ContainerScroll en este mismo proyecto. Respeta
   prefers-reduced-motion (partículas estáticas, sin parpadeo ni deriva). */
export function Sparkles({ className = "", density = 1.5, speed = 1.5, color = "201, 161, 78", minSize = 0.6, maxSize = 1.7 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = null
    let particles = []
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function makeParticles() {
      // ~1 partícula cada 13 000px² (una pantalla normal ~1200x900 → ~85
      // visibles a la vez con density 1.5), con techo total para que un canvas
      // altísimo no dispare miles de partículas. `speed` multiplica deriva y
      // parpadeo para que se noten más sin recargar.
      const count = Math.min(560, Math.round((width * height) / 13000 * density))
      particles = Array.from({ length: Math.max(16, count) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: minSize + Math.random() * (maxSize - minSize),
        baseAlpha: 0.18 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: (0.5 + Math.random() * 0.9) * speed,
        driftX: (Math.random() - 0.5) * 0.08 * speed,
        driftY: (Math.random() - 0.5) * 0.08 * speed,
      }))
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      makeParticles()
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${p.baseAlpha * 0.6})`
        ctx.fill()
      })
    }

    let t = 0
    function tick() {
      t += 0.016
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.x += p.driftX
        p.y += p.driftY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
        const alpha = p.baseAlpha * (0.4 + 0.6 * Math.abs(Math.sin(t * p.speed + p.phase)))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(tick)
    }

    resize()
    if (reduceMotion) {
      drawStatic()
    } else {
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [density, speed, color, minSize, maxSize])

  return <canvas ref={canvasRef} className={`bru-sparkles ${className}`} aria-hidden="true" />
}

export default Sparkles
