# Graph Report - .  (2026-06-24)

## Corpus Check
- 8 files · ~180,485 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 473 nodes · 730 edges · 37 communities (22 shown, 15 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Client & Barber UI Components|Client & Barber UI Components]]
- [[_COMMUNITY_Enrollment API & Data|Enrollment API & Data]]
- [[_COMMUNITY_Authentication System|Authentication System]]
- [[_COMMUNITY_Dashboard & Analytics|Dashboard & Analytics]]
- [[_COMMUNITY_Site Theme & Changelog|Site Theme & Changelog]]
- [[_COMMUNITY_Barber Module Config|Barber Module Config]]
- [[_COMMUNITY_Booking App Core|Booking App Core]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Agent Knowledge Base|Agent Knowledge Base]]
- [[_COMMUNITY_Estilo Module Data|Estilo Module Data]]
- [[_COMMUNITY_Brand & Auth Patterns|Brand & Auth Patterns]]
- [[_COMMUNITY_Local Dev Server|Local Dev Server]]
- [[_COMMUNITY_Workshop Module Data|Workshop Module Data]]
- [[_COMMUNITY_Bookings Inbox|Bookings Inbox]]
- [[_COMMUNITY_Hero Photo Assets|Hero Photo Assets]]
- [[_COMMUNITY_Estilo Teaser Photo|Estilo Teaser Photo]]
- [[_COMMUNITY_Client Registration API|Client Registration API]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Module Footer Component|Module Footer Component]]
- [[_COMMUNITY_Proposal Generator Script|Proposal Generator Script]]
- [[_COMMUNITY_Commercial Proposal Docs|Commercial Proposal Docs]]
- [[_COMMUNITY_Gallery Image 1|Gallery Image 1]]
- [[_COMMUNITY_Gallery Image 2|Gallery Image 2]]
- [[_COMMUNITY_Gallery Image 3|Gallery Image 3]]
- [[_COMMUNITY_Brand Logo Assets|Brand Logo Assets]]
- [[_COMMUNITY_SiteNav Navigation Helpers|SiteNav Navigation Helpers]]
- [[_COMMUNITY_Brunetti CSS & Plan|Brunetti CSS & Plan]]
- [[_COMMUNITY_PDF Export Script|PDF Export Script]]
- [[_COMMUNITY_Static HTML Pages|Static HTML Pages]]
- [[_COMMUNITY_Bruno Feature Photo|Bruno Feature Photo]]
- [[_COMMUNITY_Bruno Portrait Photo|Bruno Portrait Photo]]
- [[_COMMUNITY_Workshop Promo Photo|Workshop Promo Photo]]
- [[_COMMUNITY_Admin Client Page|Admin Client Page]]
- [[_COMMUNITY_Legacy Landing Page|Legacy Landing Page]]

## God Nodes (most connected - your core abstractions)
1. `requireInternal()` - 19 edges
2. `Icon()` - 11 edges
3. `CLP()` - 10 edges
4. `handler()` - 10 edges
5. `Dashboard()` - 10 edges
6. `Workshop()` - 10 edges
7. `enablePush()` - 9 edges
8. `ELIJA Agente Personal de Trabajo README` - 9 edges
9. `Home()` - 9 edges
10. `Hero Photo: Brunetti Barber in Action` - 9 edges

## Surprising Connections (you probably didn't know these)
- `index.html theme bootstrap script` --semantically_similar_to--> `santiagoHour()`  [INFERRED] [semantically similar]
  index.html → src/components/theme.jsx
