import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrunettiFx, scrollToId } from '../components/brunetti.jsx'
import SiteNav from '../components/SiteNav.jsx'
import ModuleFooter from '../components/ModuleFooter.jsx'
import { Lamp } from '../components/ui/lamp.jsx'
import FintocCheckout from '../components/FintocCheckout.jsx'

/* ================================================================
   CURSOS BRUNETTI — Formación en visagismo & barbería
   Flujo: usuario ve módulos → paga vía Fintoc → accede a Skool
   ================================================================ */

const MODULES = [
  {
    t: 'Bienvenida',
    d: 'Quién soy y qué vas a lograr aquí — el método, la comunidad y cómo aprovechar Skool.',
    lessons: [
      ['Mi historia como barbero — por qué creé esto', '07:30'],
      ['Qué vas a lograr en esta comunidad', '05:30'],
      ['Cómo usar Skool en 3 minutos (en español)', '05:00'],
    ],
  },
  {
    t: 'El Protocolo Pre-Corte',
    d: 'Por qué el 90% falla antes de tomar la máquina — las 5 preguntas que cambian la experiencia del cliente.',
    lessons: [
      ['El error que comete el 90% antes de cortar', '07:30'],
      ['Las 5 preguntas explicadas una por una', '08:30'],
      ['Las 5 preguntas en vivo con cliente real', '08:30'],
      ['Cómo el protocolo cambia lo que cobrás', '07:30'],
    ],
  },
  {
    t: 'El Sistema de Fade',
    d: 'Low, mid y high fade desde cero — lectura del cráneo, ejecución y corrección de errores.',
    lessons: [
      ['Cómo leer el cráneo antes de empezar', '07:30'],
      ['Low fade — paso a paso', '08:30'],
      ['Mid fade y high fade — las diferencias clave', '09:30'],
      ['Cómo borrar manchas y líneas duras', '08:30'],
    ],
  },
  {
    t: 'El Orden del Corte',
    d: 'Patrón de crecimiento, secciones y zonas anatómicas — un sistema que da resultados consistentes.',
    lessons: [
      ['Por qué el orden importa más que la técnica', '07:30'],
      ['Secciones anatómicas: occipital, parietal y temporal', '09:30'],
      ['El mapa del cráneo — zonas y orden de trabajo', '07:30'],
    ],
  },
  {
    t: 'Marca Personal',
    d: 'Cómo posicionarte como EL barbero de tu ciudad — qué publicar y cómo documentar tu trabajo.',
    lessons: [
      ['El barbero que no se ve no existe', '07:30'],
      ['Qué publicar en TikTok e Instagram como barbero', '08:30'],
      ['Cómo documentar un corte en 60 segundos', '07:30'],
    ],
  },
  {
    t: 'Cómo Cobrar Más',
    d: 'De $12.000 a $20.000 — el caso real de Brunetti, la mentalidad y el método paso a paso.',
    lessons: [
      ['Por qué los barberos cobran poco', '07:30'],
      ['El caso Brunetti — de $12.000 a $20.000', '08:30'],
      ['Cómo comunicar la subida sin perder clientes', '08:30'],
      ['Tu plan de los próximos 30 días', '07:30'],
    ],
  },
]

