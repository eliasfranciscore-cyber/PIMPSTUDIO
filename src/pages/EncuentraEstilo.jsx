import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../components/theme.jsx'
import SiteNav from '../components/SiteNav.jsx'
import ModuleFooter from '../components/ModuleFooter.jsx'
import { FACE_SHAPES, GALLERY_CATS, GALLERY, u } from '../data/estilo.js'
import '../styles/estilo.css'

/* ============================================================
   ENCUENTRA TU ESTILO — Visagismo interactivo + galería
   Port a React del módulo del paquete (eu/estilo.*). Contenido
   scopeado bajo .ete (tokens premium propios), pero envuelto en
   .brunetti-site para COMPARTIR el chrome del sitio:
   - Nav global (SiteNav): mismo navbar + menú móvil para navegar
     todo el proyecto + botón flotante "Reservar hora" en móvil.
   - Footer global (ModuleFooter): mismo footer de Home/Cursos.
   El tema lo controla el toggle GLOBAL (FloatingThemeToggle):
   reflejamos `theme` en data-theme del root .ete para activar los
   tokens de modo claro premium definidos en estilo.css.
   Se omite el panel de Tweaks; reservar usa el flujo real /reservar.
   ============================================================ */

/* ---- iconos (stroke) ---- */
function Icon({ name, size = 20 }) {
  const p = {
    target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" /></>),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></>),
    spark: <path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.8L12 15.6 6.4 19.6l2.1-6.8L3 8.8h6.8z" />,
    insta: (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" /></>),
  }[name]
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  )
}

/* ---- imagen con respaldo (degrada a placeholder etiquetado) ---- */
function SmartImg({ src, alt, label }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={'ete-img' + (failed ? ' is-failed' : '')} data-label={label || alt || 'Foto'}>
      <img src={src} alt={alt || ''} loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}

/* ---- silueta de forma de rostro ---- */
function FaceGlyph({ path }) {
  return <svg viewBox="0 0 100 120" aria-hidden="true"><path d={path} /></svg>
}

/* ---- reveal on scroll ---- */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
function Reveal({ children, className = '', style }) {
  const ref = useReveal()
  return <div ref={ref} className={'ete-reveal ' + className} style={style}>{children}</div>
}

function smoothScroll(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 64
  const reduce = 'matchMedia' in window && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <header className="ete-hero">
      <div className="ete-hero-media">
        <img src={u('1605497788044-5a32c7078486', 1900)} alt="Asesoría de imagen en Brunetti"
          onError={(e) => { e.target.parentElement.style.background = 'linear-gradient(160deg,#1a1916,#0a0a09)' }} />
      </div>
      <div className="ete-hero-overlay" />
      <div className="ete-wrap ete-hero-inner">
        <div className="ete-hero-kicker">
          <span className="ete-eyebrow">Visagismo interactivo</span>
          <span className="ete-chip"><Icon name="spark" size={13} /> Nuevo</span>
        </div>
        <h1>Encuentra<span className="l2">tu estilo</span></h1>
        <p className="ete-hero-sub">
          No copies una tendencia: descubre el corte que armoniza con la forma de tu rostro.
          Haz tu autodiagnóstico de visagismo y explora la galería de estilos de Bruno Herrera.
        </p>
        <div className="ete-hero-actions">
          <button className="ete-btn ete-btn-gold" type="button" onClick={() => smoothScroll('visagismo')}>
            Iniciar diagnóstico <Icon name="arrow" size={16} />
          </button>
          <button className="ete-btn ete-btn-ghost" type="button" onClick={() => smoothScroll('galeria')}>Ver galería</button>
        </div>
        <div className="ete-hero-stats">
          <div className="s"><b>6</b><span>Formas de rostro</span></div>
          <div className="s"><b>+30</b><span>Estilos guía</span></div>
          <div className="s"><b>100%</b><span>A tu medida</span></div>
        </div>
      </div>
    </header>
  )
}

