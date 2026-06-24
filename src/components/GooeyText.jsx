import React, { useEffect, useRef } from 'react'

/* ============================================================
   Gooey text morphing — alterna entre palabras (Brunetti ↔ Cutz)
   con desenfoque + filtro "goo" (umbral alfa) que las funde.
   Adaptado a JSX puro (sin shadcn/Tailwind). Respeta
   prefers-reduced-motion.
   ============================================================ */
export default function GooeyText({ texts = ['Brunetti', 'Cutz'], morphTime = 0.75, cooldownTime = 3.4 }) {
  const t1Ref = useRef(null)
  const t2Ref = useRef(null)

  useEffect(() => {
    const t1 = t1Ref.current
    const t2 = t2Ref.current
    if (!t1 || !t2) return
    let textIndex = texts.length - 1
    let morph = 0
    let cooldown = cooldownTime
    let time = performance.now()
    let raf

    const setTexts = () => {
      t1.textContent = texts[textIndex % texts.length]
      t2.textContent = texts[(textIndex + 1) % texts.length]
    }
    const setMorph = (f) => {
      t2.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`
      t2.style.opacity = String(Math.pow(f, 0.4))
      const inv = 1 - f
      t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`
      t1.style.opacity = String(Math.pow(inv, 0.4))
    }

    setTexts()

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      textIndex++
      setTexts()
      t1.style.opacity = '1'; t1.style.filter = 'none'
      t2.style.opacity = '0'
      return
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = (now - time) / 1000
      time = now
      cooldown -= dt
      if (cooldown <= 0) {
        if (morph === 0) { textIndex++; setTexts() }
        morph += dt
        let f = morph / morphTime
        if (f >= 1) { f = 1; morph = 0; cooldown = cooldownTime }
        setMorph(f)
      } else {
        t1.style.opacity = '0'; t1.style.filter = 'blur(0px)'
        t2.style.opacity = '1'; t2.style.filter = 'blur(0px)'
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <span className="gm-wrap">
      <svg width="0" height="0" className="gm-svg" aria-hidden="true">
        <defs>
          <filter id="gm-goo">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" />
          </filter>
        </defs>
      </svg>
      <span className="gm-stage">
        <span ref={t1Ref} className="gm-word" />
        <span ref={t2Ref} className="gm-word" />
      </span>
    </span>
  )
}
