# Graph Report - .  (2026-06-23)

## Corpus Check
- 94 files · ~365,223 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 427 nodes · 715 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Barber Showcase UI|Barber Showcase UI]]
- [[_COMMUNITY_Auth & API Layer|Auth & API Layer]]
- [[_COMMUNITY_Workshop Module|Workshop Module]]
- [[_COMMUNITY_Theme & UI System|Theme & UI System]]
- [[_COMMUNITY_Brunetti Brand & Docs|Brunetti Brand & Docs]]
- [[_COMMUNITY_Barber Modal & Permisos|Barber Modal & Permisos]]
- [[_COMMUNITY_Client Web App|Client Web App]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_Landing Page Components|Landing Page Components]]
- [[_COMMUNITY_Dependencias & Config|Dependencias & Config]]
- [[_COMMUNITY_ELIJA Agent & Integraciones|ELIJA Agent & Integraciones]]
- [[_COMMUNITY_Local Dev Server|Local Dev Server]]
- [[_COMMUNITY_Fotos Bruno Herrera|Fotos Bruno Herrera]]
- [[_COMMUNITY_Client Registration API|Client Registration API]]
- [[_COMMUNITY_Vercel Deploy Config|Vercel Deploy Config]]
- [[_COMMUNITY_Scripts de Propuestas|Scripts de Propuestas]]
- [[_COMMUNITY_Asset Duplicado|Asset Duplicado]]
- [[_COMMUNITY_PDF Export|PDF Export]]

## God Nodes (most connected - your core abstractions)
1. `requireInternal()` - 18 edges
2. `CLP()` - 16 edges
3. `Icon()` - 11 edges
4. `barberById()` - 11 edges
5. `enablePush()` - 10 edges
6. `PushCard()` - 9 edges
7. `web/index.html` - 9 edges
8. `PIMP STUDIO — barbershop brand identity` - 8 edges
9. `readLocalBookings()` - 7 edges
10. `CLPk()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `bruno-hero.jpg — Portrait of young man (Bruno Herrera) wearing glasses and black graphic tee, hands clasped, confident pose against white background` --conceptually_related_to--> `Bruno Herrera — lead barber / brand face of PIMP STUDIO`  [INFERRED]
  public/assets/bruno-hero.jpg → web/servicios.html
- `bruno-feature.jpg — Group photo of workshop graduates with certificates, Bruno Herrera seated in barber chair at center; Tradeus branding on certificates` --conceptually_related_to--> `Bruno Herrera — lead barber / brand face of PIMP STUDIO`  [INFERRED]
  public/assets/bruno-feature.jpg → web/servicios.html
- `bruno-portrait.jpg — Close-up of Bruno Herrera seated in barber chair, smiling, blue cap, all-black outfit; partial view of workshop graduates in background` --conceptually_related_to--> `Bruno Herrera — lead barber / brand face of PIMP STUDIO`  [INFERRED]
  public/assets/bruno-portrait.jpg → web/servicios.html
- `gallery-1.jpg — Black-and-white outdoor barbering scene: barber cutting client's hair beside a Porsche sports car near water/lake` --conceptually_related_to--> `PIMP STUDIO — barbershop brand identity`  [INFERRED]
  public/assets/gallery-1.jpg → web/ingreso.html
- `gallery-3.jpg — Black-and-white barbershop interior: barber (glasses, chain necklace) with phone on gimbal, green-wall background, barber station mirrors with lights` --conceptually_related_to--> `PIMP STUDIO — barbershop brand identity`  [INFERRED]
  public/assets/gallery-3.jpg → web/ingreso.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ELIJA agent skill set** — concept_elija_agent, skills_agenda_skill, skills_correo_skill, skills_pendientes_skill, skills_web_skill [EXTRACTED 1.00]
