/* PIMP STUDIO · Workshop "Contenido que Vende" — Página (React + React Router)
   Drop-in para Vite. Requiere react-router-dom. Importa su propio CSS y datos.
   Logo esperado en /public/assets/pimp-studio-logo.jpg (degrada si falta). */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { WORKSHOP } from '../data/workshop.js'
import SiteNav from '../components/SiteNav.jsx'
import '../styles/workshop.css'

/* ---------- helpers UI ---------- */
const WK_ICONS = {
  scissors: "M14.5 9.5L21 3M14.5 14.5L21 21M9.5 12l-6.5-9M9.5 12l-6.5 9M9.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  calendar: "M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0",
  star: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.6 9.1l5.8-.8z",
  spark: "M12 3v6M12 15v6M3 12h6M15 12h6",
  check: "M5 12.5l4.5 4.5L19 7",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  gift: "M12 8v13M3.5 8h17v3.5h-17zM4.5 11.5h15V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1zM12 8S10.5 3.5 8 4.5 9.5 8 12 8zM12 8s1.5-4.5 4-3.5S14.5 8 12 8z",
  whatsapp: "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17 6.5h.01",
  plus: "M12 5v14M5 12h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  bolt: "M13 2L4 14h6l-1 8 9-12h-6z",
  camera: "M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  film: "M4 4h16v16H4zM4 9h16M4 15h16M9 4v16M15 4v16",
  award: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM9 13l-1.5 7L12 18l4.5 2L15 13",
};

function Icon({ name, size = 20, stroke = 1.6, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={WK_ICONS[name] || WK_ICONS.spark} />
    </svg>
  );
}

function useInView(opts) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.unobserve(el); } });
    }, opts || { threshold: 0.16 });
    io.observe(el);
    const fb = setTimeout(() => setSeen(true), 1400);
    return () => { io.disconnect(); clearTimeout(fb); };
  }, []);
  return [ref, seen];
}

