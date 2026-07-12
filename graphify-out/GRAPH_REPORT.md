# Graph Report - PIMPSTUDIO-desarrollo  (2026-07-11)

## Corpus Check
- 113 files · ~467,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 925 nodes · 1785 edges · 84 communities (45 shown, 39 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2476a7a6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- iOS Data Models
- iOS API Client
- Backend Auth & Project Docs
- Workshop Page & Content
- Vercel API Handlers
- Cursos.jsx
- Legacy Static Site (web/app.js)
- UI Components & Login
- package.json Config
- iOS Detail Sheets & Module Views
- Fintoc Checkout & Site Nav
- Booking Page & Static Data
- iOS Agenda & Reservations Views
- Dashboard Analytics & Barber Showcase
- workshop.js
- EncuentraEstilo (Style Finder) Page
- Auth & Booking Concepts
- ui.jsx
- iOS App Intents & Shortcuts
- iOS Design System
- data.js
- iOS Booking Sheet & Reminders
- Bookings Store & Account Page
- index.html PWA Setup
- AppTab
- iOS Codable Keys
- Bruno Hero Image Assets
- iOS Dashboard & Login Views
- Estilo Teaser Image Assets
- Legacy ELIJA Agent Docs
- BookingsInbox.jsx
- enrollmentsStore.js
- DashboardModel
- ELIJA Agent Knowledge Base
- vercel.json Config
- Register Client API
- Fintoc Payments API
- Proposal Generator Script
- CSS Stylesheets
- Claude Dev Wrapper Script
- Proposal Templates & Inbox Demo
- DetailSheets.swift
- Implementation Plan & CSS Scope
- Gallery Image 1
- Gallery Image 2
- Gallery Image 3
- PIMP Studio Logo Assets
- SettingsView
- Vite Config & Fintoc Mock
- Legacy Contact & Cursos Pages
- SwiftUI
- NewBookingModal.jsx
- Bruno Feature Image
- Bruno Portrait Image
- Workshop 2026 Image
- Legacy Clientes Page
- Legacy Index Page
- Pagina HTML Booking Reserva
- Pagina HTML Cliente Reserva y Perfil
- api/barbers.js (team/permissions listing)
- api/enrollments.js (course/workshop enrollments)
- api/register-client.js (public client registration fallback)
- Brunetti single-barber rebrand
- Hero gooey-effect removal
- Light-mode polish pass
- ADMIN_API_TOKEN env var
- brunetticutz.cl (production domain)
- Native iOS features (dashboard, agenda, clients, workshop, settings)
- Liquid Glass with fallback for older systems
- pimpstudio.cl (308 redirect to apex)
- vercel dev --listen 3003 (local API server)
- CSS Scoped Under brunetti-site Class
- BrunettiCutz iOS app (SwiftUI, native)
- BrunettiCutz.xcodeproj
- cl.brunetticutz.internal (bundle id)
- ELIJA agent layer (docs/knowledge/skills/scripts)
- server.js (legacy local SQLite backend)
- Archivos en desuso/ (legacy, gitignored)
- Brunetti · Barber Studio — Web + Panel (README)
- src/styles/estilo.css

## God Nodes (most connected - your core abstractions)
1. `DashboardModel` - 56 edges
2. `APIClient` - 34 edges
3. `CLP()` - 24 edges
4. `Client` - 22 edges
5. `SessionStore` - 21 edges
6. `requireInternal()` - 20 edges
7. `BookingStatus` - 19 edges
8. `Dashboard()` - 19 edges
9. `ServiceItem` - 16 edges
10. `Barber` - 15 edges

## Surprising Connections (you probably didn't know these)
- `PIMP STUDIO Logo (JPG, used as brand header/footer image)` --semantically_similar_to--> `PIMP STUDIO Logo JPG (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/pimp-studio-logo.jpg → web/assets/pimp-studio-logo.jpg
- `Dashboard Page (Client Panel)` --references--> `PIMP STUDIO Logo (JPG, used as brand header/footer image)`  [EXTRACTED]
  web/dashboard.html → public/assets/pimp-studio-logo.jpg
- `Gallery Image 1 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 1 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-1.jpg → web/assets/gallery-1.jpg
- `Gallery Image 2 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 2 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-2.png → web/assets/gallery-2.png
- `Gallery Image 3 (barbershop work/style photo)` --semantically_similar_to--> `Gallery Image 3 (web/assets copy)`  [INFERRED] [semantically similar]
  public/assets/gallery-3.jpg → web/assets/gallery-3.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PIMP STUDIO Brand Asset Set (logo JPG + mark SVG + logo SVG used across all pages)** — public_assets_pimp_studio_logo_jpg, public_assets_pimp_studio_mark_svg, public_assets_pimp_studio_logo_svg [INFERRED 0.75]

## Communities (84 total, 39 thin omitted)

### Community 0 - "iOS Data Models"
Cohesion: 0.08
Nodes (20): App, ColorScheme, Data, Foundation, BrunettiCutzApp, RootView, AppTab, Date (+12 more)

### Community 1 - "iOS API Client"
Cohesion: 0.09
Nodes (30): Any, Decodable, Error, APIClient, APIError, badStatus, invalidURL, missingData (+22 more)

### Community 2 - "Backend Auth & Project Docs"
Cohesion: 0.14
Nodes (14): Account, App(), BarberLogin, Booking, Cursos, Dashboard, EncuentraEstilo, isStandaloneLaunch() (+6 more)

### Community 3 - "Workshop Page & Content"
Cohesion: 0.06
Nodes (35): FEATURE_CARDS, TESTIMONIALS, WK_BASE, WK_DIAS, WK_ED, WK_MESES, WORKSHOP, WORKSHOP_DATES (+27 more)

### Community 4 - "Vercel API Handlers"
Cohesion: 0.08
Nodes (42): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+34 more)

### Community 5 - "Cursos.jsx"
Cohesion: 0.12
Nodes (30): CLIENTS, EXPENSES, isAdminUser(), TODAY_BOOKINGS, AGENDA_SLOTS, buildWeek(), CFG_SECTIONS, ConfigPanel() (+22 more)

### Community 6 - "Legacy Static Site (web/app.js)"
Cohesion: 0.07
Nodes (26): API Error Handling, Architecture, Backend (Vercel Functions), Build & Deployment, Build for production, Common Tasks, Database (PostgreSQL), Database schema setup (after cloning) (+18 more)

### Community 7 - "UI Components & Login"
Cohesion: 0.19
Nodes (12): FACE_SHAPES, GALLERY, GALLERY_CATS, HERO_PHOTOS, u(), CtaBand(), EncuentraEstilo(), Hero() (+4 more)

### Community 8 - "package.json Config"
Cohesion: 0.08
Nodes (25): dependencies, framer-motion, @neondatabase/serverless, react-dom, react-router-dom, @vercel/analytics, web-push, devDependencies (+17 more)

### Community 9 - "iOS Detail Sheets & Module Views"
Cohesion: 0.21
Nodes (29): Codable, Hashable, Identifiable, DemoData, Booking, APIEndpointStatus, APIHealth, AvailabilitySlot (+21 more)

### Community 10 - "Fintoc Checkout & Site Nav"
Cohesion: 0.12
Nodes (16): EditContext, NAV, SiteNav(), Lamp(), CARD_IMAGES, CARDS, CAT_TAG, FALLBACK_SERVICES (+8 more)

### Community 11 - "Booking Page & Static Data"
Cohesion: 0.08
Nodes (25): 2026-06-12 - Base operativa clientes, agenda y panel interno, 2026-06-13 - Rediseño UI para web y componentes responsivos, 2026-06-22 - Marca personal Brunetti (un solo barbero) + módulo Cursos + panel interno solo-Brunetti, 2026-06-24 - Hero Brunetti sin efecto gooey + modo claro pulido en todos los módulos, Archivos modificados, Archivos modificados, Archivos modificados, Archivos principales tocados (+17 more)

### Community 12 - "iOS Agenda & Reservations Views"
Cohesion: 0.09
Nodes (44): Charts, isoDate(), Date, BarberChartMode, ingresos, servicios, BarberDashboardCharts, BookingRow (+36 more)

### Community 13 - "Dashboard Analytics & Barber Showcase"
Cohesion: 0.10
Nodes (28): react, Bars(), CAT_COLORS, DashboardResumen(), getSvcIconByName(), localDateKey(), PeakHours(), STATUS_DOT (+20 more)

### Community 14 - "workshop.js"
Cohesion: 0.29
Nodes (7): autoTheme(), FloatingThemeToggle(), santiagoHour(), ThemeCtx, ThemeProvider(), ThemeToggle(), useTheme()

### Community 15 - "EncuentraEstilo (Style Finder) Page"
Cohesion: 0.60
Nodes (5): BARBERS, BarberLogin(), clearLockout(), getLockout(), setLockout()

### Community 16 - "Auth & Booking Concepts"
Cohesion: 0.24
Nodes (16): Admin Key Authentication (shared internal password pattern), Barber Availability Management (barber sets available slots per day), Barber Authentication Flow (username/password, sets active barber session), Dual Authentication System (client auth via phone vs barber/admin auth via username+password), Phone Number as Client Identity (celular = ID de cliente), Manual Slot Blocking (admin blocks time slots per barber per day), TNE Discount (20% for Tarjeta Nacional Estudiantil, non-Bruno services), PIMP STUDIO Logo (JPG, used as brand header/footer image) (+8 more)

### Community 17 - "ui.jsx"
Cohesion: 0.10
Nodes (16): ALL_MODULE_IDS, BarberModal(), emptyBarber, MODULES, PERMS, MobileDock(), Brandmark(), Emblem() (+8 more)

### Community 18 - "iOS App Intents & Shortcuts"
Cohesion: 0.15
Nodes (12): AppEnum, AppIntent, AppIntents, AppShortcut, AppShortcutsProvider, DisplayRepresentation, IntentResult, AppTab (+4 more)

### Community 19 - "iOS Design System"
Cohesion: 0.11
Nodes (25): Axis, ButtonRole, CGFloat, BrunettiTheme, EmptyPanel, GlassActionButton, GlassField, GlassFormField (+17 more)

### Community 20 - "data.js"
Cohesion: 0.18
Nodes (16): GlareCard(), ALL_SLOTS, CAT_LABEL, CLIENT_APPTS, DAYS_ES, MONTHS_ES, SERVICE_BARBERS, SERVICES (+8 more)

### Community 21 - "iOS Booking Sheet & Reminders"
Cohesion: 0.17
Nodes (19): ASSETS_DIR, CONTENT_DIR, CORS, fileFromEditId(), fileQueues, handleListAssets(), handleSave(), handleSaveOverride() (+11 more)

### Community 22 - "Bookings Store & Account Page"
Cohesion: 0.41
Nodes (10): addLocalBooking(), cancelKeyOf(), cancelLocalBooking(), isCancelled(), mergeBookings(), readCancelledKeys(), readLocalBookings(), writeLocalBookings() (+2 more)

### Community 23 - "index.html PWA Setup"
Cohesion: 0.22
Nodes (9): apple-touch-icon PNG 180 rationale, Blackletter fonts (Pirata One, Manufacturing Consent), format-detection=telephone=no meta rationale, ps_theme_manual / ps_theme localStorage keys, theme-color meta dynamic sync rationale, index.html (entry, meta/PWA/no-flash theme), Hero image LCP preload (bruno-hero.jpg), No-flash theme init script (Santiago timezone based) (+1 more)

### Community 24 - "AppTab"
Cohesion: 0.25
Nodes (8): EditingContext, OverridesContext, Editable(), styleFromOverride(), EditableText(), DevEditProvider(), EditProvider(), beginDrag()

### Community 25 - "iOS Codable Keys"
Cohesion: 0.18
Nodes (11): CodingKey, CodingKeys, createdAt, edition, email, id, level, message (+3 more)

### Community 26 - "Bruno Hero Image Assets"
Cohesion: 0.29
Nodes (11): Background text: 'El cliente...' (partially visible), Barber (Bruno Brunetti), Dark patterned barber cape, Client in barber cape receiving haircut, Green barber comb (tool), Context: live demo or barbering course/event, Lapel/headset microphone worn by barber, Hero Photo: Brunetti Barber in Action (+3 more)

### Community 27 - "iOS Dashboard & Login Views"
Cohesion: 0.33
Nodes (3): editor, ROOT, vite

### Community 28 - "Estilo Teaser Image Assets"
Cohesion: 0.29
Nodes (10): Barber / Instructor (PIMP & STUDIOS branded, tattooed, glasses, mic), Barbershop / studio interior with white brick wall, Client seated in barber chair wearing cape, Haircut / styling service in progress, estilo-teaser.jpg (style module teaser image), PIMP & STUDIOS brand logo (on barber shirt), Mood: professional, focused, editorial photography, Ring light (professional studio lighting behind barber) (+2 more)

### Community 30 - "BookingsInbox.jsx"
Cohesion: 0.14
Nodes (19): BookingsInbox(), CalendarModal(), FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber() (+11 more)

### Community 32 - "DashboardModel"
Cohesion: 0.16
Nodes (11): DashboardModel, Date, Double, String, URL, ClientSheet, EnrollmentSheet, ExpenseSheet (+3 more)

### Community 33 - "ELIJA Agent Knowledge Base"
Cohesion: 0.22
Nodes (8): Base de datos (Neon), Brunetti · Barber Studio — Web + Panel, Deploy, Estructura, Puesta en marcha (PC nuevo), Requisitos, Scripts, Variables de entorno

### Community 34 - "vercel.json Config"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, outputDirectory, rewrites

### Community 36 - "Fintoc Payments API"
Cohesion: 0.25
Nodes (7): Abrir en Xcode, APIs usadas, Brunetti Cutz iOS, Build nativo e IPA, Funciones nativas incluidas, Servidor local, Sesion interna y fallback

### Community 37 - "Proposal Generator Script"
Cohesion: 0.38
Nodes (5): Context, SafariView, URL, SFSafariViewController, UIViewControllerRepresentable

### Community 38 - "CSS Stylesheets"
Cohesion: 0.16
Nodes (11): scrollToId(), useBrunettiFx(), CHECKOUT_ITEMS, FintocCheckout(), ICONS, ModuleFooter(), Cursos(), INCLUDE_ICONS (+3 more)

### Community 41 - "DetailSheets.swift"
Cohesion: 0.13
Nodes (21): BookingDraftSheet, BookingSheet, encoded(), reminderDate(), scheduleReminder(), StatusChoiceButton, Booking, Bool (+13 more)

### Community 43 - "Implementation Plan & CSS Scope"
Cohesion: 0.40
Nodes (4): Decisiones clave (confirmadas con el usuario), Estado / Checklist por fases, Notas de retoma (si se corta), Plan de implementación — Rediseño Brunetti (marca personal Bruno Herrera)

### Community 48 - "SettingsView"
Cohesion: 0.12
Nodes (16): CaseIterable, DashboardFocus, dia, semana, workshop, AppTab, clientes, finanzas (+8 more)

### Community 51 - "SwiftUI"
Cohesion: 0.22
Nodes (8): DashboardView, ModuleHost, AppTab, Int, LoginView, Bool, SafariServices, SwiftUI

### Community 52 - "NewBookingModal.jsx"
Cohesion: 0.33
Nodes (7): DEFAULT_SLOTS, NewBookingModal(), STATUS_OPTIONS, svcIcon(), todayKey(), NewClientModal(), cleanPhone()

## Knowledge Gaps
- **250 isolated node(s):** `dev-wrapper.sh script`, `NVM_DIR`, `ALL_SLOTS`, `STATIC_BARBERS`, `DEMO_BOOKINGS` (+245 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SwiftUI` connect `SwiftUI` to `iOS Data Models`, `DetailSheets.swift`, `iOS Detail Sheets & Module Views`, `iOS Agenda & Reservations Views`, `iOS Design System`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `DashboardModel` connect `DashboardModel` to `iOS Data Models`, `iOS API Client`, `iOS Detail Sheets & Module Views`, `DetailSheets.swift`, `iOS Agenda & Reservations Views`, `SettingsView`, `SwiftUI`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `react` connect `Dashboard Analytics & Barber Showcase` to `package.json Config`, `EncuentraEstilo (Style Finder) Page`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `dev-wrapper.sh script`, `NVM_DIR`, `ALL_SLOTS` to the rest of the system?**
  _258 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `iOS Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.08013937282229965 - nodes in this community are weakly interconnected._
- **Should `iOS API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.08633879781420765 - nodes in this community are weakly interconnected._
- **Should `Backend Auth & Project Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._