- **PIMP STUDIO platform modules** — concept_pimpstudio, concept_reservas_module, concept_disponibilidad_module, concept_servicios_module, concept_cursos_module, concept_clientes_module, concept_contacto_module, concept_newsletter_module, concept_gastos_module, concept_finanzas_module [EXTRACTED 1.00]
- **Static web pages for PIMP STUDIO** — web_index_html, web_barberos_html, web_booking_html, web_cliente_html, web_clientes_html, web_contacto_html, web_cursos_html, web_dashboard_html, web_gestion_html [EXTRACTED 1.00]
- **Brunetti single-barber brand migration** — concept_brunetti, concept_brunetti_only_flag, concept_css_scope_brunetti, implementation_plan, changelog_implementacion [EXTRACTED 1.00]
- **Backend infrastructure (Neon + Vercel + Auth)** — concept_neon_db, concept_vercel_deploy, concept_session_auth, concept_local_storage_fallback [EXTRACTED 1.00]
- **Barber access and availability management flow** — web_ingreso_page, web_ingreso_barber_login_form, web_ingreso_barber_availability_form, concept_barber_role, concept_booking_system [INFERRED 0.90]
- **Admin barber account management workflow** — web_ingreso_admin_create_barber_user_form, web_ingreso_admin_create_new_barber_form, concept_admin_role, concept_barber_role [EXTRACTED 1.00]
- **Client registration and booking flow** — web_login_page, web_usuarios_page, web_reservas_page, concept_client_role, concept_booking_system [INFERRED 0.90]
- **PIMP STUDIO brand visual identity assets** — concept_pimp_studio_brand, assets_pimp_studio_logo_svg, assets_pimp_studio_mark_svg, assets_pimp_studio_logo_jpg [INFERRED 0.95]
- **Bruno Herrera personal brand and services** — concept_bruno_herrera, web_servicios_brunetti_experiencia, assets_bruno_hero_jpg, assets_bruno_feature_jpg, assets_bruno_portrait_jpg [INFERRED 0.90]
- **Tradeus Workshop visual documentation** — concept_tradeus_workshop, assets_bruno_feature_jpg, assets_bruno_portrait_jpg, assets_workshop_2026_jpg [INFERRED 0.85]

## Communities (21 total, 3 thin omitted)

### Community 0 - "Barber Showcase UI"
Cohesion: 0.05
Nodes (52): BookingsInbox(), FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber(), STATUS_LABEL (+44 more)

### Community 1 - "Auth & API Layer"
Cohesion: 0.10
Nodes (32): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+24 more)

### Community 2 - "Workshop Module"
Cohesion: 0.06
Nodes (24): FEATURE_CARDS, TESTIMONIALS, WK_BASE, WK_DIAS, WK_ED, WK_MESES, WORKSHOP, WORKSHOP_DATES (+16 more)

### Community 3 - "Theme & UI System"
Cohesion: 0.11
Nodes (25): ThemeCtx, ThemeProvider(), ThemeToggle(), useTheme(), AGENDA_SLOTS, CFG_SECTIONS, ConfigPanel(), DAY_LABELS (+17 more)

### Community 4 - "Brunetti Brand & Docs"
Cohesion: 0.11
Nodes (32): Barber Permissions (Finanzas/Servicios/Equipo/Bloques), Brunetti / Bruno Herrera (single barber brand), BRUNETTI_ONLY flag (single-barber mode), Clientes Module (customer accounts), Contacto Module (contact form + map), .brunetti-site CSS scope (avoid style collision), Cursos Module (barber training courses), Disponibilidad Module (availability management) (+24 more)

### Community 5 - "Barber Modal & Permisos"
Cohesion: 0.09
Nodes (16): ALL_MODULE_IDS, BarberModal(), emptyBarber, MODULES, PERMS, MobileDock(), NAV, SiteNav() (+8 more)

### Community 6 - "Client Web App"
Cohesion: 0.13
Nodes (29): addAppointment(), boot(), digitsOnly(), ensureSeedData(), escapeHtml(), FIGMA_BARBERS, FIGMA_SERVICES, formatCLP() (+21 more)