function Reveal({ children, className = "", style, as = "div" }) {
  const [ref, seen] = useInView();
  const Tag = as;
  return (
    <Tag ref={ref} className={`wks-reveal ${seen ? "is-in" : ""} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

/* Imagen B/N con fallback a placeholder si falla la carga */
function Bw({ src, alt, label = "Foto", className = "", innerClass = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`wks-img ${className} ${failed ? "is-failed" : ""}`} data-label={label}>
      {!failed && <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={innerClass} />}
    </div>
  );
}

function formatCLP(n) {
  return "$" + Math.round(Number(n) || 0).toLocaleString("es-CL");
}

const WK = WORKSHOP;

/* ---------- hooks ---------- */
function useScrolled(threshold = 40) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const on = () => setV(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return v;
}

function useCountdown(targetISO) {
  const [t, setT] = useState(() => calc(targetISO));
  useEffect(() => {
    const id = setInterval(() => setT(calc(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return t;
}
function calc(targetISO) {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (x) => String(x).padStart(2, "0");
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

function smoothTo(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
}

/* ============================================================ HERO */
function Hero({ onReserve }) {
  const cd = useCountdown(WK.meta.dateISO);
  const [failed, setFailed] = useState(false);
  const m = WK.meta;
  return (
    <section className="wks-hero" id="top">
      <div className={`wks-hero-media ${failed ? "is-failed" : ""}`}>
        {!failed && <img src={WK.photos.hero} alt="Barbería premium" onError={() => setFailed(true)} />}
      </div>
      <div className="wks-hero-overlay" />
      <div className="wks-hero-inner">
        <div className="wks-container wks-hero-grid">
          <div>
            <div className="wks-hero-kicker">
              <span className="wks-chip"><Icon name="scissors" size={13} /> Edición barbería premium</span>
              <span className="wks-eyebrow">{m.kicker}</span>
            </div>
            <h1>
              {m.title1}
              <span className="wks-hero-line2">{m.title2}</span>
            </h1>
            <p className="wks-hero-sub">{m.subtitle}</p>
            <div className="wks-hero-actions">
              <button className="wks-btn wks-btn-gold" onClick={onReserve}>
                <Icon name="calendar" size={16} /> Asegura tu silla
              </button>
              <button className="wks-btn wks-btn-ghost" onClick={() => smoothTo("programa")}>
                Ver el programa
              </button>
            </div>
          </div>

          <aside className="wks-hero-card">
            <div className="wks-card-row">
              <div className="wks-date-badge">
                <b>{m.dateLabel}</b>
                <span>{m.location}</span>
              </div>
              <span className="wks-chip"><Icon name="pin" size={12} /> Cupos 20</span>
            </div>
            <div className="wks-countdown">
              {[["d", "Días"], ["h", "Hrs"], ["m", "Min"], ["s", "Seg"]].map(([k, l]) => (
                <div className="wks-cd-cell" key={k}><b>{cd[k]}</b><span>{l}</span></div>
              ))}
            </div>
            <div className="wks-price-line">
              <span className="wks-price-now">{formatCLP(m.priceNow)}</span>
              <span className="wks-price-was">{formatCLP(m.priceWas)}</span>
              <span className="wks-price-off">{m.off} OFF</span>
            </div>
          </aside>
        </div>
      </div>
      <div className="wks-scroll-hint"><span>Scroll</span><i /></div>
    </section>
  );
}

/* ============================================================ TRANSFORM */
function Transform() {
  return (
    <section className="wks-section" id="transformar">
      <div className="wks-container">
        <Reveal className="wks-head">
          <span className="wks-eyebrow">¿A quién buscamos transformar?</span>
          <h2 className="wks-h2">Si te sientes estancado en el sillón, este workshop es tu salida de emergencia.</h2>
          <hr className="wks-rule" />
        </Reveal>
        <div className="wks-transform-grid">
          {WK.transform.map((c, i) => (
            <Reveal key={c.n} className="wks-tcard" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="wks-tcard-num">{c.n}</span>
              <Bw src={WK.photos[c.photo]} alt={c.title} label={c.title} />
              <div className="wks-tcard-body">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ QUOTE 50/50 */
function QuoteBlock() {
  const [ref, seen] = useInView({ threshold: 0.3 });
  return (
    <section className="wks-section wks-section-alt wks-quote">
      <div className="wks-container wks-quote-grid" ref={ref}>
        <div>
          <span className="wks-eyebrow" style={{ marginBottom: "1.2rem", display: "inline-flex" }}>Diagnóstico de posicionamiento</span>
          <blockquote>
            “El mejor barbero del mundo no sirve de nada si nadie sabe que existe. Tu técnica es el 50%,{" "}
            <span className="q">tu visibilidad es el otro 50%.</span>”
          </blockquote>
          <cite>PIMP STUDIO · Marca personal</cite>
        </div>
        <div className={`wks-5050 ${seen ? "is-in" : ""}`}>
          <div className="wks-5050-row">
            <div className="lbl"><span>Técnica</span><span>50%</span></div>
            <div className="wks-5050-bar"><i className="tech" /></div>
          </div>
          <div className="wks-5050-row">
            <div className="lbl"><span>Visibilidad</span><span className="wks-gold">50%</span></div>
            <div className="wks-5050-bar"><i className="vis" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FEATURE ROW */
function FeatureRow({ data, reversed }) {
  return (
    <section className="wks-section">
      <div className="wks-container">
        <Reveal className={`wks-feature ${reversed ? "is-rev" : ""}`}>
          <div className="wks-feature-media">
            <Bw src={WK.photos[data.photo]} alt={data.title} label={data.eyebrow} />
            <span className="wks-chip wks-feature-tag"><Icon name="bolt" size={12} /> En vivo</span>
          </div>
          <div className="wks-feature-body">
            <span className="wks-eyebrow">{data.eyebrow}</span>
            <h2 className="wks-h2" style={{ fontSize: "clamp(1.7rem,3.4vw,2.6rem)" }}>{data.title}</h2>
            <ul className="wks-detail-list">
              {data.items.map((it) => (
                <li key={it.h}>
                  <span className="ic"><Icon name={it.icon} size={18} /></span>
                  <div>
                    <h4>{it.h}</h4>
                    <p>{it.p}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ PROGRAMA tabs */
function Programa() {
  const [active, setActive] = useState(0);
  const mod = WK.modules[active];
  return (
    <section className="wks-section wks-section-alt" id="programa">
      <div className="wks-container">
        <Reveal className="wks-head">
          <span className="wks-eyebrow">El programa · 3 bloques</span>
          <h2 className="wks-h2">No es un curso genérico. Es un sistema para barbería real.</h2>
          <hr className="wks-rule" />
        </Reveal>
        <div className="wks-modules">
          <div className="wks-mod-tabs">
            {WK.modules.map((mm, i) => (
              <button key={mm.n} className={`wks-mod-tab ${i === active ? "is-active" : ""}`} onClick={() => setActive(i)}>
                <span className="n">{mm.n}</span>
                <span className="t">{mm.title}</span>
              </button>
            ))}
          </div>
          <div className="wks-mod-panel" key={active}>
            <div className="wks-mod-panel-media wks-fade-key">
              <Bw src={WK.photos[mod.photo]} alt={mod.title} label={mod.title} />
            </div>
            <div className="wks-mod-panel-body wks-fade-key">
              <span className="wks-eyebrow">{mod.n}</span>
              <h3>{mod.title}</h3>
              <ul className="wks-mod-points">
                {mod.points.map((p) => (
                  <li key={p.b}>
                    <span className="dot"><Icon name="check" size={12} /></span>
                    <span><b>{p.b}.</b> <span>{p.s}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ CRONOGRAMA */
function Cronograma() {
  return (
    <section className="wks-section" id="cronograma">
      <div className="wks-container">
        <Reveal className="wks-head">
          <span className="wks-eyebrow">Cronograma del guerrero</span>
          <h2 className="wks-h2">Cuatro horas que cambian cómo te ven en redes.</h2>
          <hr className="wks-rule" />
        </Reveal>
        <Reveal className="wks-timeline">
          {WK.timeline.map((t) => (
            <div className="wks-tl-row" key={t.time}>
              <div className="wks-tl-time">{t.time}</div>
              <span className="wks-tl-dot" />
              <div className="wks-tl-main">
                <b>{t.b}</b>
                <span>{t.s}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ GIVE + KIT */
function GiveKit() {
  return (
    <section className="wks-section wks-section-alt">
      <div className="wks-container wks-two">
        <Reveal className="wks-panel">
          <div className="wks-panel-head">
            <span className="ic"><Icon name="award" size={20} /></span>
            <h3>¿Qué te llevas a casa?</h3>
          </div>
          <ul className="wks-give-list">
            {WK.give.map((g) => (
              <li key={g.b}>
                <span className="ck"><Icon name="check" size={16} /></span>
                <div><b>{g.b}</b><span>{g.s}</span></div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="wks-panel" style={{ transitionDelay: "0.08s" }}>
          <div className="wks-panel-head">
            <span className="ic"><Icon name="bolt" size={20} /></span>
            <h3>Kit de batalla</h3>
          </div>
          <ul className="wks-give-list">
            {WK.kit.map((g) => (
              <li key={g.b}>
                <span className="ck"><Icon name="check" size={16} /></span>
                <div><b>{g.b}</b><span>{g.s}</span></div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ PRICING */
function Pricing({ onReserve }) {
  const [ref, seen] = useInView({ threshold: 0.3 });
  const [failed, setFailed] = useState(false);
  const m = WK.meta;
  const pct = Math.round((m.seatsTaken / m.seatsTotal) * 100);
  const left = m.seatsTotal - m.seatsTaken;
  return (
    <section className="wks-section wks-pricing" id="precio">
      <div className={`wks-pricing-bg ${failed ? "is-failed" : ""}`}>
        {!failed && <img src={WK.photos.pricing} alt="" onError={() => setFailed(true)} />}
      </div>
      <div className="wks-container">
        <div className="wks-pricing-card" ref={ref}>
          <div className="wks-pricing-top">
            <div style={{ display: "grid", gap: "0.8rem" }}>
              <span className="wks-eyebrow">Asegura tu silla</span>
              <div className="wks-pricing-amount">
                <span className="now">{formatCLP(m.priceNow)}</span>
                <span className="was">{formatCLP(m.priceWas)}</span>
                <span className="wks-price-off">{m.off} OFF</span>
              </div>
              <p className="wks-pricing-note">Un solo cliente nuevo de alta gama paga este curso. La inversión vuelve con la primera reserva.</p>
            </div>
            <div className="wks-cupos">
              <div className="wks-cupos-head">
                <b>{left} cupos restantes</b>
                <span>{m.seatsTaken}/{m.seatsTotal} ocupados</span>
              </div>
              <div className="wks-cupos-bar"><i style={{ width: seen ? `${pct}%` : 0 }} /></div>
              <span style={{ color: "var(--wk-muted)", fontSize: "0.78rem" }}>Exclusividad garantizada · solo 20 cupos por fecha.</span>
            </div>
          </div>
          <div className="wks-pricing-foot">
            <p className="wks-pricing-note" style={{ margin: 0 }}>{m.dateLong} · {m.location}</p>
            <button className="wks-btn wks-btn-gold" onClick={onReserve}>
              <Icon name="calendar" size={16} /> Reservar ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ REGISTER */
function Register({ formRef }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", edition: "16 de marzo · Santiago" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const m = WK.meta;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 3) er.name = "Ingresa tu nombre completo.";
    if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.trim())) er.phone = "Teléfono no válido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "Email no válido.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate()) setSent(true);
  };

  return (
    <section className="wks-section" id="inscribir" ref={formRef}>
      <div className="wks-container">
        <Reveal className="wks-head">
          <span className="wks-eyebrow">Únete al cambio</span>
          <h2 className="wks-h2">Escribe tu propia historia. Reserva tu cupo.</h2>
          <hr className="wks-rule" />
        </Reveal>
        <div className="wks-register-grid">
          <aside className="wks-form-aside">
            <div className="wks-summary-row"><span>Workshop</span><b>Contenido que Vende</b></div>
            <div className="wks-summary-row"><span>Fecha</span><b>{m.dateLabel}</b></div>
            <div className="wks-summary-row"><span>Lugar</span><b>{m.location}</b></div>
            <div className="wks-summary-row"><span>Cupos</span><b>{m.seatsTotal - m.seatsTaken} disponibles</b></div>
            <div className="wks-summary-total">
              <div><span style={{ color: "var(--wk-muted)", fontSize: "0.8rem" }}>Inversión total</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                  <span className="v">{formatCLP(m.priceNow)}</span>
                  <span style={{ color: "var(--wk-muted)", textDecoration: "line-through", fontSize: "0.9rem" }}>{formatCLP(m.priceWas)}</span>
                </div>
              </div>
              <span className="wks-price-off">{m.off}</span>
            </div>
          </aside>

          {sent ? (
            <div className="wks-success">
              <span className="ring"><Icon name="check" size={26} /></span>
              <h3>¡Cupo reservado, {form.name.split(" ")[0]}!</h3>
              <p style={{ margin: 0, color: "var(--wk-ink-soft)" }}>
                Te escribiremos a <b className="wks-gold">{form.email}</b> y al {form.phone} con los datos de pago y la ubicación exacta. Nos vemos el {m.dateLabel}.
              </p>
              <button className="wks-btn wks-btn-ghost wks-btn-sm" onClick={() => { setSent(false); setForm({ name: "", phone: "", email: "", edition: form.edition }); }}>
                Inscribir a otra persona
              </button>
            </div>
          ) : (
            <form className="wks-form" onSubmit={submit} noValidate>
              <div className={`wks-field ${errors.name ? "is-error" : ""}`}>
                <label>Nombre completo</label>
                <input value={form.name} onChange={set("name")} placeholder="Tu nombre y apellido" />
                <span className="err">{errors.name}</span>
              </div>
              <div className="wks-form-row">
                <div className={`wks-field ${errors.phone ? "is-error" : ""}`}>
                  <label>WhatsApp</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="+56 9 ..." inputMode="tel" />
                  <span className="err">{errors.phone}</span>
                </div>
                <div className={`wks-field ${errors.email ? "is-error" : ""}`}>
                  <label>Email</label>
                  <input value={form.email} onChange={set("email")} placeholder="tu@correo.com" inputMode="email" />
                  <span className="err">{errors.email}</span>
                </div>
              </div>
              <div className="wks-field">
                <label>Edición</label>
                <select value={form.edition} onChange={set("edition")}>
                  <option>16 de marzo · Santiago</option>
                  <option>Próxima edición · lista de espera</option>
                </select>
              </div>
              <button className="wks-btn wks-btn-gold wks-btn-block" type="submit" style={{ marginTop: "0.4rem" }}>
                <Icon name="check" size={16} /> Inscríbete ahora · {formatCLP(m.priceNow)}
              </button>
              <p style={{ margin: 0, color: "var(--wk-muted-2)", fontSize: "0.76rem", textAlign: "center" }}>
                Sin pago en este paso. Confirmamos tu cupo y coordinamos el resto por WhatsApp.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FAQ */
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="wks-section wks-section-alt">
      <div className="wks-container">
        <Reveal className="wks-head">
          <span className="wks-eyebrow">¿Alguna duda?</span>
          <h2 className="wks-h2">Hablemos ahora y despejemos el camino.</h2>
          <hr className="wks-rule" />
        </Reveal>
        <div className="wks-faq">
          {WK.faq.map((f, i) => (
            <div key={i} className={`wks-faq-item ${open === i ? "is-open" : ""}`}>
              <button className="wks-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}
                <span className="pm"><Icon name="plus" size={14} /></span>
              </button>
              <div className="wks-faq-a" style={{ maxHeight: open === i ? "240px" : 0 }}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FOOTER */
function Footer({ onReserve }) {
  const m = WK.meta;
  return (
    <footer className="wks-footer">
      <div className="wks-container wks-footer-grid">
        <div style={{ display: "grid", gap: "1.2rem" }}>
          <span className="wks-eyebrow">Únete al cambio</span>
          <h2>Escribe tu<br />propia historia.</h2>
          <div className="wks-hero-actions" style={{ marginTop: "0.4rem" }}>
            <button className="wks-btn wks-btn-gold" onClick={onReserve}><Icon name="calendar" size={16} /> Inscríbete ahora</button>
          </div>
        </div>
        <div className="wks-footer-contact">
          <span className="wks-eyebrow" style={{ marginBottom: "0.4rem" }}>Hablemos</span>
          <a href={`https://wa.me/${m.whatsapp.replace(/[^\d]/g, "")}`}><Icon name="whatsapp" size={18} color="var(--wk-gold-lt)" /> WhatsApp directo</a>
          <a href="https://instagram.com/brunetticutz"><Icon name="instagram" size={18} color="var(--wk-gold-lt)" /> {m.handle}</a>
          <a><Icon name="pin" size={18} color="var(--wk-gold-lt)" /> {m.location}</a>
        </div>
      </div>
      <div className="wks-container wks-footer-bottom">
        <span>© 2026 PIMP STUDIO · Workshop Contenido que Vende</span>
        <span>Edición barbería premium · {m.dateLabel}</span>
      </div>
    </footer>
  );
}

/* ============================================================ STICKY CTA */
function StickyCta({ onReserve }) {
  const show = useScrolled(680);
  return (
    <div className={`wks-sticky-cta ${show ? "is-show" : ""}`}>
      <div className="px"><b>{formatCLP(WK.meta.priceNow)}</b><span>{WK.meta.off} · {WK.meta.dateLabel}</span></div>
      <button className="wks-btn wks-btn-gold wks-btn-sm" onClick={onReserve}><Icon name="calendar" size={14} /> Reservar silla</button>
    </div>
  );
}

/* ============================================================ APP */
export default function Workshop() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const reserve = () => smoothTo("inscribir");
  void navigate;
  return (
    <div className="wks">
      <div className="wks-shell">
        <SiteNav />
        <Hero onReserve={reserve} />
        <Transform />
        <QuoteBlock />
        <FeatureRow data={WK.experiencia} />
        <FeatureRow data={WK.asesoria} reversed />
        <Programa />
        <Cronograma />
        <GiveKit />
        <Pricing onReserve={reserve} />
        <Register formRef={formRef} />
        <Faq />
        <Footer onReserve={reserve} />
      </div>
    </div>
  );
}