const INCLUDES = [
  { b: 'Método de visagismo aplicado', s: 'Lee proporciones y rasgos para decidir cada corte con criterio, no por moda.', icon: (<><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></>) },
  { b: 'Técnica de precisión', s: 'Degradados, texturas y acabados explicados paso a paso.', icon: (<path d="M14 4l6 6M3 21l3-1 11-11-2-2L4 18z" />) },
  { b: 'Marca personal & contenido', s: 'Cómo mostrar tu trabajo y construir una identidad reconocible.', icon: (<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3l-4 4-4-4" /></>) },
  { b: 'Crecimiento & negocio', s: 'Mentalidad y orden para profesionalizar tu servicio.', icon: (<path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21l2.3-7.2-6-4.4h7.6z" />) },
]

export default function Cursos() {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const [openIdx, setOpenIdx] = useState(-1)

  useBrunettiFx(rootRef, { parallax: false })

  const goHomeSection = (section) => navigate('/', { state: { section } })
  const goAnchor = (id) => scrollToId(id)

  return (
    <div className="brunetti-site cursos-page" ref={rootRef}>
      <SiteNav />

      <main>
        {/* ============ HERO ============ */}
        <section className="course-hero">
          <div className="course-hero-bg"><img src="/assets/workshop-2026.jpg" alt="Workshop Brunetti con su comunidad de barberos" /></div>
          <div className="course-hero-inner">
            <span className="bhero-kicker"><span className="dot" />Formación profesional · Bruno Herrera</span>
            <h1>Curso Brunetti<br />Visagismo &amp; Barbería</h1>
            <p className="sub">Aprende a leer el rostro, dominar la técnica y construir tu marca personal. 6 módulos pensados para barberos que quieren dejar de copiar tendencias y empezar a diseñar imagen.</p>
            <div className="actions">
              <a className="btn btn-primary" onClick={() => goAnchor('inscripcion')}>ACCEDER AL CURSO — $9.990</a>
              <a className="btn btn-ghost" onClick={() => goAnchor('curriculum')}>VER PROGRAMA</a>
            </div>
            <div className="course-stats">
              <div className="cst"><strong data-count="6">0</strong><span>Módulos</span></div>
              <div className="cst"><strong data-count="21">0</strong><span>Lecciones</span></div>
              <div className="cst"><strong data-count="100" data-suffix="%">0</strong><span>Online</span></div>
              <div className="cst"><strong>∞</strong><span>Acceso al material</span></div>
            </div>
          </div>
        </section>

        {/* ============ INTRO ============ */}
        <section className="bsection">
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">Por qué este curso</p>
              <h2>De cortar pelo a diseñar imagen</h2>
              <p>Bruno comparte el mismo método que aplica en su estudio: visagismo, técnica de precisión, dirección de estilo y construcción de marca personal. Un programa práctico para que eleves tu trabajo, tu imagen y tu negocio.</p>
            </div>
            <div className="includes-grid">
              {INCLUDES.map((it, i) => (
                <div className="include" data-reveal style={{ '--i': i }} key={it.b}>
                  <svg viewBox="0 0 24 24">{it.icon}</svg>
                  <div><b>{it.b}</b><span>{it.s}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CURRICULUM ============ */}
        <section className="bsection wk-alt" id="curriculum">
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">6 módulos · 21 lecciones</p>
              <h2>El temario completo</h2>
              <p>Toca cada módulo para ver sus lecciones y contenidos.</p>
            </div>
            <div className="modules">
              {MODULES.map((m, i) => {
                const num = (i + 1 < 10 ? '0' : '') + (i + 1)
                const open = openIdx === i
                return (
                  <article className={`module${open ? ' is-open' : ''}`} key={m.t}>
                    <button className="module-head" type="button" aria-expanded={open} onClick={() => setOpenIdx(open ? -1 : i)}>
                      <span className="module-num">{num}</span>
                      <span className="module-titles"><h3>{m.t}</h3><p>{m.d}</p></span>
                      <span className="module-meta">
                        <span className="module-count">{m.lessons.length} lecciones</span>
                        <span className="module-chevron"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg></span>
                      </span>
                    </button>
                    <div className="module-body"><div className="module-body-inner"><ul className="lessons">
                      {m.lessons.map((l) => (
                        <li className="lesson" key={l[0]}>
                          <span className="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
                          <span className="ltitle">{l[0]}</span>
                          <span className="ldur">{l[1]}</span>
                          <span className="lock"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
                        </li>
                      ))}
                    </ul></div></div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============ CHECKOUT ============ */}
        <section className="bsection bsection-lamp" id="inscripcion">
          <Lamp className="bru-lamp--sec" />
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">Acceso inmediato</p>
              <h2>Empieza hoy mismo</h2>
              <p>Un pago único. Acceso de por vida a los 6 módulos en la comunidad Brunetti en Skool.</p>
            </div>

            <FintocCheckout />
          </div>
        </section>
      </main>

      <ModuleFooter
        links={[
          [() => goAnchor('curriculum'), 'Programa'],
          [() => goAnchor('inscripcion'), 'Acceder'],
          [() => goHomeSection('visagismo'), 'Visagismo'],
          [() => navigate('/workshop'), 'Workshop'],
          [() => goHomeSection('contacto'), 'Contacto'],
        ]}
        onPrimary={() => goAnchor('inscripcion')}
        primaryLabel="Acceder al curso"
      />
    </div>
  )
}
