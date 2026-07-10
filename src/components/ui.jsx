import React, { useState, useEffect, useRef } from 'react'

export function Emblem({ size = 46 }) {
  return (
    <span
      className="pimp-mark"
      style={{ width: size, height: size }}
      aria-label="Brunetti"
      role="img"
    />
  )
}

export function Brandmark({ size = 44, sub = "Barber Studio", label = "BRUNETTI", onClick }) {
  return (
    <div className="brandmark" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <Emblem size={size} />
      <span className="wordmark">{label}<small>{sub}</small></span>
    </div>
  )
}

export const ICONS = {
  scissors: "M6 6l12 12M6 18L18 6M8 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM8 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  calendar: "M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5z",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0",
  phone: "M5 4h3l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6M20 16v-9",
  wallet: "M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zM4 7V6a2 2 0 0 1 2-2h10M17 13h.5",
  star: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.6 9.1l5.8-.8z",
  spark: "M12 3v6M12 15v6M3 12h6M15 12h6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  check: "M5 12.5l4.5 4.5L19 7",
  pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bell: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 0 0 4 0",
  logout: "M15 12H4M11 8l-4 4 4 4M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4",
  trend: "M3 17l6-6 4 4 8-8M21 7v5M21 7h-5",
  gift: "M12 8v13M3.5 8h17v3.5h-17zM4.5 11.5h15V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1zM12 8S10.5 3.5 8 4.5 9.5 8 12 8zM12 8s1.5-4.5 4-3.5S14.5 8 12 8z",
  cut: "M14.5 9.5L21 3M14.5 14.5L21 21M9.5 12l-6.5-9M9.5 12l-6.5 9M9.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  whatsapp: "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6.5h.01",
}

export function Icon({ name, size = 20, stroke = 1.6, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={ICONS[name] || ICONS.spark} />
    </svg>
  )
}

export function useInView(opts = { threshold: 0.18 }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) { setSeen(true); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.unobserve(el) } })
    }, opts)
    io.observe(el)
    const fallback = setTimeout(() => setSeen(true), 1100)
    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])
  return [ref, seen]
}

export function Reveal({ children, className = "", as = "div", stagger = false, style }) {
  const [ref, seen] = useInView()
  const Tag = as
  const base = stagger ? "stagger" : "reveal"
  return <Tag ref={ref} className={`${base} ${seen ? "is-in" : ""} ${className}`} style={style}>{children}</Tag>
}

export function Stat({ icon, label, value, delta, suffix, accent }) {
  const up = delta >= 0
  return (
    <div className="card" style={{ padding: "1.1rem 1.2rem", display: "grid", gap: ".6rem", borderTop: accent ? "1px solid var(--gold-line)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".4rem" }}>
        <span style={{ fontSize: ".66rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-display)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ color: accent ? "var(--gold)" : "var(--muted)", flexShrink: 0, display: "inline-flex" }}><Icon name={icon} size={17} /></span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.35rem, 5vw, 1.85rem)", fontWeight: 600, letterSpacing: "-.01em", color: accent ? "var(--gold)" : "var(--ink)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}{suffix && <span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: ".15em" }}>{suffix}</span>}
      </div>
      {delta != null && (
        <div style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".74rem", color: up ? "#9fd0a0" : "#d99a8f" }}>
          <Icon name="trend" size={14} style={{ transform: up ? "none" : "scaleY(-1)" }} />
          <span>{up ? "+" : ""}{delta}%</span>
          <span style={{ color: "var(--muted-2)" }}>vs semana ant.</span>
        </div>
      )}
    </div>
  )
}

export function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <Reveal style={{ textAlign: center ? "center" : "left", marginBottom: "2.4rem", display: "grid", gap: ".7rem", justifyItems: center ? "center" : "start" }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(1.7rem,3.4vw,2.7rem)", fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.05 }}>{title}</h2>
      <span style={{ width: 64, height: 2, background: "var(--gold-grad)" }} />
      {sub && <p style={{ margin: 0, color: "var(--muted)", maxWidth: 560, fontSize: ".98rem" }}>{sub}</p>}
    </Reveal>
  )
}

export function MobileScreen({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      overflowX: "hidden",
      background: "var(--bg)",
      // safe-area-inset-top: evita que el contenido superior quede bajo el
      // notch/cámara cuando la web corre como app instalada en iOS.
      paddingTop: "env(safe-area-inset-top)",
    }}>
      {children}
    </div>
  )
}

export function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 1.6rem 0.2rem", fontSize: ".78rem", fontWeight: 600, color: "var(--ink)", letterSpacing: ".02em" }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 5, alignItems: "center", opacity: .85 }}>
        <span>●●●</span><span>5G</span><span>▮</span>
      </span>
    </div>
  )
}
