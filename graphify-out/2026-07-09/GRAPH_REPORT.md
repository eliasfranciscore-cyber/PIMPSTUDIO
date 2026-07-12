# Graph Report - PIMPSTUDIO-desarrollo  (2026-07-09)

## Corpus Check
- 82 files · ~1,729,587 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 836 nodes · 1477 edges · 58 communities (30 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5e068a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- iOS Data Models
- iOS API Client
- Backend Auth & Project Docs
- Workshop Page & Content
- Vercel API Handlers
- Legacy Static Site (web/app.js)
- UI Components & Login
- package.json Config
- iOS Detail Sheets & Module Views
- Fintoc Checkout & Site Nav
- iOS Agenda & Reservations Views
- Dashboard Analytics & Barber Showcase
- EncuentraEstilo (Style Finder) Page
- Auth & Booking Concepts
- iOS App Intents & Shortcuts
- iOS Design System
- iOS Booking Sheet & Reminders
- Bookings Store & Account Page
- index.html PWA Setup
- iOS Codable Keys
- Bruno Hero Image Assets
- iOS Dashboard & Login Views
- Estilo Teaser Image Assets
- Legacy ELIJA Agent Docs
- iOS App Entry Point
- ELIJA Agent Knowledge Base
- vercel.json Config
- Register Client API
- Fintoc Payments API
- Proposal Generator Script
- CSS Stylesheets
- Claude Dev Wrapper Script
- Proposal Templates & Inbox Demo
- iOS Booking Draft Sheet
- Implementation Plan & CSS Scope
- Gallery Image 1
- Gallery Image 2
- Gallery Image 3
- PIMP Studio Logo Assets
- PDF Export Script
- Vite Config & Fintoc Mock
- Legacy Contact & Cursos Pages
- Blob Storage Token Concept
- VAPID Keys Concept
- Vite VAPID Public Key Concept
- .env.example Config
- Bruno Feature Image
- Bruno Portrait Image
- Workshop 2026 Image
- Legacy Clientes Page
- Legacy Index Page
- Pagina HTML Booking Reserva
- Pagina HTML Cliente Reserva y Perfil

## God Nodes (most connected - your core abstractions)
1. `APIClient` - 32 edges
2. `DashboardModel` - 24 edges
3. `SessionStore` - 21 edges
4. `BrunettiCutz iOS app (SwiftUI, native)` - 20 edges
5. `requireInternal()` - 18 edges
6. `Client` - 18 edges
7. `AppTab` - 15 edges
8. `BookingStatus` - 14 edges
9. `ServiceItem` - 13 edges
10. `View` - 12 edges

## Surprising Connections (you probably didn't know these)
- `PIMP STUDIO Logo (JPG, used as brand header/footer image)` --semantically_similar_to--> `PIMP STUDIO Logo JPG (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/pimp-studio-logo.jpg → web/assets/pimp-studio-logo.jpg
- `Home()` --implements--> `Brunetti single-barber rebrand`  [INFERRED]
  src/pages/Home.jsx → CHANGELOG_IMPLEMENTACION.md
- `Dashboard Page (Client Panel)` --references--> `PIMP STUDIO Logo (JPG, used as brand header/footer image)`  [EXTRACTED]
  web/dashboard.html → public/assets/pimp-studio-logo.jpg
- `Gallery Image 1 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 1 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-1.jpg → web/assets/gallery-1.jpg
- `Gallery Image 2 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 2 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-2.png → web/assets/gallery-2.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PIMP STUDIO Brand Asset Set (logo JPG + mark SVG + logo SVG used across all pages)** — public_assets_pimp_studio_logo_jpg, public_assets_pimp_studio_mark_svg, public_assets_pimp_studio_logo_svg [INFERRED 0.75]
- **Internal barber authentication flow (session creation, validation, gating)** — api__auth_js_createsession, api__auth_js_readsession, api__auth_js_requireinternal, api_auth_login_js, api_auth_barber_js, concept_ps_session_secret, concept_session_management [EXTRACTED 0.90]
- **Fintoc unified checkout + webhook payment flow** — api_fintoc_payments_js, concept_fintoc_integration, concept_vite_fintoc_mock, concept_fintoc_secret_key, api_enrollments_js [EXTRACTED 0.85]
- **Multiple frontends (web SPA, iOS native app) consuming the same Vercel API surface** — ios_brunetticutz_app, readme_brunetti_project, api_bookings_js, api_availability_js, api_clients_js, api_services_js, api_expenses_js, api_auth_barber_js [INFERRED 0.85]

## Communities (58 total, 28 thin omitted)

### Community 0 - "iOS Data Models"
Cohesion: 0.08
Nodes (21): APIClient, Data, Foundation, DashboardFocus, dia, semana, workshop, String (+13 more)

### Community 1 - "iOS API Client"
Cohesion: 0.06
Nodes (76): Any, CaseIterable, Codable, Decodable, Error, Hashable, Identifiable, APIClient (+68 more)

### Community 2 - "Backend Auth & Project Docs"
Cohesion: 0.06
Nodes (52): api/_auth.js (Session creation/validation), createSession(barber), readSession(req), requireInternal(req, res, {admin?}), api/auth-barber.js (barber auth checks), api/auth-login.js (barber login), api/availability.js (Barber time slots), api/barbers.js (team/permissions listing) (+44 more)

### Community 3 - "Workshop Page & Content"
Cohesion: 0.06
Nodes (36): FEATURE_CARDS, TESTIMONIALS, WK_BASE, WK_DIAS, WK_ED, WK_MESES, WORKSHOP, WORKSHOP_DATES (+28 more)

### Community 4 - "Vercel API Handlers"
Cohesion: 0.09
Nodes (35): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+27 more)

### Community 6 - "Legacy Static Site (web/app.js)"
Cohesion: 0.31
Nodes (13): authHeaders(), disablePush(), enablePush(), isIOS(), isStandalone(), notifyBarberOfBooking(), notifyLocal(), permissionState() (+5 more)

### Community 7 - "UI Components & Login"
Cohesion: 0.06
Nodes (29): bookingsStore.js (state store), ALL_MODULE_IDS, emptyBarber, MODULES, PERMS, Brandmark(), Emblem(), Icon() (+21 more)

### Community 8 - "package.json Config"
Cohesion: 0.08
Nodes (23): dependencies, framer-motion, @neondatabase/serverless, react-dom, react-router-dom, @vercel/analytics, web-push, devDependencies (+15 more)

### Community 9 - "iOS Detail Sheets & Module Views"
Cohesion: 0.17
Nodes (12): AppTab, agenda, clientes, config, finanzas, gastos, inscripciones, marketing (+4 more)

### Community 10 - "Fintoc Checkout & Site Nav"
Cohesion: 0.05
Nodes (41): CHANGELOG de implementación, Brunetti single-barber rebrand, Hero gooey-effect removal, Light-mode polish pass, Account, App(), BarberLogin, Booking (+33 more)

### Community 12 - "iOS Agenda & Reservations Views"
Cohesion: 0.08
Nodes (49): AvailabilitySlot, Charts, Double, Enrollment, BarberChartMode, ingresos, servicios, BarberDashboardCharts (+41 more)

### Community 13 - "Dashboard Analytics & Barber Showcase"
Cohesion: 0.05
Nodes (43): react, BookingsInbox(), FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber() (+35 more)

### Community 15 - "EncuentraEstilo (Style Finder) Page"
Cohesion: 0.19
Nodes (12): FACE_SHAPES, GALLERY, GALLERY_CATS, HERO_PHOTOS, u(), CtaBand(), EncuentraEstilo(), Hero() (+4 more)

### Community 16 - "Auth & Booking Concepts"
Cohesion: 0.24
Nodes (16): Admin Key Authentication (shared internal password pattern), Barber Availability Management (barber sets available slots per day), Barber Authentication Flow (username/password, sets active barber session), Dual Authentication System (client auth via phone vs barber/admin auth via username+password), Phone Number as Client Identity (celular = ID de cliente), Manual Slot Blocking (admin blocks time slots per barber per day), TNE Discount (20% for Tarjeta Nacional Estudiantil, non-Bruno services), PIMP STUDIO Logo (JPG, used as brand header/footer image) (+8 more)

### Community 18 - "iOS App Intents & Shortcuts"
Cohesion: 0.06
Nodes (32): App, AppEnum, AppIntent, AppIntents, AppShortcut, AppShortcutsProvider, ColorScheme, Context (+24 more)

### Community 19 - "iOS Design System"
Cohesion: 0.11
Nodes (26): Axis, ButtonRole, CGFloat, BrunettiTheme, EmptyPanel, GlassActionButton, GlassField, GlassFormField (+18 more)

### Community 21 - "iOS Booking Sheet & Reminders"
Cohesion: 0.11
Nodes (28): BookingDraft, EnrollmentDraft, Expense, BookingDraftSheet, BookingSheet, ClientSheet, encoded(), EnrollmentSheet (+20 more)

### Community 22 - "Bookings Store & Account Page"
Cohesion: 0.47
Nodes (8): addLocalBooking(), cancelKeyOf(), cancelLocalBooking(), isCancelled(), mergeBookings(), readCancelledKeys(), readLocalBookings(), writeLocalBookings()

### Community 23 - "index.html PWA Setup"
Cohesion: 0.12
Nodes (19): isStandaloneLaunch() function, Frontend Architecture (React), apple-touch-icon PNG 180 rationale, Blackletter fonts (Pirata One, Manufacturing Consent), format-detection=telephone=no meta rationale, ps_theme_manual / ps_theme localStorage keys, PWA & Standalone Mode redirect, theme-color meta dynamic sync rationale (+11 more)

### Community 25 - "iOS Codable Keys"
Cohesion: 0.18
Nodes (11): CodingKey, CodingKeys, createdAt, edition, email, id, level, message (+3 more)

### Community 26 - "Bruno Hero Image Assets"
Cohesion: 0.29
Nodes (11): Background text: 'El cliente...' (partially visible), Barber (Bruno Brunetti), Dark patterned barber cape, Client in barber cape receiving haircut, Green barber comb (tool), Context: live demo or barbering course/event, Lapel/headset microphone worn by barber, Hero Photo: Brunetti Barber in Action (+3 more)

### Community 28 - "Estilo Teaser Image Assets"
Cohesion: 0.29
Nodes (10): Barber / Instructor (PIMP & STUDIOS branded, tattooed, glasses, mic), Barbershop / studio interior with white brick wall, Client seated in barber chair wearing cape, Haircut / styling service in progress, estilo-teaser.jpg (style module teaser image), PIMP & STUDIOS brand logo (on barber shirt), Mood: professional, focused, editorial photography, Ring light (professional studio lighting behind barber) (+2 more)

### Community 34 - "vercel.json Config"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, outputDirectory, rewrites

### Community 36 - "Fintoc Payments API"
Cohesion: 0.83
Nodes (3): handleCheckout(), handler(), handleWebhook()

### Community 38 - "CSS Stylesheets"
Cohesion: 0.50
Nodes (4): src/styles/brunetti.css, src/styles/estilo.css, src/styles/pimp.css (base styles), src/styles/workshop.css

## Knowledge Gaps
- **190 isolated node(s):** `ALL_BOOKING_SLOTS`, `DEMO_BOOKINGS`, `AppIntents`, `IntentKeys`, `SafariServices` (+185 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useBrunettiFx()` connect `Fintoc Checkout & Site Nav` to `iOS API Client`?**
  _High betweenness centrality (0.302) - this node is a cross-community bridge._
- **Why does `src/App.jsx (routing, PWA launch detection)` connect `index.html PWA Setup` to `Fintoc Checkout & Site Nav`, `Workshop Page & Content`, `Dashboard Analytics & Barber Showcase`, `UI Components & Login`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **What connects `ALL_BOOKING_SLOTS`, `DEMO_BOOKINGS`, `AppIntents` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `iOS Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.08292682926829269 - nodes in this community are weakly interconnected._
- **Should `iOS API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.05895344886170574 - nodes in this community are weakly interconnected._
- **Should `Backend Auth & Project Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.05580693815987934 - nodes in this community are weakly interconnected._
- **Should `Workshop Page & Content` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._