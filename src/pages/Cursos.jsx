import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrunettiFx, scrollToId } from '../components/brunetti.jsx'
import SiteNav from '../components/SiteNav.jsx'
import ModuleFooter from '../components/ModuleFooter.jsx'
import { Lamp } from '../components/ui/lamp.jsx'
import { addLocalEnrollment } from '../enrollmentsStore.js'

/* ============================================================
   CURSOS BRUNETTI — Formación en visagismo & barbería
   Recreación 1:1 de cursos.html en React. (El módulo Workshop
   antiguo se mantiene aparte en /workshop.)
   ============================================================ */

const MODULES = [
  {
    t: 'Fundamentos del Visagismo',
    d: 'Qué es el visagismo y por qué cambia tu forma de cortar.',
    lessons: [
      ['Introducción al visagismo', '08:24'],
      ['Historia y principios del rostro', '11:02'],
      ['Proporciones áureas aplicadas', '13:47'],
      ['Tu mirada como barbero', '06:58'],
    ],
  },
  {
    t: 'Análisis de fisonomía y diagnóstico',
    d: 'Identificar formas de rostro, rasgos y qué favorece a cada uno.',
    lessons: [
      ['Tipos de rostro y cómo leerlos', '14:30'],
      ['Diagnóstico en consulta', '12:15'],
      ['Líneas, volúmenes y largos', '10:41'],
      ['Ficha del cliente', '07:20'],
    ],
  },
  {
    t: 'Técnica de corte a medida',
    d: 'Ejecución de precisión pensada para la fisonomía del cliente.',
    lessons: [
      ['Degradados quirúrgicos', '16:08'],
      ['Texturizado y movimiento', '13:55'],
      ['Adaptar el corte al rostro', '12:33'],
      ['Acabado y producto', '09:12'],
    ],
  },
  {
    t: 'Barba y perfilado de precisión',
    d: 'Diseño de barba que complementa el corte y el rostro.',
    lessons: [
      ['Diseño de líneas y simetría', '11:48'],
      ['Perfilado con navaja', '14:22'],
      ['Barba según fisonomía', '10:05'],
      ['Mantenimiento y recomendaciones', '07:39'],
    ],
  },
  {
    t: 'Dirección de estilo & transformación',
    d: 'Del corte al cambio de imagen integral.',
    lessons: [
      ['Construir una propuesta de imagen', '13:17'],
      ['Transformación completa paso a paso', '18:44'],
      ['Comunicar el cambio al cliente', '09:50'],
      ['Casos reales comentados', '15:26'],
    ],
  },
  {
    t: 'Marca personal, contenido y negocio',
    d: 'Mostrar tu trabajo y profesionalizar tu servicio.',
    lessons: [
      ['Tu identidad como barbero', '10:33'],
      ['Cómo grabar y mostrar tu trabajo', '14:09'],
      ['Construir comunidad y clientes', '12:51'],
      ['Precios, agenda y crecimiento', '13:40'],
    ],
  },
]

