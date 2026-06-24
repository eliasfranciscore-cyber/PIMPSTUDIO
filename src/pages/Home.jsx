import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBrunettiFx, scrollToId } from '../components/brunetti.jsx'
import SiteNav from '../components/SiteNav.jsx'
import ModuleFooter from '../components/ModuleFooter.jsx'
import GooeyText from '../components/GooeyText.jsx'

/* ============================================================
   BRUNETTI — Landing de marca personal (Bruno Herrera)
   Recreación 1:1 del design handoff en React.
   ============================================================ */

const PILLARS = [
  {
    num: '01', title: 'Análisis de fisonomía facial',
    body: 'Estudiamos la forma de tu rostro, proporciones y rasgos para entender qué líneas, volúmenes y largos te favorecen realmente.',
    icon: (<><circle cx="12" cy="12" r="9" /><path d="M9 10h.01M15 10h.01M8.5 15c1 1 2.2 1.4 3.5 1.4s2.5-.4 3.5-1.4" /></>),
  },
  {
    num: '02', title: 'Dirección de estilo personal',
    body: 'Definimos una imagen coherente con tu personalidad, tu trabajo y tu día a día — no una tendencia pasajera.',
    icon: (<path d="M12 3v18M5 8l7-5 7 5M5 8v8l7 5 7-5V8" />),
  },
  {
    num: '03', title: 'Cortes a medida según tu rostro',
    body: 'Técnica de precisión aplicada a tu fisonomía: cada degradado, textura y línea trabaja a favor de tus rasgos.',
    icon: (<path d="M14 4l6 6M3 21l3-1 11-11-2-2L4 18z" />),
  },
  {
    num: '04', title: 'Transformación de imagen completa',
    body: 'Un cambio integral pensado para elevar cómo te ves y cómo te sientes, con seguimiento y recomendaciones.',
    icon: (<><path d="M3 12a9 9 0 1 0 9-9M3 12l3-3M3 12l3 3" /><path d="M12 8v4l3 2" /></>),
  },
  {
    num: '05', title: 'Asesoría para creadores y figuras públicas',
    body: 'Imagen pensada para cámara y contenido: una identidad visual reconocible que potencia tu marca personal.',
    icon: (<><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></>),
  },
]

const SERVICES = [
  { id: 10, tag: 'Visagismo', featured: true, title: 'Asesoría de Imagen — Visagista', desc: 'Consulta personalizada donde analizamos tu fisonomía, estilo de vida y objetivos para definir el corte y la imagen que te representan.', price: '$39.990', dur: '120 min', cta: 'Reservar asesoría' },
  { id: 11, tag: 'Corte', title: 'Corte de cabello', desc: 'Corte de precisión ejecutado con técnicas avanzadas, pensado para favorecer tus rasgos y tu estilo.', price: '$19.990', dur: '60 min', cta: 'Reservar corte' },
  { id: 12, tag: 'Corte + Barba', title: 'Corte de cabello y barba', desc: 'Servicio premium completo: corte a medida y perfilado de barba para un acabado impecable y armónico.', price: '$29.990', dur: '90 min', cta: 'Reservar combo' },
]

const CARDS = [
  { cat: 'Visagismo', title: 'Asesoría de Imagen Visagista', img: '/assets/bruno-feature.jpg', body: 'Una consulta personalizada con Bruno Herrera donde analizamos tu fisonomía, estilo de vida y objetivos para definir el corte y la imagen que realmente te representan. No es solo un corte: es una dirección de estilo.' },
  { cat: 'Corte', title: 'Corte a Medida', img: '/assets/gallery-1.jpg', body: 'Corte de precisión ejecutado con técnicas avanzadas y lectura del rostro. Definición limpia, transiciones cuidadas y un acabado pensado para favorecer tus rasgos.' },
  { cat: 'Corte + Barba', title: 'Perfilado de Barba', img: '/assets/gallery-2.jpg', body: 'Diseño y perfilado de barba con navaja y productos premium. Definimos líneas, simetría y textura para complementar tu rostro y tu corte.' },
  { cat: 'Transformación', title: 'Cambio de Imagen', img: '/assets/gallery-3.jpg', body: 'Un cambio integral de imagen pensado para elevar cómo te ves y cómo te sientes, con recomendaciones de mantenimiento y estilo a futuro.' },
  { cat: 'Formación', title: 'Curso Profesional', img: '/assets/workshop-2026.jpg', body: 'Programa de 6 módulos para barberos que quieren elevar su técnica, su imagen y su negocio. Visagismo, técnica, marca personal y contenido aplicables desde el primer día.' },
  { cat: 'Marca personal', title: 'Contenido de Marca', img: '/assets/bruno-portrait.jpg', body: 'Asesoría de imagen pensada para cámara y redes: una identidad visual reconocible que potencia tu marca personal como creador o figura pública.' },
]

