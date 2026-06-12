import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emblem, Brandmark, Icon, Reveal, SectionHead } from '../components/ui.jsx'
import { SERVICES, BARBERS, CAT_LABEL, CLP, tne } from '../data.js'

export default function Home() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 60)
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (id) => {
    const cont = scrollRef.current
    const target = cont && cont.querySelector(`#sec-${id}`)
    if (cont && target) cont.scrollTo({ top: target.offsetTop - 64, behavior: "smooth" })
  }

  const groups = ["general", "premium", "quimico"]
  const nav = [["servicios", "Servicios"], ["barberos", "Barberos"], ["galeria", "Galería"], ["nosotros", "Nosotros"], ["ubicacion", "Ubicación"]]

  return (
    <div ref={scrollRef} className="home-scroll" style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", position: "relative" }}>
      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem clamp(1rem,4vw,2.4rem)",
        background: scrolled ? "rgba(8,8,7,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--hair)" : "1px solid transparent",
        transition: "all .35s ease",
      }}>
        <Brandmark size={38} />
        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(.5rem,1.5vw,1.6rem)" }}>
          {nav.map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="nav-link" style={{
              background: "none", border: 0, color: "var(--ink-soft)", fontSize: ".82rem",
              letterSpacing: ".04em", padding: ".3rem 0", display: "none",
            }}>{label}</button>
          ))}
          <style>{`@media(min-width:900px){.home-scroll .nav-link{display:inline-block !important;} .home-scroll .nav-link:hover{color:var(--gold-lt);}}`}</style>
          <button className="btn btn-gold btn-sm" onClick={() => navigate("/login")}><Icon name="calendar" size={14} /> Reservar</button>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "92vh", display: "grid", placeItems: "center", textAlign: "center", padding: "3rem 1.5rem 5rem", marginTop: -64 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src="/assets/gallery-1.jpg" alt="PIMP STUDIO" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.35 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 600px at 50% 18%, rgba(201,161,78,0.12), transparent 60%), linear-gradient(180deg, rgba(8,8,7,0.55) 0%, rgba(8,8,7,0.78) 55%, var(--bg) 100%)" }} />
        <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: "1.3rem" }}>
          <div className="float animate-scale">
            <img src="/assets/pimp-studio-logo.jpg" alt="PIMP STUDIO Logo" style={{ width: 104, height: 104, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--gold-line)", boxShadow: "var(--shadow-gold)" }} />
          </div>
          <span className="eyebrow animate-up" style={{ animationDelay: ".1s" }}>Maipú · Santiago de Chile</span>
          <h1 className="font-display animate-up" style={{ margin: 0, fontSize: "clamp(2.6rem,7vw,5rem)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.04, animationDelay: ".16s" }}>
            PIMP <span className="gold-text">STUDIO</span>
          </h1>
          <p className="animate-up" style={{ margin: 0, color: "var(--ink-soft)", fontSize: "clamp(1rem,2vw,1.3rem)", maxWidth: 540, animationDelay: ".24s" }}>
            Donde el estilo se encuentra con la excelencia. Barbería premium, reservas en segundos.
          </p>
          <div className="animate-up" style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", justifyContent: "center", marginTop: ".4rem", animationDelay: ".32s" }}>
            <button className="btn btn-gold" onClick={() => navigate("/login")}><Icon name="calendar" size={16} /> Reservar cita</button>
            <button className="btn btn-ghost" onClick={() => scrollTo("servicios")}>Ver servicios</button>
          </div>
          <div style={{ display: "flex", gap: "1.8rem", marginTop: "1.6rem", flexWrap: "wrap", justifyContent: "center" }}>
            {[["15+", "Años"], ["5.000+", "Clientes"], ["8", "Barberos"], ["4.9★", "Rating"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div className="font-display gold-text" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="sec-servicios" style={{ padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
        <SectionHead center eyebrow="Carta de servicios" title="Servicios y precios" sub="Reserva directo desde cualquier servicio. Descuento TNE 20% en servicios generales presentando Tarjeta Nacional Estudiantil." />
        {groups.map((g) => {
          const items = SERVICES.filter((s) => s.cat === g)
          return (
            <div key={g} style={{ marginBottom: "2.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: "1.1rem", maxWidth: 1000, marginInline: "auto" }}>
                {g === "premium" && <span className="chip chip-gold"><Icon name="star" size={13} /> Brunetti</span>}
                <h3 className="font-display" style={{ margin: 0, fontSize: "1.05rem", letterSpacing: ".05em", color: g === "premium" ? "var(--gold-lt)" : "var(--ink)" }}>{CAT_LABEL[g]}</h3>
                <span className="hair" style={{ flex: 1 }} />
              </div>
              <Reveal stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: ".9rem", maxWidth: 1000, marginInline: "auto" }}>
                {items.map((s) => (
                  <button key={s.id} onClick={() => navigate("/login")} className="svc-card card" style={{
                    textAlign: "left", padding: "1.2rem", display: "grid", gap: ".55rem", cursor: "pointer",
                    borderTop: g === "premium" ? "1px solid var(--gold-line)" : undefined, transition: "transform .25s, border-color .25s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: ".5rem" }}>
                      <span className="font-display" style={{ fontWeight: 600, fontSize: "1.02rem" }}>{s.name}</span>
                      <span style={{ color: "var(--muted)", flexShrink: 0 }}><Icon name="cut" size={16} /></span>
                    </div>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.45 }}>{s.desc}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: ".6rem", marginTop: ".2rem" }}>
                      <span className="font-display gold-text" style={{ fontSize: "1.35rem", fontWeight: 700 }}>{CLP(s.price)}</span>
                      <span className="chip"><Icon name="clock" size={12} /> {s.min} min</span>
                    </div>
                    {s.tne && <span style={{ fontSize: ".74rem", color: "var(--muted-2)" }}>Con TNE: {CLP(tne(s.price))}</span>}
                    <span style={{ marginTop: ".3rem", fontSize: ".74rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: ".3rem" }}>Reservar <Icon name="arrowRight" size={13} /></span>
                  </button>
                ))}
              </Reveal>
            </div>
          )
        })}
        <style>{`.svc-card:hover{transform:translateY(-4px);border-color:var(--gold-line);}`}</style>
      </section>

      {/* BARBEROS */}
      <section id="sec-barberos" style={{ padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)", background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.015), transparent)" }}>
        <SectionHead center eyebrow="El equipo" title="Nuestros barberos" sub="Elige tu barbero y revisa su agenda en tiempo real." />
        <Reveal stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "1rem", maxWidth: 1000, marginInline: "auto" }}>
          {BARBERS.map((b) => (
            <button key={b.id} onClick={() => navigate("/login")} className="barber-card card" style={{ textAlign: "center", padding: "1.4rem 1rem", display: "grid", gap: ".7rem", justifyItems: "center", cursor: "pointer", transition: "transform .25s, border-color .25s", borderTop: b.tier === "premium" ? "1px solid var(--gold-line)" : undefined }}>
              <div style={{ width: 92, height: 92, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--hair-2)", background: "var(--panel)" }}>
                <img src="/assets/pimp-studio-logo.jpg" alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
              </div>
              <div>
                <div className="font-display" style={{ fontWeight: 600, fontSize: "1.02rem" }}>{b.name}</div>
                <div style={{ fontSize: ".74rem", color: b.tier === "premium" ? "var(--gold-lt)" : "var(--muted)", letterSpacing: ".04em" }}>{b.role}</div>
              </div>
              <div style={{ display: "flex", gap: ".5rem", fontSize: ".72rem", color: "var(--muted)" }}>
                <span className="chip"><Icon name="star" size={11} color="var(--gold)" /> {b.rating}</span>
                <span className="chip">{b.exp}</span>
              </div>
              <span style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)" }}>Ver agenda →</span>
            </button>
          ))}
        </Reveal>
        <style>{`.barber-card:hover{transform:translateY(-4px);border-color:var(--gold-line);}`}</style>
      </section>

      {/* GALERIA */}
      <section id="sec-galeria" style={{ padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
        <SectionHead center eyebrow="Portafolio" title="Galería" sub="Cortes, fades y trabajos del estudio." />
        <Reveal stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: ".7rem", maxWidth: 1000, marginInline: "auto" }}>
          {[
            { src: "/assets/gallery-1.jpg", label: "Corte clásico" },
            { src: "/assets/gallery-2.png", label: "Fade" },
            { src: "/assets/gallery-3.jpg", label: "Barba" },
            { src: "/assets/gallery-1.jpg", label: "Platinado" },
            { src: "/assets/gallery-2.png", label: "Visos" },
            { src: "/assets/gallery-3.jpg", label: "Estilo libre" },
          ].map((item, i) => (
            <div key={i} style={{ aspectRatio: i % 5 === 0 ? "1/1.2" : "1/1", borderRadius: 12, overflow: "hidden", position: "relative", border: "1px solid var(--hair)" }}>
              <img src={item.src} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(8,8,7,0.7))", display: "flex", alignItems: "flex-end", padding: ".8rem" }}>
                <span style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)" }}>{item.label}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* NOSOTROS */}
      <section id="sec-nosotros" style={{ padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
        <div style={{ maxWidth: 1000, marginInline: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.4rem", alignItems: "center" }}>
          <Reveal style={{ display: "grid", gap: "1rem" }}>
            <span className="eyebrow">Nosotros</span>
            <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 600, lineHeight: 1.05 }}>Barbería tradicional, técnica moderna</h2>
            <span style={{ width: 64, height: 2, background: "var(--gold-grad)" }} />
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>En PIMP STUDIO combinamos el arte de la barbería clásica con técnicas contemporáneas. Cada cliente recibe atención personalizada para un resultado a su medida, en una atmósfera premium.</p>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              <span className="chip chip-gold"><Icon name="check" size={13} /> Atención personalizada</span>
              <span className="chip"><Icon name="check" size={13} /> Productos premium</span>
            </div>
          </Reveal>
          <Reveal className="card" style={{ padding: "1.6rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[["15+", "Años de experiencia"], ["5.000+", "Clientes satisfechos"], ["6 días", "Abierto a la semana"], ["Premium", "Servicio de calidad"]].map(([n, l]) => (
              <div key={l} style={{ padding: "1rem", border: "1px solid var(--hair)", borderRadius: 12, background: "rgba(0,0,0,0.25)" }}>
                <div className="font-display gold-text" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>{l}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* UBICACION */}
      <section id="sec-ubicacion" style={{ padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
        <SectionHead center eyebrow="Cómo llegar" title="Ubicación" sub="A pasos del Metro Plaza de Maipú (Línea 5)." />
        <div style={{ maxWidth: 1000, marginInline: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" }}>
          <div style={{ minHeight: 280, borderRadius: 14, overflow: "hidden", border: "1px solid var(--hair)" }}>
            <iframe
              title="Mapa PIMP STUDIO"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.5!2d-70.758!3d-33.512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMonumento+1750+Local+C+Maip%C3%BA!5e0!3m2!1ses!2scl!4v1"
              width="100%" height="280" style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen loading="lazy"
            />
          </div>
          <div className="card" style={{ padding: "1.6rem", display: "grid", gap: ".9rem", alignContent: "start" }}>
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

      {/* CTA */}
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) 1.5rem", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid var(--hair)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(700px 300px at 50% 0%, rgba(201,161,78,0.12), transparent 70%)" }} />
        <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: "1.1rem" }}>
          <Emblem size={64} />
          <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700 }}>Tu próximo corte te espera</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>Inicia sesión solo con tu número de teléfono. Sin contraseñas.</p>
          <button className="btn btn-gold" onClick={() => navigate("/login")}><Icon name="calendar" size={16} /> Reservar ahora</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "1.6rem clamp(1rem,5vw,3rem)", borderTop: "1px solid var(--hair)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Brandmark size={34} />
        <span style={{ color: "var(--muted-2)", fontSize: ".8rem" }}>© 2026 PIMP STUDIO · Maipú, Chile</span>
        <button
          onClick={() => navigate("/ingreso")}
          style={{ background: "none", border: "1px solid var(--hair)", borderRadius: 999, padding: ".4rem 1rem", fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: ".4rem", transition: "border-color .2s, color .2s" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "var(--gold-line)"; e.currentTarget.style.color = "var(--gold-lt)" }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "var(--hair)"; e.currentTarget.style.color = "var(--muted)" }}
        >
          <Icon name="key" size={13} /> Acceso Barberos
        </button>
      </footer>
    </div>
  )
}