const INCLUDES = [
  { b: 'Método de visagismo aplicado', s: 'Lee proporciones y rasgos para decidir cada corte con criterio, no por moda.', icon: (<><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></>) },
  { b: 'Técnica de precisión', s: 'Degradados, texturas y acabados explicados paso a paso.', icon: (<path d="M14 4l6 6M3 21l3-1 11-11-2-2L4 18z" />) },
  { b: 'Marca personal & contenido', s: 'Cómo mostrar tu trabajo y construir una identidad reconocible.', icon: (<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3l-4 4-4-4" /></>) },
  { b: 'Crecimiento & negocio', s: 'Mentalidad y orden para profesionalizar tu servicio.', icon: (<path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21l2.3-7.2-6-4.4h7.6z" />) },
]

/* Un solo Curso Brunetti con 4 niveles. El nivel 1 trae el temario
   completo; los niveles 2–4 quedan como placeholders listos para llenar. */
const PLACEHOLDER_MODULES = [
  { t: 'Módulo por definir', d: 'Contenido en preparación para este nivel.', lessons: [['Lección por definir', '00:00']] },
  { t: 'Módulo por definir', d: 'Contenido en preparación para este nivel.', lessons: [['Lección por definir', '00:00']] },
  { t: 'Módulo por definir', d: 'Contenido en preparación para este nivel.', lessons: [['Lección por definir', '00:00']] },
  { t: 'Módulo por definir', d: 'Contenido en preparación para este nivel.', lessons: [['Lección por definir', '00:00']] },
]
const LEVELS = [
  { key: 'fundamentos', name: 'Nivel 1', sub: 'Fundamentos', desc: 'Visagismo, técnica base y lectura de rostro — el método completo de Bruno Herrera.', modules: MODULES },
  { key: 'intermedio', name: 'Nivel 2', sub: 'Intermedio', desc: 'Profundización en técnica de precisión y dirección de estilo. (Contenido por definir.)', modules: PLACEHOLDER_MODULES },
  { key: 'avanzado', name: 'Nivel 3', sub: 'Avanzado', desc: 'Transformación integral de imagen y casos reales de alto nivel. (Contenido por definir.)', modules: PLACEHOLDER_MODULES },
  { key: 'master', name: 'Nivel 4', sub: 'Máster', desc: 'Marca personal, negocio y mentoría avanzada para barberos. (Contenido por definir.)', modules: PLACEHOLDER_MODULES },
]

export default function Cursos() {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [level, setLevel] = useState(0)
  const [openIdx, setOpenIdx] = useState(0)
  const activeLevel = LEVELS[level]
  const [form, setForm] = useState({ name: '', phone: '', email: '', level: '', message: '' })
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)

  useBrunettiFx(rootRef, { parallax: false })

  const goHomeSection = (section) => { setMenuOpen(false); navigate('/', { state: { section } }) }
  const goAnchor = (id) => { setMenuOpen(false); scrollToId(id) }

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 8 || !validEmail) {
      setError(true)
      return
    }
    setError(false)
    /* Respaldo local: aparece de inmediato en el panel interno (Inscripciones),
       aunque el backend no esté disponible (p. ej. en desarrollo). */
    addLocalEnrollment({ ...form, source: 'cursos' })
    /* Enviar a la API (enrollments + users) — no bloquea si falla */
    try {
      await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'cursos' }),
      })
    } catch (x) { /* noop: guardado local como fallback */ }
    setDone(true)
  }

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
              <a className="btn btn-primary" onClick={() => goAnchor('inscripcion')}>INSCRIBIRME EN LA LISTA</a>
              <a className="btn btn-ghost" onClick={() => goAnchor('curriculum')}>VER PROGRAMA</a>
            </div>
            <div className="course-stats">
              <div className="cst"><strong data-count="6">0</strong><span>Módulos</span></div>
              <div className="cst"><strong data-count="24">0</strong><span>Lecciones</span></div>
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
              <p className="kicker">Programa · 4 niveles</p>
              <h2>El temario completo</h2>
              <p>Elige el nivel del Curso Brunetti. Toca cada módulo para ver sus lecciones.</p>
            </div>
            <div className="course-levels" data-reveal>
              {LEVELS.map((lv, i) => (
                <button key={lv.key} type="button" className={`course-level${i === level ? ' is-active' : ''}`} onClick={() => { setLevel(i); setOpenIdx(0) }}>
                  <span className="cl-n">{lv.name}</span>
                  <span className="cl-s">{lv.sub}</span>
                </button>
              ))}
            </div>
            <p className="course-level-desc" data-reveal>{activeLevel.desc}</p>
            <div className="modules">
              {activeLevel.modules.map((m, i) => {
                const num = (i + 1 < 10 ? '0' : '') + (i + 1)
                const open = openIdx === i
                return (
                  <article className={`module${open ? ' is-open' : ''}`} data-reveal style={{ '--i': i % 3 }} key={m.t}>
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
            <div className="shared-note" data-reveal>
              <svg viewBox="0 0 24 24"><path d="M22 12.6V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l2 3h8a2 2 0 0 1 2 2z" /></svg>
              <span>El material en video de los 6 módulos se comparte por Google Drive una vez confirmada tu inscripción. <a href="https://drive.google.com/drive/folders/1SN4IGz9T92e2vsNC9a1rALVXr83YL8aL" target="_blank" rel="noopener noreferrer">Ver carpeta del curso →</a></span>
            </div>
          </div>
        </section>

        {/* ============ INSCRIPCIÓN ============ */}
        <section className="bsection bsection-lamp" id="inscripcion">
          <Lamp className="bru-lamp--sec" />
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">Cupos limitados</p>
              <h2>Inscríbete en la lista de espera</h2>
              <p>Deja tus datos y te avisamos apenas se abra el próximo grupo del Curso Brunetti.</p>
            </div>
            <div className="enroll">
              <aside className="enroll-aside" data-reveal="left">
                <h3>Curso Brunetti</h3>
                <p>Formación completa en visagismo, técnica de barbería, dirección de estilo y marca personal — el método de Bruno Herrera.</p>
                <ul className="bcontact-list">
                  <li><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>6 módulos · 24 lecciones en video</li>
                  <li><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>Acceso al material compartido</li>
                  <li><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>Enfoque en visagismo y marca personal</li>
                </ul>
                <div className="price-row"><b>Próximo grupo</b></div>
                <p className="enroll-note">Te contactaremos por teléfono o email con valores, fechas y forma de pago al abrir cupos.</p>
              </aside>

              <form className="enroll-form" data-reveal="right" noValidate onSubmit={onSubmit}>
                <div className="frow">
                  <label htmlFor="f-name">Nombre completo</label>
                  <input type="text" id="f-name" name="name" placeholder="Tu nombre" value={form.name} onChange={onChange} required />
                </div>
                <div className="frow two">
                  <div className="frow">
                    <label htmlFor="f-phone">Teléfono</label>
                    <input type="tel" id="f-phone" name="phone" placeholder="9 1234 5678" value={form.phone} onChange={onChange} required />
                  </div>
                  <div className="frow">
                    <label htmlFor="f-email">Email</label>
                    <input type="email" id="f-email" name="email" placeholder="tu@email.com" value={form.email} onChange={onChange} required />
                  </div>
                </div>
                <div className="frow">
                  <label htmlFor="f-level">Nivel de experiencia</label>
                  <select id="f-level" name="level" value={form.level} onChange={onChange}>
                    <option value="">Selecciona una opción</option>
                    <option>Estoy empezando</option>
                    <option>Barbero con experiencia</option>
                    <option>Profesional buscando especializarme</option>
                    <option>Creador / figura pública</option>
                  </select>
                </div>
                <div className="frow">
                  <label htmlFor="f-msg">¿Qué te gustaría lograr? (opcional)</label>
                  <textarea id="f-msg" name="message" placeholder="Cuéntale a Bruno tu objetivo..." value={form.message} onChange={onChange} />
                </div>
                {!done && <button className="btn btn-primary" type="submit">UNIRME A LA LISTA DE ESPERA</button>}
                {error && <p className="enroll-note" style={{ color: '#e11d48' }}>Revisa los campos requeridos.</p>}
                <div className={`enroll-success${done ? ' show' : ''}`}>
                  <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
                  <span><b>¡Listo!</b> Quedaste en la lista de espera. Bruno te contactará pronto.</span>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <ModuleFooter
        links={[
          [() => goAnchor('curriculum'), 'Programa'],
          [() => goAnchor('inscripcion'), 'Inscripción'],
          [() => goHomeSection('visagismo'), 'Visagismo'],
          [() => navigate('/workshop'), 'Workshop'],
          [() => goHomeSection('contacto'), 'Contacto'],
        ]}
        onPrimary={() => goAnchor('inscripcion')}
        primaryLabel="Inscribirme"
      />
    </div>
  )
}