### Community 7 - "Brand Assets"
Cohesion: 0.08
Nodes (28): gallery-1.jpg — Black-and-white outdoor barbering scene: barber cutting client's hair beside a Porsche sports car near water/lake, gallery-3.jpg — Black-and-white barbershop interior: barber (glasses, chain necklace) with phone on gimbal, green-wall background, barber station mirrors with lights, pimp-studio-logo.jpg — Circular black badge with old-english 'PS' monogram, white on black, watermarked 'Pimp Studio', PIMP_STUDIO_LOGO.svg — SVG logo (white on white, masked image embed), pimp-studio-mark.svg — Dark circular emblem with 'PS' in blackletter/fraktur; gold gradient accent; double-ring border, Admin Role — manages barber accounts, uses admin key, Barber Role — logs in, sets availability blocks, Booking System — service+barber+date+slot reservation flow (+20 more)

### Community 8 - "Landing Page Components"
Cohesion: 0.10
Nodes (20): BrunettiFooter(), scrollToId(), useBrunettiFx(), Cursos(), INCLUDES, MODULES, CARDS, Home() (+12 more)

### Community 9 - "Dependencias & Config"
Cohesion: 0.10
Nodes (20): dependencies, @neondatabase/serverless, react, react-dom, react-router-dom, @vercel/analytics, web-push, devDependencies (+12 more)

### Community 10 - "ELIJA Agent & Integraciones"
Cohesion: 0.20
Nodes (8): ELIJA (AI agent), Integrations Phase 1 (Email, Calendar, Tasks), Integrations Phase 2 (Docs, CRM), Integrations Phase 3 (KPI Dashboard, Memory), Priority Matrix P1/P2/P3, SKILL: Agenda y Calendario, SKILL: Correo, SKILL: Pendientes y Seguimiento

### Community 11 - "Local Dev Server"
Cohesion: 0.15
Nodes (14): fs, handleLocalRegisterClient(), http, LOCAL_CLIENTS_FILE, MIME, normalizePath(), path, PORT (+6 more)

### Community 12 - "Fotos Bruno Herrera"
Cohesion: 0.28
Nodes (9): bruno-feature.jpg — Group photo of workshop graduates with certificates, Bruno Herrera seated in barber chair at center; Tradeus branding on certificates, bruno-hero.jpg — Portrait of young man (Bruno Herrera) wearing glasses and black graphic tee, hands clasped, confident pose against white background, bruno-portrait.jpg — Close-up of Bruno Herrera seated in barber chair, smiling, blue cap, all-black outfit; partial view of workshop graduates in background, workshop-2026.jpg — Large group photo of workshop attendees with certificates in an open hall/venue; Bruno Herrera seated at center in barber chair, Bruno Herrera — lead barber / brand face of PIMP STUDIO, Tradeus Workshop — barber education event with certificates, Brunetti Experiencia — exclusive Bruno Herrera services, servicios.html — Services Page (+1 more)

### Community 14 - "Vercel Deploy Config"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 15 - "Scripts de Propuestas"
Cohesion: 0.83
Nodes (3): extraer_contexto(), main(), sugerir_alcance()

## Knowledge Gaps
- **104 isolated node(s):** `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS`, `DEMO_BOOKINGS`, `DEMO_CLIENTS` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `Barber Modal & Permisos` to `Barber Showcase UI`, `Theme & UI System`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Brandmark()` connect `Barber Modal & Permisos` to `Barber Showcase UI`, `Theme & UI System`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `CLP()` connect `Barber Showcase UI` to `Theme & UI System`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Barber Showcase UI` be split into smaller, more focused modules?**
  _Cohesion score 0.05359937402190924 - nodes in this community are weakly interconnected._
- **Should `Auth & API Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._
- **Should `Workshop Module` be split into smaller, more focused modules?**
  _Cohesion score 0.06477732793522267 - nodes in this community are weakly interconnected._