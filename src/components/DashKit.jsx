import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Icon } from './IconsExtra.jsx'

/**
 * DashKit — primitivas visuales animadas del panel (mini design-system).
 *
 * Todo hecho a mano (SVG + rAF), sin librerías, consumiendo los tokens de
 * pimp.css (--gold, --hair, --ink, …). Las animaciones respetan
 * prefers-reduced-motion. Estilos en modules.css, sección DASHKIT (.dk-*).
 */

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Anima un número de 0 → target con rAF y easing suave. */
export function useCountUp(target, { duration = 900 } = {}) {
  const value = Number(target) || 0
  const [n, setN] = useState(() => (prefersReduced() ? value : 0))
  const raf = useRef(null)
  useEffect(() => {
    if (prefersReduced()) { setN(value); return }
    const from = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setN(from + (value - from) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return n
}

export function CountUp({ value, format }) {
  const n = useCountUp(value)
  const r = Math.round(n)
  return <>{format ? format(r) : r}</>
}

/**
 * Tarjeta KPI compacta (fórmula: label uppercase chico + valor grande con
 * count-up + borde de acento izquierdo). `onClick` la vuelve clickable
 * (filtros); `active` la resalta.
 */
export function KpiTile({ icon, label, value, format, suffix, color = 'var(--gold)', onClick, active, sub, delta, deltaSuffix = ' vs sem. ant.', children }) {
  const Tag = onClick ? 'button' : 'div'
  const hasDelta = delta != null && Number.isFinite(delta) && delta !== 0
  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`dk-kpi ${onClick ? 'is-btn' : ''} ${active ? 'is-on' : ''}`}
      style={{ '--c': color }}
    >
      <span className="dk-kpi-lbl">{icon && <Icon name={icon} size={12} />} {label}</span>
      <b className="dk-kpi-val"><CountUp value={value} format={format} />{suffix && <small>{suffix}</small>}</b>
      {hasDelta && (
        <span className="dk-kpi-sub" style={{ color: delta > 0 ? 'var(--green)' : 'var(--red)' }}>
          {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}{deltaSuffix}
        </span>
      )}
      {!hasDelta && sub && <span className="dk-kpi-sub">{sub}</span>}
      {children}
    </Tag>
  )
}

/* Sparkline SVG con trazo que se dibuja al montar. */
export function Sparkline({ data = [], width = 130, height = 38, stroke = 'var(--gold)' }) {
  const ref = useRef(null)
  const [len, setLen] = useState(0)
  const [drawn, setDrawn] = useState(prefersReduced())
  const pts = useMemo(() => {
    if (data.length < 2) return ''
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const span = max - min || 1
    const pad = 3
    return data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2)
      const y = height - pad - ((v - min) / span) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }, [data, width, height])
  useEffect(() => {
    if (!ref.current || !pts) return
    setLen(ref.current.getTotalLength())
    const t = setTimeout(() => setDrawn(true), 60)
    return () => clearTimeout(t)
  }, [pts])
  if (!pts) return null
  const last = pts.split(' ').pop().split(',')
  return (
    <svg className="dk-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        ref={ref} points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len || 1}
        strokeDashoffset={drawn ? 0 : (len || 1)}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.3,.7,.3,1)' }}
      />
      <circle cx={last[0]} cy={last[1]} r="3" fill={stroke} className="dk-spark-dot" />
    </svg>
  )
}

/* Donut por segmentos (stroke-dasharray) con etiqueta central. */
export function Donut({ items = [], size = 120, thickness = 13, centerLabel, centerSub }) {
  const total = items.reduce((s, i) => s + (Number(i.value) || 0), 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const [on, setOn] = useState(prefersReduced())
  useEffect(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t) }, [])
  let acc = 0
  return (
    <svg className="dk-donut" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="dk-donut-track" strokeWidth={thickness} />
      {total > 0 && items.map((item, i) => {
        const frac = (Number(item.value) || 0) / total
        const seg = (
          <circle key={item.label ?? i}
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={item.color} strokeWidth={thickness}
            strokeDasharray={`${on ? frac * c : 0} ${c}`}
            strokeDashoffset={-acc * c}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: `stroke-dasharray .9s cubic-bezier(.3,.7,.3,1) ${i * 70}ms` }}
          />
        )
        acc += frac
        return seg
      })}
      {centerLabel != null && (
        <text x="50%" y={centerSub ? '46%' : '50%'} textAnchor="middle" dominantBaseline="central" className="dk-donut-lbl">{centerLabel}</text>
      )}
      {centerSub && (
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central" className="dk-donut-sub">{centerSub}</text>
      )}
    </svg>
  )
}

/* Barra de progreso con color de estado y ancho animado. */
export function ProgressBar({ pct = 0, color = 'var(--gold)' }) {
  const p = Math.max(0, Math.min(100, pct))
  const [on, setOn] = useState(prefersReduced())
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t) }, [])
  return (
    <div className="dk-progress" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin="0" aria-valuemax="100">
      <div className="dk-progress-fill" style={{ width: `${on ? p : 0}%`, background: color }} />
    </div>
  )
}

/**
 * Anillo radial animado (generaliza el OccupancyRing del Resumen: gradiente
 * dorado, sweep de 1.4s). `size` parametrizable e id de gradiente único para
 * poder renderizar varios a la vez.
 */
export function AnimatedRing({ pct = 0, size = 96, label = 'ocupación', showText = true }) {
  const gid = useId()
  const stroke = Math.max(7, Math.round(size / 9.6))
  const r = (size - stroke) / 2 - 1
  const circ = 2 * Math.PI * r
  const [loaded, setLoaded] = useState(prefersReduced())
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 220); return () => clearTimeout(t) }, [])
  const p = Math.max(0, Math.min(100, Math.round(pct)))
  const dash = (p / 100) * circ
  const half = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', flexShrink: 0 }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9a7b34" />
          <stop offset="100%" stopColor="#e9d7a0" />
        </linearGradient>
      </defs>
      <circle cx={half} cy={half} r={r} fill="none" className="dk-ring-track" strokeWidth={stroke} />
      <circle cx={half} cy={half} r={r} fill="none"
        stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${loaded ? dash : 0} ${circ}`}
        transform={`rotate(-90 ${half} ${half})`}
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.2,.7,.3,1)' }}
      />
      {showText && (
        <>
          <text x={half} y={label ? half - size * 0.03 : half} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.18} fontWeight="700" fontFamily="var(--font-display)" fill="var(--gold-lt)">{p}%</text>
          {label && <text x={half} y={half + size * 0.14} textAnchor="middle" fontSize={size * 0.089} fill="var(--muted)">{label}</text>}
        </>
      )}
    </svg>
  )
}
