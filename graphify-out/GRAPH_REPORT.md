# Graph Report - .  (2026-06-24)

## Corpus Check
- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 418 nodes · 646 edges · 33 communities (21 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth & API Layer|Auth & API Layer]]
- [[_COMMUNITY_UI Theme & Dashboard|UI Theme & Dashboard]]
- [[_COMMUNITY_Workshop Data & Content|Workshop Data & Content]]
- [[_COMMUNITY_Barber Profile & Inbox|Barber Profile & Inbox]]
- [[_COMMUNITY_Barber Permissions Modal|Barber Permissions Modal]]
- [[_COMMUNITY_Booking & Account Pages|Booking & Account Pages]]
- [[_COMMUNITY_Vanilla App Logic|Vanilla App Logic]]
- [[_COMMUNITY_Brand Photography Assets|Brand Photography Assets]]
- [[_COMMUNITY_Brunetti Branding & Courses|Brunetti Branding & Courses]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_ELIJA Agent & Business|ELIJA Agent & Business]]
- [[_COMMUNITY_Feature Flags & Config|Feature Flags & Config]]
- [[_COMMUNITY_Local Dev Server|Local Dev Server]]
- [[_COMMUNITY_Client Registration API|Client Registration API]]
- [[_COMMUNITY_Vercel Deploy Config|Vercel Deploy Config]]
- [[_COMMUNITY_Proposal Generation Script|Proposal Generation Script]]
- [[_COMMUNITY_Sales Inbox & Templates|Sales Inbox & Templates]]
- [[_COMMUNITY_Login Auth Handler|Login Auth Handler]]
- [[_COMMUNITY_Brand Logo Assets|Brand Logo Assets]]
- [[_COMMUNITY_Workshop 2026 Photo|Workshop 2026 Photo]]
- [[_COMMUNITY_Service Worker|Service Worker]]
- [[_COMMUNITY_Vite Build Config|Vite Build Config]]
- [[_COMMUNITY_exportar_pdf.sh|exportar_pdf.sh]]
- [[_COMMUNITY_Bruno Herrera Feature Photo (Brunetti Ex|Bruno Herrera Feature Photo (Brunetti Ex]]
- [[_COMMUNITY_Bruno Herrera Hero Photo (barber, main p|Bruno Herrera Hero Photo (barber, main p]]
- [[_COMMUNITY_Bruno Herrera Portrait Photo|Bruno Herrera Portrait Photo]]
- [[_COMMUNITY_Workshop 2026 Photo (barbershop workshop|Workshop 2026 Photo (barbershop workshop]]
- [[_COMMUNITY_sw.js|sw.js]]
- [[_COMMUNITY_vite.config.js|vite.config.js]]
- [[_COMMUNITY_Legacy PIMP STUDIO static landing|Legacy PIMP STUDIO static landing]]

## God Nodes (most connected - your core abstractions)
1. `requireInternal()` - 18 edges
2. `CLP()` - 11 edges
3. `Icon()` - 11 edges
4. `barberById()` - 9 edges
5. `enablePush()` - 9 edges
6. `PIMPSTUDIO Changelog de Implementacion` - 9 edges
7. `ELIJA Agente Personal de Trabajo README` - 9 edges
8. `PIMP STUDIO Logo (JPG, used as brand header/footer image)` - 8 edges
9. `readLocalBookings()` - 7 edges
10. `readJson()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `PIMP STUDIO Logo (JPG, used as brand header/footer image)` --semantically_similar_to--> `PIMP STUDIO Logo JPG (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/pimp-studio-logo.jpg → web/assets/pimp-studio-logo.jpg
- `Skill Web Profesional ELIJA` --semantically_similar_to--> `Alcance Funcional Plataforma Web Barberia`  [INFERRED] [semantically similar]
  skills/web-profesional/SKILL.md → docs/PROJECT_SCOPE.md
- `Dashboard Page (Client Panel)` --references--> `PIMP STUDIO Logo (JPG, used as brand header/footer image)`  [EXTRACTED]
  web/dashboard.html → public/assets/pimp-studio-logo.jpg
- `Gallery Image 1 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 1 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-1.jpg → web/assets/gallery-1.jpg
- `Gallery Image 2 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 2 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-2.png → web/assets/gallery-2.png

## Import Cycles
- None detected.

## Communities (33 total, 12 thin omitted)

### Community 0 - "Auth & API Layer"
Cohesion: 0.06
Nodes (40): Bars(), CAT_COLORS, DashboardResumen(), STATUS_DOT, TopSvc(), GlareCard(), Icon(), PATHS (+32 more)

### Community 1 - "UI Theme & Dashboard"
Cohesion: 0.10
Nodes (32): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+24 more)

### Community 2 - "Workshop Data & Content"
Cohesion: 0.08
Nodes (13): ALL_MODULE_IDS, emptyBarber, MODULES, PERMS, NAV, Brandmark(), Emblem(), Icon() (+5 more)

### Community 3 - "Barber Profile & Inbox"
Cohesion: 0.11
Nodes (20): AGENDA_SLOTS, buildWeek(), CFG_SECTIONS, ConfigPanel(), Dashboard(), DAY_LABELS, isStrongPassword(), authHeaders() (+12 more)

### Community 4 - "Barber Permissions Modal"
Cohesion: 0.13
Nodes (29): addAppointment(), boot(), digitsOnly(), ensureSeedData(), escapeHtml(), FIGMA_BARBERS, FIGMA_SERVICES, formatCLP() (+21 more)

### Community 5 - "Booking & Account Pages"
Cohesion: 0.11
Nodes (15): scrollToId(), useBrunettiFx(), GooeyText(), ICONS, ModuleFooter(), INCLUDES, LEVELS, MODULES (+7 more)

### Community 6 - "Vanilla App Logic"
Cohesion: 0.12
Nodes (11): formatCLP(), Hero(), Pricing(), QuoteBlock(), Register(), Reveal(), StickyCta(), useCountdown() (+3 more)

### Community 7 - "Brand Photography Assets"
Cohesion: 0.12
Nodes (15): autoTheme(), FloatingThemeToggle(), santiagoHour(), ThemeCtx, ThemeProvider(), ThemeToggle(), useTheme(), Account (+7 more)

### Community 8 - "Brunetti Branding & Courses"
Cohesion: 0.10
Nodes (20): dependencies, @neondatabase/serverless, react, react-dom, react-router-dom, @vercel/analytics, web-push, devDependencies (+12 more)

### Community 9 - "Project Dependencies"
Cohesion: 0.22
Nodes (17): Identidad del Agente ELIJA, Availability Slots and Block Management, Online Booking Reservation Flow, ELIJA Personal Work Agent, Conocimiento de la Empresa, Roadmap de Integraciones, Sistema Operativo de ELIJA, Priority Matrix P1 P2 P3 (+9 more)

### Community 10 - "ELIJA Agent & Business"
Cohesion: 0.24
Nodes (16): PIMP STUDIO Logo (JPG, used as brand header/footer image), Admin Key Authentication (shared internal password pattern), Barber Availability Management (barber sets available slots per day), Barber Authentication Flow (username/password, sets active barber session), Dual Authentication System (client auth via phone vs barber/admin auth via username+password), Phone Number as Client Identity (celular = ID de cliente), Manual Slot Blocking (admin blocks time slots per barber per day), TNE Discount (20% for Tarjeta Nacional Estudiantil, non-Bruno services) (+8 more)

### Community 11 - "Feature Flags & Config"
Cohesion: 0.15
Nodes (14): fs, handleLocalRegisterClient(), http, LOCAL_CLIENTS_FILE, MIME, normalizePath(), path, PORT (+6 more)

### Community 12 - "Local Dev Server"
Cohesion: 0.13
Nodes (13): FEATURE_CARDS, TESTIMONIALS, WK_BASE, WK_DIAS, WK_ED, WK_MESES, WORKSHOP, WORKSHOP_DATES (+5 more)

### Community 13 - "Client Registration API"
Cohesion: 0.20
Nodes (14): Barber Permission System by Module, BRUNETTI_ONLY Feature Flag, Brunetti Bruno Herrera Single Barber Brand, PIMPSTUDIO Changelog de Implementacion, CSS Scoped Under brunetti-site Class, Curso Waitlist localStorage Key, Plan de Implementacion Rediseno Brunetti, localStorage Dev Fallback Without Backend (+6 more)

### Community 14 - "Vercel Deploy Config"
Cohesion: 0.23
Nodes (9): FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber(), STATUS_LABEL, STATUS_OPTIONS (+1 more)

### Community 16 - "Sales Inbox & Templates"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 17 - "Login Auth Handler"
Cohesion: 0.83
Nodes (3): extraer_contexto(), main(), sugerir_alcance()

### Community 18 - "Brand Logo Assets"
Cohesion: 0.67
Nodes (3): Propuesta Comercial Demo, Transcripcion Demo Cliente, Propuesta Comercial Base Template

## Knowledge Gaps
- **118 isolated node(s):** `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS`, `DEMO_BOOKINGS`, `DEMO_CLIENTS` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `Workshop Data & Content` to `Auth & API Layer`, `Barber Profile & Inbox`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `ThemeProvider()` connect `Brand Photography Assets` to `Barber Profile & Inbox`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `CLP()` connect `Auth & API Layer` to `Barber Profile & Inbox`, `Vercel Deploy Config`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth & API Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._
- **Should `UI Theme & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._
- **Should `Workshop Data & Content` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._