/* ---------- VISAGISMO ---------- */
function Visagismo({ onReserveService }) {
  const [sel, setSel] = useState(null)
  const shape = FACE_SHAPES.find((s) => s.id === sel)
  return (
    <section className="ete-section" id="visagismo">
      <div className="ete-wrap">
        <Reveal>
          <div className="ete-head">
            <span className="ete-eyebrow">El método, paso a paso</span>
            <h2 className="ete-h2">Tu rostro decide <span className="ete-gold-text">el corte</span></h2>
            <p className="ete-lead">
              El visagismo estudia las proporciones de tu rostro para diseñar una imagen que te favorezca de verdad.
              Empieza eligiendo la forma con la que más te identificas.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="ete-vis-steps">
            <span className="ete-step-pill is-active"><b>1</b> Elige tu forma de rostro</span>
            <span className={'ete-step-pill' + (shape ? ' is-active' : '')}><b>2</b> Recibe tu diagnóstico</span>
            <span className="ete-step-pill"><b>3</b> Reserva tu asesoría</span>
          </div>

          <div className="ete-shape-grid">
            {FACE_SHAPES.map((s) => (
              <button key={s.id} className={'ete-shape' + (sel === s.id ? ' is-active' : '')}
                type="button" onClick={() => setSel(s.id)} aria-pressed={sel === s.id}>
                <FaceGlyph path={s.path} />
                <span className="nm">{s.name}</span>
                <span className="tg">{s.tagline}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {!shape && (
          <div className="ete-empty">
            <Icon name="target" size={40} />
            <p style={{ margin: 0 }}>Selecciona una forma de rostro para ver tu diagnóstico y los cortes recomendados por Bruno.</p>
          </div>
        )}

        {shape && (
          <div className="ete-result" key={shape.id}>
            <div className="ete-result-top">
              <div className="ete-result-diag">
                <span className="ete-eyebrow">Rostro {shape.name.toLowerCase()}</span>
                <h3>{shape.tagline}</h3>
                <p className="diag">{shape.diagnosis}</p>
                <div className="ete-traits">
                  {shape.traits.map((t, i) => <span className="ete-chip" key={i}>{t}</span>)}
                </div>
                <div className="ete-goal">
                  <span className="ic"><Icon name="target" size={20} /></span>
                  <span><b>Objetivo: </b><span>{shape.goal}</span></span>
                </div>
              </div>
              <div className="ete-result-figure">
                <SmartImg src={shape.best[0].img} alt={'Estilo recomendado para rostro ' + shape.name} label={'Rostro ' + shape.name} />
                <span className="ete-chip tag">Look de referencia</span>
              </div>
            </div>

            <div className="ete-best">
              <p className="ete-best-label">Cortes recomendados para ti</p>
              <div className="ete-best-grid">
                {shape.best.map((c, i) => (
                  <article className="ete-cut" key={i}>
                    <SmartImg src={c.img} alt={c.name} label={c.name} />
                    <div className="ete-cut-body">
                      <h4>{c.name}</h4>
                      <p>{c.note}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="ete-avoid">
                <span className="ic"><Icon name="alert" size={18} /></span>
                <span><b>Evita: </b>{shape.avoid}</span>
              </p>
              <div className="ete-best-cta">
                <button className="ete-btn ete-btn-gold" type="button" onClick={() => onReserveService(10)}>Reservar asesoría<span className="ete-hide-mobile">&nbsp;con Bruno</span> <Icon name="arrow" size={16} /></button>
                <button className="ete-btn ete-btn-ghost" type="button" onClick={() => smoothScroll('galeria')}>Ver más estilos</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- GALERÍA ---------- */
function Galeria() {
  const [cat, setCat] = useState('Todos')
  const items = cat === 'Todos' ? GALLERY : GALLERY.filter((g) => g.cat === cat)
  return (
    <section className="ete-section ete-section-alt" id="galeria">
      <div className="ete-wrap">
        <Reveal>
          <div className="ete-head">
            <span className="ete-eyebrow">Galería de estilos</span>
            <h2 className="ete-h2">Explora <span className="ete-gold-text">por tipo de corte</span></h2>
            <p className="ete-lead">
              Una guía visual para inspirarte. Filtra por estilo y lleva tus referencias favoritas a la asesoría.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="ete-filters">
            {GALLERY_CATS.map((c) => (
              <button key={c} type="button" className={'ete-filter' + (cat === c ? ' is-active' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </Reveal>

        <div className="ete-gallery">
          {items.map((g, i) => (
            <article className="ete-gcard" key={g.title + i}>
              <span className="ete-gcard-cat">{g.cat}</span>
              <SmartImg src={g.img} alt={g.title} label={g.title} />
              <div className="ete-gcard-body">
                <h4>{g.title}</h4>
                <p>{g.sub}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- CTA ---------- */
function CtaBand({ onReserveService }) {
  return (
    <section className="ete-section ete-cta">
      <div className="ete-cta-bg">
        <img src={u('1622286342621-4bd786c2447c', 1800)} alt="" aria-hidden="true"
          onError={(e) => { e.target.parentElement.style.background = 'var(--bg-1)' }} />
      </div>
      <div className="ete-wrap">
        <Reveal>
          <div className="ete-cta-card">
            <span className="ete-eyebrow is-center">Tu transformación empieza aquí</span>
            <h2>Lleva tu diagnóstico a la silla de Bruno</h2>
            <p>Agenda una asesoría de imagen y convirtamos tu forma de rostro y tu estilo de vida en un corte hecho a tu medida.</p>
            <div className="ete-cta-actions">
              <button className="ete-btn ete-btn-gold" type="button" onClick={() => onReserveService(10)}>Reservar asesoría <Icon name="arrow" size={16} /></button>
              <a className="ete-btn ete-btn-ghost" href="https://instagram.com/brunetticutz" target="_blank" rel="noopener noreferrer">
                <Icon name="insta" size={16} /> @brunetticutz
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- PÁGINA ---------- */
export default function EncuentraEstilo() {
  const navigate = useNavigate()
  const { theme } = useTheme()

  const reserve = () => navigate('/reservar')
  const reserveService = (id) => {
    try { localStorage.setItem('ps_pending_service', String(id)) } catch (e) { /* noop */ }
    navigate('/reservar')
  }

  return (
    <div className="brunetti-site estilo-page">
      <SiteNav />
      <div className="ete" data-theme={theme}>
        <div className="ete-shell">
          <Hero />
          <Visagismo onReserveService={reserveService} />
          <Galeria />
          <CtaBand onReserveService={reserveService} />
        </div>
      </div>
      <ModuleFooter
        links={[
          [() => smoothScroll('visagismo'), 'Visagismo'],
          [() => smoothScroll('galeria'), 'Galería'],
          [() => navigate('/cursos'), 'Cursos'],
          [() => navigate('/workshop'), 'Workshop'],
        ]}
        onPrimary={reserve}
        primaryLabel="Reservar hora"
      />
    </div>
  )
}