const TESTIMONIALS = [
  { quote: 'Llegué sin saber qué corte me quedaba y salí con el mejor look de mi vida. La asesoría visagista de Bruno es otro nivel.', name: 'Matías Fuentes', role: 'Asesoría de imagen · Visagista', img: '/assets/bruno-feature.jpg' },
  { quote: 'Bruno no solo te corta el pelo, te dice qué te queda y por qué. Se nota que entiende de proporciones y de estilo.', name: 'Cristóbal Reyes', role: 'Corte de cabello y barba', img: '/assets/gallery-1.jpg' },
  { quote: 'Tomé su curso y cambió mi forma de trabajar. La parte de visagismo y de marca personal vale oro para cualquier barbero.', name: 'Ignacio Soto', role: 'Alumno · Curso Brunetti', img: '/assets/workshop-2026.jpg' },
  { quote: 'Atención impecable de principio a fin. El estudio se siente premium y la hora reservada siempre se respeta.', name: 'Felipe Carrasco', role: 'Cliente frecuente', img: '/assets/bruno-portrait.jpg' },
]

const NAME = 'BRUNETTI'.split('')

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState(null) // índice de CARDS o null
  const [tmIdx, setTmIdx] = useState(0)
  const [tmReveal, setTmReveal] = useState(0) // contador para re-disparar animación de palabras
  const trackRef = useRef(null)

  useBrunettiFx(rootRef)

  const goReserve = () => navigate('/reservar')
  const bookService = (id) => { try { localStorage.setItem('ps_pending_service', String(id)) } catch (e) {} navigate('/reservar') }
  const goCursos = () => navigate('/cursos')
  const goWorkshop = () => navigate('/workshop')

  const navTo = (id) => { setMenuOpen(false); scrollToId(id) }

  /* Llegada desde otra página (p. ej. /cursos) con sección destino. */
  useEffect(() => {
    const section = location.state?.section
    if (!section) return
    const t = setTimeout(() => scrollToId(section), 200)
    return () => clearTimeout(t)
  }, [location.state])

  /* ---- Testimonios: autoplay ---- */
  useEffect(() => {
    const t = setInterval(() => { setTmIdx((i) => (i + 1) % TESTIMONIALS.length); setTmReveal((r) => r + 1) }, 5200)
    return () => clearInterval(t)
  }, [])
  const tmGo = (dir) => { setTmIdx((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length); setTmReveal((r) => r + 1) }

  /* ---- Compare slider (drag + hover-follow) ---- */
  useEffect(() => {
    const frame = rootRef.current?.querySelector('#compare-frame')
    if (!frame) return
    const before = frame.querySelector('.cmp-before')
    const divider = frame.querySelector('.cmp-divider')
    const handle = frame.querySelector('.cmp-handle')
    let dragging = false
    const setPos = (p) => {
      const pos = Math.max(2, Math.min(98, p))
      before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`
      divider.style.left = pos + '%'
      handle.style.left = pos + '%'
    }
    const fromEvent = (e) => {
      const rect = frame.getBoundingClientRect()
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
      setPos((x / rect.width) * 100)
    }
    const down = (e) => { dragging = true; fromEvent(e) }
    const move = (e) => { if (dragging) fromEvent(e) }
    const up = () => { dragging = false }
    const hover = (e) => { if (!dragging) fromEvent(e) }
    frame.addEventListener('mousedown', down)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    frame.addEventListener('touchstart', down, { passive: true })
    frame.addEventListener('touchmove', move, { passive: true })
    frame.addEventListener('touchend', up)
    frame.addEventListener('mousemove', hover)
    setPos(50)
    return () => {
      frame.removeEventListener('mousedown', down)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      frame.removeEventListener('touchstart', down)
      frame.removeEventListener('touchmove', move)
      frame.removeEventListener('touchend', up)
      frame.removeEventListener('mousemove', hover)
    }
  }, [])

  /* ---- Carousel: cerrar modal con Escape + bloquear scroll ---- */
  useEffect(() => {
    if (modal === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setModal(null) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [modal])

  const scrollTrack = (dir) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.ac-card')
    const step = card ? card.offsetWidth + 16 : 300
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const marquee = (
    <span>
      <b>Análisis de fisonomía</b><span className="sep">✦</span>Dirección de estilo<span className="sep">✦</span>
      <b>Cortes a medida</b><span className="sep">✦</span>Transformación de imagen<span className="sep">✦</span>
      <b>Contenido de marca</b><span className="sep">✦</span>Formación profesional<span className="sep">✦</span>
    </span>
  )

  const tm = TESTIMONIALS[tmIdx]

  return (
    <div className="brunetti-site" ref={rootRef}>
      <div className="bg-blobs" aria-hidden="true">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>

      <SiteNav onSection={navTo} />

      <main>
        {/* ============ HERO ============ */}
        <section id="hero" className="bhero">
          <div className="bhero-lamp-wrap" aria-hidden="true">
            <div className="bhero-lamp-dot" />
            <div className="bhero-lamp-bar" />
            <div className="bhero-lamp-cone" />
          </div>
          <div className="bhero-grid">
            <div className="bhero-text">
              <span className="bhero-kicker"><span className="dot" />Visagista · Barbería Premium · Maipú</span>
              <h1 className="bhero-name bhero-morph" aria-label="Brunetti">
                <GooeyText texts={['Brunetti', 'Cutz']} />
              </h1>
              <p className="bhero-role">Bruno Herrera — <b>director de imagen &amp; visagista</b></p>
              <p className="bhero-sub">No es solo un corte: es leer tu rostro, tu estilo de vida y tu identidad para diseñar la imagen que realmente te representa. Técnica de precisión, dirección de estilo y una experiencia pensada al detalle.</p>
              <div className="bhero-actions">
                <a className="btn btn-primary" onClick={goReserve}>RESERVAR ASESORÍA</a>
                <a className="btn btn-ghost" onClick={goCursos}>VER CURSOS</a>
              </div>
              <div className="bhero-meta">
                <div className="stat"><strong>Visagista</strong><span>Especialista en rostro</span></div>
                <div className="stat"><strong>A medida</strong><span>Cada corte único</span></div>
                <div className="stat"><strong>Premium</strong><span>Experiencia completa</span></div>
              </div>
            </div>

            <div className="bhero-figwrap" data-parallax>
              <div className="bhero-figure" data-tilt>
                <a className="bhero-fig-link" href="https://instagram.com/brunetticutz" target="_blank" rel="noopener noreferrer" aria-label="Ver Instagram de @brunetticutz">
                  <img src="/assets/bruno-hero.jpg" alt="Bruno Herrera, Brunetti — visagista" fetchpriority="high" decoding="async" />
                </a>
                <div className="fig-tag">
                  <b>Bruno Herrera</b>
                  <span>@brunetticutz</span>
                </div>
              </div>
              <div className="bhero-chip c1">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
                Asesoría de imagen 1:1
              </div>
              <div className="bhero-chip c2">
                <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21l2.3-7.2-6-4.4h7.6z" /></svg>
                Visagismo profesional
              </div>
            </div>
          </div>

          <div className="bhero-cue">
            <span>Desliza</span>
            <div className="mouse" />
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="bmarquee" aria-hidden="true">
          <div className="bmarquee-track">{marquee}{marquee}</div>
        </div>

        {/* ============ VISAGISMO ============ */}
        <section id="visagismo" className="bsection">
          <div className="bwrap">
            <div className="bhead" data-reveal>
              <p className="kicker">El método Brunetti</p>
              <h2>Visagismo: el arte de cortar para tu rostro, no para la moda</h2>
              <p>Cada rostro tiene proporciones, líneas y rasgos únicos. El visagismo estudia esa fisonomía para diseñar un corte y una imagen que armonicen contigo. Esto es lo que trabajamos en cada asesoría.</p>
            </div>
            <div className="visagismo-grid">
              {PILLARS.map((p, i) => (
                <article className="pillar" data-reveal style={{ '--i': i }} key={p.num}>
                  <div className="picon"><svg viewBox="0 0 24 24">{p.icon}</svg></div>
                  <div>
                    <span className="num">{p.num}</span>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SOBRE BRUNO ============ */}
        <section id="sobre" className="bsection">
          <div className="bsec-lamp-wrap" aria-hidden="true">
            <div className="bsec-lamp-dot" />
            <div className="bsec-lamp-bar" />
            <div className="bsec-lamp-cone" />
          </div>
          <div className="bwrap babout">
            <figure className="babout-figure" data-reveal="left">
              <img src="/assets/workshop-2026.jpg" alt="Bruno Herrera con su comunidad de barberos" loading="lazy" decoding="async" />
              <figcaption className="sig">Bruno Herrera · Brunetti</figcaption>
            </figure>
            <div className="babout-body" data-reveal="right">
              <p className="kicker" style={{ letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.72rem', color: 'var(--gold-bright)', margin: '0 0 0.8rem' }}>Sobre Bruno</p>
              <h2>Pasión por la barbería, obsesión por el detalle</h2>
              <p><span className="lead">Bruno es un visagista premium apasionado por la barbería.</span> Su trabajo va más allá del corte: combina técnica, lectura del rostro y dirección de estilo para transformar la imagen de cada persona que se sienta en su silla.</p>
              <p>Además de atender en el estudio, Bruno dicta cursos personalizados y comparte su conocimiento con la nueva generación de barberos. Crecimiento personal, contenido de marca y enseñanza son parte de su sello: cree en formar profesionales, no solo en hacer cortes.</p>
              <div className="babout-stats">
                <div className="st"><strong data-count="6">0</strong><span>Módulos de curso</span></div>
                <div className="st"><strong data-count="5">0</strong><span>Pilares de visagismo</span></div>
                <div className="st"><strong data-count="100" data-suffix="%">0</strong><span>Diseño a medida</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICIOS ============ */}
        <section id="servicios" className="bsection">
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">Reserva con Bruno</p>
              <h2>Servicios Brunetti</h2>
              <p>Atención personalizada de principio a fin. Reserva directamente tu hora con Bruno Herrera.</p>
            </div>
            <div className="bserv-grid">
              {SERVICES.map((s, i) => (
                <article className={`bserv${s.featured ? ' featured' : ''}`} data-reveal style={{ '--i': i }} key={s.title}>
                  {s.featured && <span className="badge">Insignia</span>}
                  <span className="stag">{s.tag}</span>
                  <h3>{s.title}</h3>
                  <p className="desc">{s.desc}</p>
                  <div className="meta">
                    <span className="price">{s.price}</span>
                    <span className="dur">{s.dur}</span>
                  </div>
                  <a className="book" onClick={() => bookService(s.id)}>{s.cta}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TRANSFORMACIONES ============ */}
        <section className="feature-section compare-section" id="transformaciones">
          <div className="feature-head" data-reveal>
            <p className="kicker">Antes / Después</p>
            <h2>La transformación Brunetti</h2>
            <p>Arrastra el control para ver el cambio. Así se ve la diferencia de un trabajo leído al rostro.</p>
          </div>
          <div className="compare" data-reveal="scale">
            <div className="cmp-frame" id="compare-frame">
              <img className="cmp-img cmp-after" src="/assets/gallery-3.jpg" alt="Después del corte" loading="lazy" decoding="async" />
              <img className="cmp-img cmp-before" src="/assets/gallery-1.jpg" alt="Antes del corte" loading="lazy" decoding="async" />
              <span className="cmp-tag before">Antes</span>
              <span className="cmp-tag after">Después</span>
              <div className="cmp-divider" />
              <div className="cmp-handle">
                <svg viewBox="0 0 24 24"><path d="M8 7l-4 5 4 5M16 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </section>

        {/* ============ EXPERIENCIAS (carousel) ============ */}
        <section className="feature-section apple-carousel" id="experiencias">
          <div className="feature-head" data-reveal>
            <p className="kicker">Explora</p>
            <h2>El trabajo de Brunetti</h2>
            <p>Desliza para conocer cada servicio. Toca cualquier tarjeta para ver el detalle.</p>
          </div>
          <div className="ac-arrows">
            <button className="ac-arrow" type="button" aria-label="Anterior" onClick={() => scrollTrack(-1)}>
              <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="ac-arrow" type="button" aria-label="Siguiente" onClick={() => scrollTrack(1)}>
              <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="ac-track" ref={trackRef}>
            {CARDS.map((c, i) => (
              <article className="ac-card" tabIndex={0} key={c.title}
                onClick={() => setModal(i)}
                onKeyDown={(e) => { if (e.key === 'Enter') setModal(i) }}>
                <img src={c.img} alt={c.title} loading="lazy" />
                <div className="ac-text"><p className="ac-cat">{c.cat}</p><h3 className="ac-title">{c.title}</h3></div>
              </article>
            ))}
          </div>
        </section>

        {/* ============ CURSOS TEASER ============ */}
        <section className="bsection" id="cursos-teaser">
          <div className="bsec-lamp-wrap" aria-hidden="true">
            <div className="bsec-lamp-dot" />
            <div className="bsec-lamp-bar" />
            <div className="bsec-lamp-cone" />
          </div>
          <div className="bwrap">
            <div className="bteaser" data-reveal="scale">
              <div className="bteaser-bg"><img src="/assets/workshop-2026.jpg" alt="Workshop Brunetti con su comunidad de barberos" loading="lazy" decoding="async" /></div>
              <div className="bteaser-inner">
                <p className="kicker">Formación profesional</p>
                <h2>Aprende visagismo y barbería con Bruno</h2>
                <p>Un programa pensado para barberos que quieren elevar su técnica, su imagen y su negocio. Teoría, práctica y dirección de estilo aplicables desde el primer día.</p>
                <div className="bteaser-modchips">
                  <span>6 módulos completos</span>
                  <span>Teoría + práctica</span>
                  <span>Certificado</span>
                </div>
                <a className="btn btn-primary" onClick={goCursos}>VER CURSO &amp; INSCRIBIRME</a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIOS ============ */}
        <section className="feature-section testimonials-section" id="opiniones">
          <div className="feature-head" data-reveal>
            <p className="kicker">Opiniones</p>
            <h2>Lo que dicen sus clientes</h2>
          </div>
          <div className="testimonials" data-reveal>
            <div className="tm-stage">
              {TESTIMONIALS.map((t, i) => (
                <figure className={`tm-photo${i === tmIdx ? ' is-active' : ''}${i === (tmIdx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length ? ' is-prev' : ''}`} key={t.name}>
                  <img src={t.img} alt={`Cliente Brunetti: ${t.name}`} loading="lazy" />
                </figure>
              ))}
            </div>
            <div className="tm-body">
              <p className="tm-quote" key={tmReveal}>
                {tm.quote.split(' ').map((w, i) => (
                  <TmWord key={i} delay={40 + i * 24}>{w}</TmWord>
                ))}
              </p>
              <div className="tm-meta">
                <strong className="tm-name">{tm.name}</strong>
                <span className="tm-role">{tm.role}</span>
              </div>
              <div className="tm-controls">
                <button className="tm-btn" type="button" aria-label="Anterior" onClick={() => tmGo(-1)}>
                  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button className="tm-btn" type="button" aria-label="Siguiente" onClick={() => tmGo(1)}>
                  <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CONTACTO ============ */}
        <section id="contacto" className="bsection">
          <div className="bwrap">
            <div className="bhead center" data-reveal>
              <p className="kicker">Hablemos</p>
              <h2>Contacto &amp; reservas</h2>
              <p>Agenda tu hora con Bruno o escríbele directo. La transformación parte por una conversación.</p>
            </div>
            <div className="bcontact-grid">
              <div className="bcard" data-reveal="left">
                <h3>Brunetti Studio</h3>
                <ul className="bcontact-list">
                  <li><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Lunes a Sábado · 10:00 – 20:00</li>
                  <li><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg><a href="tel:+56912345678">(+56) 9 1234 5678</a></li>
                  <li><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg><a href="mailto:hola@brunetti.cl">hola@brunetti.cl</a></li>
                </ul>
                <div className="bcontact-actions" style={{ marginTop: '1.4rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <a className="btn btn-primary" onClick={goReserve}>RESERVAR HORA</a>
                  <a className="btn btn-ghost" onClick={goCursos}>VER CURSOS</a>
                </div>
              </div>
              <div className="bsocial" data-reveal="right">
                <a className="bwa-btn" href="https://wa.me/56912345678?text=Hola%20Bruno%2C%20quiero%20agendar%20una%20hora." target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                  Escríbele por WhatsApp
                </a>
                <a className="bsocial-ig" href="https://instagram.com/brunetticutz" target="_blank" rel="noopener noreferrer">
                  <span className="ig-ic">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" /></svg>
                  </span>
                  <span>
                    <b>@brunetticutz</b>
                    <span>Síguelo en Instagram</span>
                  </span>
                </a>
                <div className="bcard" style={{ padding: '1.2rem' }}>
                  <p style={{ margin: 0, color: 'var(--ink-2)', lineHeight: 1.6 }}>¿Eres barbero y quieres formarte? El módulo de <a onClick={goCursos} style={{ color: 'var(--gold-bright)', cursor: 'pointer' }}>Cursos</a> tiene toda la información e inscripción.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <ModuleFooter
        links={[
          [() => navTo('visagismo'), 'Visagismo'],
          [() => navTo('servicios'), 'Servicios'],
          [goCursos, 'Cursos'],
          [goWorkshop, 'Workshop'],
          [() => navTo('contacto'), 'Contacto'],
        ]}
        onPrimary={goReserve}
        primaryLabel="Reservar hora"
      />

      {/* Botón flotante de reserva — siempre visible en móvil */}
      <a className="bfloat-reserve" onClick={goReserve} aria-label="Reservar hora">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        RESERVAR
      </a>

      {/* ============ MODAL CARRUSEL ============ */}
      <div className={`ac-modal${modal !== null ? ' is-open' : ''}`} role="dialog" aria-modal="true">
        <div className="ac-modal-scrim" onClick={() => setModal(null)} />
        <div className="ac-modal-card">
          <button className="ac-close" type="button" aria-label="Cerrar" onClick={() => setModal(null)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
          {modal !== null && (
            <>
              <img className="ac-m-img" src={CARDS[modal].img} alt={CARDS[modal].title} />
              <div className="ac-modal-body">
                <p className="ac-cat">{CARDS[modal].cat}</p>
                <h3>{CARDS[modal].title}</h3>
                <p className="ac-m-body-text">{CARDS[modal].body}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* Palabra de testimonio: entra con blur/translate (efecto word-by-word). */
function TmWord({ children, delay }) {
  const [pre, setPre] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setPre(false), delay)
    return () => clearTimeout(t)
  }, [delay])
  return <span className={pre ? 'pre' : ''}>{children} </span>
}