- `PIMP STUDIO Logo (JPG, used as brand header/footer image)` --semantically_similar_to--> `PIMP STUDIO Logo JPG (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/pimp-studio-logo.jpg → web/assets/pimp-studio-logo.jpg
- `Home()` --implements--> `Brunetti single-barber rebrand`  [INFERRED]
  src/pages/Home.jsx → CHANGELOG_IMPLEMENTACION.md
- `Skill Web Profesional ELIJA` --semantically_similar_to--> `Alcance Funcional Plataforma Web Barberia`  [INFERRED] [semantically similar]
  skills/web-profesional/SKILL.md → docs/PROJECT_SCOPE.md
- `Dashboard Page (Client Panel)` --references--> `PIMP STUDIO Logo (JPG, used as brand header/footer image)`  [EXTRACTED]
  web/dashboard.html → public/assets/pimp-studio-logo.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Enrollment Data Flow: Cursos + Workshop → API → Dashboard** — pages_cursos_onsubmit, pages_workshop_register, api_enrollments_handler, pages_dashboard_enrollmentspanel [EXTRACTED 1.00]
- **SiteNav shared across all public pages (Home, Cursos, Workshop)** — components_sitenav_sitenav, pages_home_home, pages_cursos_cursos, pages_workshop_workshop [EXTRACTED 1.00]
- **Dashboard authenticated API calls pattern (authHeaders + fetch + fallback)** — pages_dashboard_authheaders, pages_dashboard_saveservice, pages_dashboard_saveexpense, pages_dashboard_savebarber [EXTRACTED 1.00]

## Communities (37 total, 15 thin omitted)

### Community 0 - "Client & Barber UI Components"
Cohesion: 0.06
Nodes (39): Bars(), CAT_COLORS, DashboardResumen(), STATUS_DOT, TopSvc(), GlareCard(), Icon(), PATHS (+31 more)

### Community 1 - "Enrollment API & Data"
Cohesion: 0.05
Nodes (41): cleanPhone helper, cleanPhone(), DEMO, handler(), neon (NeonDB serverless SQL), requireInternal auth guard, sendJson(), scrollToId() (+33 more)

### Community 2 - "Authentication System"
Cohesion: 0.10
Nodes (32): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+24 more)

### Community 3 - "Dashboard & Analytics"
Cohesion: 0.09
Nodes (28): AGENDA_SLOTS, authHeaders function, buildWeek(), CFG_SECTIONS, ConfigPanel(), Dashboard(), DAY_LABELS, exportCSV function (+20 more)

### Community 4 - "Site Theme & Changelog"
Cohesion: 0.09
Nodes (25): CHANGELOG de implementación, Brunetti single-barber rebrand, Hero gooey-effect removal, Light-mode polish pass, autoTheme(), iOS dynamic theme-color sync, FloatingThemeToggle(), Santiago-hour automatic theme (+17 more)

### Community 5 - "Barber Module Config"
Cohesion: 0.08
Nodes (11): ALL_MODULE_IDS, emptyBarber, MODULES, PERMS, Emblem(), Icon(), ICONS, MobileScreen() (+3 more)

### Community 6 - "Booking App Core"
Cohesion: 0.13
Nodes (29): addAppointment(), boot(), digitsOnly(), ensureSeedData(), escapeHtml(), FIGMA_BARBERS, FIGMA_SERVICES, formatCLP() (+21 more)

### Community 7 - "Project Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @neondatabase/serverless, react, react-dom, react-router-dom, @vercel/analytics, web-push, devDependencies (+12 more)

### Community 8 - "Agent Knowledge Base"
Cohesion: 0.22
Nodes (17): Identidad del Agente ELIJA, Availability Slots and Block Management, Online Booking Reservation Flow, ELIJA Personal Work Agent, Conocimiento de la Empresa, Roadmap de Integraciones, Sistema Operativo de ELIJA, Priority Matrix P1 P2 P3 (+9 more)

### Community 9 - "Estilo Module Data"
Cohesion: 0.15
Nodes (6): FACE_SHAPES, GALLERY, GALLERY_CATS, u(), Reveal(), useReveal()

### Community 10 - "Brand & Auth Patterns"
Cohesion: 0.24
Nodes (16): PIMP STUDIO Logo (JPG, used as brand header/footer image), Admin Key Authentication (shared internal password pattern), Barber Availability Management (barber sets available slots per day), Barber Authentication Flow (username/password, sets active barber session), Dual Authentication System (client auth via phone vs barber/admin auth via username+password), Phone Number as Client Identity (celular = ID de cliente), Manual Slot Blocking (admin blocks time slots per barber per day), TNE Discount (20% for Tarjeta Nacional Estudiantil, non-Bruno services) (+8 more)

### Community 11 - "Local Dev Server"
Cohesion: 0.15
Nodes (14): fs, handleLocalRegisterClient(), http, LOCAL_CLIENTS_FILE, MIME, normalizePath(), path, PORT (+6 more)

### Community 12 - "Workshop Module Data"
Cohesion: 0.13
Nodes (13): FEATURE_CARDS, TESTIMONIALS, WK_BASE, WK_DIAS, WK_ED, WK_MESES, WORKSHOP, WORKSHOP_DATES (+5 more)

### Community 13 - "Bookings Inbox"
Cohesion: 0.23
Nodes (9): FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber(), STATUS_LABEL, STATUS_OPTIONS (+1 more)

### Community 14 - "Hero Photo Assets"
Cohesion: 0.29
Nodes (11): Background text: 'El cliente...' (partially visible), Barber (Bruno Brunetti), Dark patterned barber cape, Client in barber cape receiving haircut, Green barber comb (tool), Context: live demo or barbering course/event, Lapel/headset microphone worn by barber, Hero Photo: Brunetti Barber in Action (+3 more)

### Community 15 - "Estilo Teaser Photo"
Cohesion: 0.29
Nodes (10): Barber / Instructor (PIMP & STUDIOS branded, tattooed, glasses, mic), Barbershop / studio interior with white brick wall, Client seated in barber chair wearing cape, Haircut / styling service in progress, estilo-teaser.jpg (style module teaser image), PIMP & STUDIOS brand logo (on barber shirt), Mood: professional, focused, editorial photography, Ring light (professional studio lighting behind barber) (+2 more)

### Community 17 - "Vercel Config"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 19 - "Proposal Generator Script"
Cohesion: 0.83
Nodes (3): extraer_contexto(), main(), sugerir_alcance()

### Community 20 - "Commercial Proposal Docs"
Cohesion: 0.67
Nodes (3): Propuesta Comercial Demo, Transcripcion Demo Cliente, Propuesta Comercial Base Template

## Knowledge Gaps
- **128 isolated node(s):** `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS`, `DEMO_BOOKINGS`, `DEMO_CLIENTS` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EnrollmentsPanel()` connect `Enrollment API & Data` to `Dashboard & Analytics`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `requireInternal()` connect `Authentication System` to `Enrollment API & Data`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client & Barber UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05961426066627703 - nodes in this community are weakly interconnected._
- **Should `Enrollment API & Data` be split into smaller, more focused modules?**
  _Cohesion score 0.05384150030248034 - nodes in this community are weakly interconnected._
- **Should `Authentication System` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._
- **Should `Dashboard & Analytics` be split into smaller, more focused modules?**
  _Cohesion score 0.08780487804878048 - nodes in this community are weakly interconnected._