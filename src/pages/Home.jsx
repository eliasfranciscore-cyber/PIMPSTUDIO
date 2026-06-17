import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Emblem, Brandmark, Icon, Reveal, SectionHead } from '../components/ui.jsx'
import SiteNav from '../components/SiteNav.jsx'
import { SERVICES, BARBERS, CAT_LABEL, CLP, tne } from '../data.js'
import { FEATURE_CARDS, TESTIMONIALS, WORKSHOP_HIGHLIGHTS } from '../data/workshop.js'
import { FeatureCarousel, ImageCompare, LampBanner, Testimonials } from '../components/liquidShowcase.jsx'
import BarberShowcase from '../components/BarberShowcase.jsx'

const HERO_STATS = [["15+", "Años"], ["5.000+", "Clientes"], ["8", "Barberos"], ["4.9★", "Rating"]]
const WORKSHOP_PILLS = ["Grabación", "Edición", "Marca personal"]

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [services, setServices] = useState(SERVICES)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => { if (data.services?.length) setServices(data.services.filter((item) => item.active !== false)) })
      .catch(() => {})
  }, [])

  const scrollTo = (id) => {
    const target = document.getElementById(`sec-${id}`)
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" })
  }

  // Al llegar desde otra página (p. ej. Workshop) con un destino de sección, hacer scroll a él.
  useEffect(() => {
    const section = location.state?.section
    if (!section) return
    const t = setTimeout(() => scrollTo(section), 180)
    return () => clearTimeout(t)
  }, [location.state])

  const groups = ["general", "premium", "quimico"]

  return (
    <div className="home-scroll" style={{ position: "relative" }}>
      <SiteNav onSection={scrollTo} />

      <section className="home-hero">
        <div className="home-hero-media">
          <img src="/assets/gallery-1.jpg" alt="PIMP STUDIO" />
        </div>
        <div className="home-hero-overlay" />
        <div className="home-hero-layout">
          <Reveal className="home-hero-copy" style={{ position: "relative" }}>
            <div className="home-hero-badge">
              <img src="/assets/pimp-studio-logo.jpg" alt="PIMP STUDIO Logo" />
              <span className="eyebrow">Maipú · Santiago de Chile</span>
            </div>
            <h1 className="font-display">Barbería premium con agenda rápida y presencia real.</h1>
            <p>
              PIMP STUDIO combina técnica, detalle y una experiencia más limpia desde el primer clic.
              Reserva en segundos, elige tu barbero y encuentra el servicio correcto sin ruido.
            </p>
            <div className="home-hero-actions">
              <button className="btn btn-gold" onClick={() => navigate("/login")}><Icon name="calendar" size={16} /> Reservar cita</button>
              <button className="btn btn-ghost" onClick={() => scrollTo("servicios")}>Ver servicios</button>
            </div>
          </Reveal>

          <Reveal className="home-hero-aside card" style={{ position: "relative" }}>
            <span className="eyebrow">Experiencia PIMP</span>
            <h2 className="font-display">Más aire, mejor lectura, decisiones rápidas.</h2>
            <p>La web pública muestra lo esencial: servicios, equipo, ubicación y workshop, con un recorrido comercial claro.</p>
            <div className="home-stat-grid">
              {HERO_STATS.map(([n, l]) => (
                <div key={l}>
                  <strong className="font-display gold-text">{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <LampBanner
        kicker="Maipú · Barbería Premium"
        title="Donde cada corte se ve como una obra bien dirigida."
        text="Técnica de precisión, color profesional y una experiencia pensada al detalle. Reserva tu hora y descubre por qué PIMP STUDIO se siente distinto desde la primera pantalla."
      />

      <section id="sec-servicios" className="home-section">
        <SectionHead center eyebrow="Carta de servicios" title="Servicios y precios" sub="Reserva directo desde cualquier servicio. Descuento TNE 20% en servicios generales presentando Tarjeta Nacional Estudiantil." />
        {groups.map((g) => {
          const items = services.filter((s) => s.cat === g)
          return (
            <div key={g} style={{ marginBottom: "2.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: "1.1rem", maxWidth: 1160, marginInline: "auto" }}>
                {g === "premium" && <span className="chip chip-gold"><Icon name="star" size={13} /> Brunetti</span>}
                <h3 className="font-display" style={{ margin: 0, fontSize: "1.05rem", letterSpacing: ".05em", color: g === "premium" ? "var(--gold-lt)" : "var(--ink)" }}>{CAT_LABEL[g]}</h3>
                <span className="hair" style={{ flex: 1 }} />
              </div>
              <Reveal stagger className="home-services-grid">
                {items.map((s) => (
                  <button key={s.id} onClick={() => navigate("/login")} className="svc-card card glowing-card home-service-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: ".5rem" }}>
                      <span className="font-display" style={{ fontWeight: 600, fontSize: "1.08rem" }}>{s.name}</span>
                      <span style={{ color: "var(--muted)", flexShrink: 0 }}><Icon name="cut" size={18} /></span>
                    </div>
                    <p>{s.desc}</p>
                    <div className="home-service-meta">
                      <span className="font-display gold-text">{CLP(s.price)}</span>
                      <span className="chip"><Icon name="clock" size={12} /> {s.min} min</span>
                    </div>
                    {s.tne && <span className="home-service-note">Con TNE: {CLP(tne(s.price))}</span>}
                    <span className="home-service-link">Reservar <Icon name="arrowRight" size={13} /></span>
                  </button>
                ))}
              </Reveal>
            </div>
          )
        })}
      </section>

      <FeatureCarousel items={FEATURE_CARDS} />

      <ImageCompare
        beforeSrc="/assets/gallery-1.jpg"
        afterSrc="/assets/gallery-3.jpg"
      />

      <Testimonials items={TESTIMONIALS} />

      <BarberShowcase />

      <section id="sec-workshop" className="home-section">
        <div className="workshop-teaser">
          <Reveal className="workshop-teaser-copy">
            <span className="eyebrow">Workshop</span>
            <h2 className="font-display">Contenido que vende para barberos que quieren verse premium y agendar mejor.</h2>
            <p>
              Reemplazamos la antigua galería por una pieza útil: una invitación clara al workshop de marca personal,
              grabación y edición diseñado para barbería real.
            </p>
            <div className="workshop-pill-row">
              {WORKSHOP_PILLS.map((item) => <span key={item} className="chip">{item}</span>)}
            </div>
            <div className="home-hero-actions">
              <button className="btn btn-gold" onClick={() => navigate("/workshop")}><Icon name="spark" size={16} /> Ver workshop</button>
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>Reservar cita</button>
            </div>
          </Reveal>
          <Reveal className="workshop-teaser-rail">
            <div className="workshop-teaser-quote">
              <span className="eyebrow">Enfoque</span>
              <p>Tu técnica ya existe. El workshop trabaja cómo mostrarla, venderla y sostenerla con contenido consistente.</p>
            </div>
            <div className="workshop-teaser-list">
              {WORKSHOP_HIGHLIGHTS.map((item) => (
                <div key={item}>
                  <Icon name="check" size={15} color="var(--gold)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sec-nosotros" className="home-section">
        <div className="home-about-grid">
          <Reveal style={{ display: "grid", gap: "1rem" }}>
            <span className="eyebrow">Nosotros</span>
            <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 600, lineHeight: 1.03 }}>Barbería tradicional, criterio contemporáneo.</h2>
            <span style={{ width: 64, height: 2, background: "var(--gold-grad)" }} />
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              En PIMP STUDIO combinamos el arte de la barbería clásica con una experiencia más refinada:
              atención personalizada, técnica sólida y una estética que se cuida tanto en el sillón como en pantalla.
            </p>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              <span className="chip chip-gold"><Icon name="check" size={13} /> Atención personalizada</span>
              <span className="chip"><Icon name="check" size={13} /> Productos premium</span>
            </div>
          </Reveal>
          <Reveal className="card home-about-stats">
            {[["15+", "Años de experiencia"], ["5.000+", "Clientes satisfechos"], ["6 días", "Abierto a la semana"], ["Premium", "Servicio de calidad"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display gold-text">{n}</div>
                <div>{l}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="sec-ubicacion" className="home-section">
        <SectionHead center eyebrow="Cómo llegar" title="Ubicación" sub="A pasos del Metro Plaza de Maipú (Línea 5)." />
        <div className="home-location-grid">
          <div className="home-map-frame">
            <iframe
              title="Mapa PIMP STUDIO"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.5!2d-70.758!3d-33.512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMonumento+1750+Local+C+Maip%C3%BA!5e0!3m2!1ses!2scl!4v1"
              width="100%"
              height="320"
              style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="card home-location-card">
            {[["pin", "Monumento 1750, Local C, Maipú"], ["phone", "+56 9 1234 5678"], ["clock", "Lun a Sáb · 10:00 – 20:00"], ["clock", "Domingo · Cerrado"]].map(([ic, tx], i) => (
              <div key={i} style={{ display: "flex", gap: ".8rem", alignItems: "center", color: "var(--ink-soft)" }}>
                <span style={{ color: "var(--gold)" }}><Icon name={ic} size={18} /></span> {tx}
              </div>
            ))}
            <a href="https://maps.google.com/?q=Monumento+1750+Local+C+Maipu+Chile" target="_blank" rel="noopener noreferrer" className="btn btn-dark" style={{ marginTop: ".4rem", textDecoration: "none" }}>
              <Icon name="pin" size={15} /> Abrir en Google Maps
            </a>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-inner">
          <Emblem size={64} />
          <h2 className="font-display">Tu próximo corte te espera.</h2>
          <p>Inicia sesión solo con tu número de teléfono. Sin contraseñas.</p>
          <button className="btn btn-gold" onClick={() => navigate("/login")}><Icon name="calendar" size={16} /> Reservar ahora</button>
        </div>
      </section>

      <footer className="home-footer">
        <Brandmark size={34} />
        <span style={{ color: "var(--muted-2)", fontSize: ".8rem" }}>© 2026 PIMP STUDIO · Maipú, Chile</span>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
          <a className="home-footer-access" href="https://www.instagram.com/pimpstudiochile/" target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" size={13} /> @pimpstudiochile
          </a>
          <button className="home-footer-access" onClick={() => navigate("/ingreso")}>
            <Icon name="key" size={13} /> Acceso Barberos
          </button>
        </div>
      </footer>
    </div>
  )
}
