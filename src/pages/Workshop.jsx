import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Brandmark, Icon, Reveal } from '../components/ui.jsx'
import { LampBanner } from '../components/liquidShowcase.jsx'
import {
  WORKSHOP_HIGHLIGHTS,
  WORKSHOP_MODULES,
  WORKSHOP_TIMELINE,
  WORKSHOP_INCLUDES,
  WORKSHOP_DATES,
  WORKSHOP_VIDEOS,
} from '../data/workshop.js'

export default function Workshop() {
  const navigate = useNavigate()

  return (
    <div className="workshop-page">
      <header className="workshop-topbar">
        <button className="brand-link" onClick={() => navigate("/")}>
          <Brandmark size={34} sub="Workshop" />
        </button>
        <div className="workshop-topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>Volver al sitio</button>
          <button className="btn btn-gold btn-sm" onClick={() => navigate("/login")}><Icon name="calendar" size={14} /> Reservar</button>
        </div>
      </header>

      <main>
        <section className="workshop-hero">
          <div className="workshop-hero-lines" aria-hidden="true" />
          <Reveal className="workshop-hero-grid" style={{ maxWidth: 1180, marginInline: "auto" }}>
            <div className="workshop-hero-copy">
              <span className="eyebrow">Workshop de marca personal para barberos</span>
              <h1 className="font-display">Contenido que vende, agenda y posiciona.</h1>
              <p>
                Una jornada pensada para barberos que ya dominan la técnica y ahora necesitan verse premium,
                comunicar mejor y convertir más desde redes sociales.
              </p>
              <div className="workshop-hero-actions">
                <button className="btn btn-gold" onClick={() => navigate("/login")}><Icon name="calendar" size={16} /> Reservar sesión en PIMP</button>
                <a className="btn btn-ghost" href="#fechas">Ver próximas fechas</a>
              </div>
            </div>
            <div className="workshop-hero-panel">
              <div className="workshop-kicker">Edición barbería premium</div>
              <ul className="workshop-bullet-list">
                {WORKSHOP_HIGHLIGHTS.map((item) => (
                  <li key={item}><Icon name="check" size={15} color="var(--gold)" /> {item}</li>
                ))}
              </ul>
              <div className="workshop-price-card">
                <span className="workshop-price-label">Inversión</span>
                <strong className="font-display">$97.000</strong>
                <span>Un cliente premium bien cerrado puede pagar esta formación.</span>
              </div>
            </div>
          </Reveal>
        </section>

        <LampBanner
          kicker="Workshop de marca personal para barberos"
          title="Aprende a grabar, editar y vender mejor tu trabajo."
          text="La edición barbería premium toma lo más importante del ZIP: lámparas doradas, dirección visual fuerte y una landing enfocada en conversión real."
        />

        <section className="workshop-section">
          <Reveal className="workshop-section-intro" style={{ maxWidth: 920, marginInline: "auto" }}>
            <span className="eyebrow">Propuesta de valor</span>
            <h2 className="font-display">No es un curso genérico de contenido. Es una guía diseñada para barbería real.</h2>
            <p>
              Todo está aterrizado al ritmo de un salón: grabar sin perder operación, editar sin bloquearte y
              construir piezas que sí ayuden a elevar ticket, confianza y visibilidad.
            </p>
          </Reveal>
        </section>

        <section className="workshop-section workshop-section-alt">
          <div className="workshop-module-grid">
            {WORKSHOP_MODULES.map((module) => (
              <Reveal key={module.title} className="workshop-module-card card">
                <span className="workshop-card-tag">Módulo</span>
                <h3 className="font-display">{module.title}</h3>
                <ul>
                  {module.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="workshop-section">
          <div className="workshop-split">
            <Reveal className="workshop-timeline card">
              <span className="eyebrow">Cronograma</span>
              <h2 className="font-display">Estructura del día</h2>
              <div className="workshop-time-list">
                {WORKSHOP_TIMELINE.map((item) => (
                  <div key={item.time} className="workshop-time-row">
                    <strong className="font-display">{item.time}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="workshop-includes">
              <span className="eyebrow">Qué incluye</span>
              <h2 className="font-display">Te llevas estructura, criterio y herramientas listas para usar.</h2>
              <div className="workshop-include-grid">
                {WORKSHOP_INCLUDES.map((item) => (
                  <div key={item} className="workshop-include-card">
                    <Icon name="spark" size={16} color="var(--gold)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="fechas" className="workshop-section workshop-price-band">
          <Reveal className="workshop-price-band-inner" style={{ maxWidth: 1120, marginInline: "auto" }}>
            <div>
              <span className="eyebrow">Próximas fechas</span>
              <h2 className="font-display">Cuposes limitados para mantener feedback real y trabajo práctico.</h2>
            </div>
            <div className="workshop-date-grid">
              {WORKSHOP_DATES.map((item) => (
                <article key={item.title} className="workshop-date-card">
                  <h3 className="font-display">{item.title}</h3>
                  <p>{item.date}</p>
                  <p>{item.location}</p>
                  <div className="workshop-date-meta">
                    <span>{item.seats}</span>
                    <strong>{item.price}</strong>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="workshop-section">
          <Reveal className="workshop-video-head" style={{ maxWidth: 920, marginInline: "auto" }}>
            <span className="eyebrow">Recursos previos</span>
            <h2 className="font-display">Videotutoriales y material de preparación.</h2>
          </Reveal>
          <div className="workshop-video-grid">
            {WORKSHOP_VIDEOS.map((item, index) => (
              <Reveal key={item.title} className="workshop-video-card">
                <div className="workshop-video-thumb">
                  <span>{index + 1}</span>
                  <Icon name="spark" size={22} color="var(--gold)" />
                </div>
                <h3 className="font-display">{item.title}</h3>
                <p>{item.description}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
