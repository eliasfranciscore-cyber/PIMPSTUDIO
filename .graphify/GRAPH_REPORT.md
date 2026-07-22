# Graph Report - .  (2026-07-09)

## Corpus Check
- 109 files · ~217,702 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 439 nodes · 942 edges · 18 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 276 · MODIFIES: 245 · ON_BRANCH: 125 · PARENT_OF: 109 · imports: 107 · calls: 74 · references: 6


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 109 · Candidates: 204
- Excluded: 77 untracked · 4895 ignored · 0 sensitive · 7 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `aad8b7e`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `requireInternal()` - 11 edges
2. `Icon()` - 11 edges
3. `enablePush()` - 9 edges
4. `CLP()` - 7 edges
5. `barberById()` - 7 edges
6. `readLocalBookings()` - 6 edges
7. `cancelLocalBooking()` - 6 edges
8. `fallbackLogin()` - 5 edges
9. `handleLogin()` - 5 edges
10. `barbers` - 5 edges

## Surprising Connections (you probably didn't know these)
- `022b435 feat(site): nav unificado, footer compartido, modo claro/oscuro auto + rediseños` --ON_BRANCH--> `desarrollo`  [EXTRACTED]
  git → git  _Bridges community 2 → community 0_
- `029c14f fix: nav nowrap, lámparas, panel tabs, workshop nav, WA btn, login dev fallback` --ON_BRANCH--> `desarrollo`  [EXTRACTED]
  git → git  _Bridges community 3 → community 0_
- `029c14f fix: nav nowrap, lámparas, panel tabs, workshop nav, WA btn, login dev fallback` --PARENT_OF--> `b280a21 feat(ui): efectos Aceternity en CSS puro + fixes móvil`  [EXTRACTED]
  git → git  _Bridges community 3 → community 2_
- `04681a7 fix: botón menú bajo el notch, form de gastos sin superposición, dock sin rebote` --ON_BRANCH--> `desarrollo`  [EXTRACTED]
  git → git  _Bridges community 9 → community 0_
- `04681a7 fix: botón menú bajo el notch, form de gastos sin superposición, dock sin rebote` --PARENT_OF--> `16876ec feat: barberos en mosaico grid, bandeja de reservas y dashboard resumen`  [EXTRACTED]
  git → git  _Bridges community 9 → community 14_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (57): { put }, desarrollo, main, 04f26d6 fix estructura para vercel, 08193b2 fix(vercel): pin node 20 for better-sqlite3 runtime compatibility, 0fbc9fb feat(assets): actualiza foto de Bruno en hero (barbería en acción), 0fcd3e1 Update .DS_Store, 144df19 fix: style brand-lockup image sizing for desktop (+49 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (34): b64url(), BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler(), isAdmin() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (30): 022b435 feat(site): nav unificado, footer compartido, modo claro/oscuro auto + rediseños, 0462baf feat(cursos): actualizar acordeón con módulos reales de comunidad Skool, 053520c feat(workshop/cursos): video VSL, toggle por módulo, lámparas y modo claro, 1aa5739 feat(ui): lámparas en secciones, foto hero → IG, línea visagismo full-width, reservar centrado, 1ed887a fix(site): correcciones de layout + modo claro + foto grupo HD, 5d51045 feat(cursos): eliminar selector de niveles + checkout Fintoc, 5d863f1 chore(graph): actualiza knowledge graph (hero sin gooey + modo claro), 620d56f fix(theme): hacer visible el cambio claro/oscuro (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (26): 029c14f fix: nav nowrap, lámparas, panel tabs, workshop nav, WA btn, login dev fallback, 3dfdd68 feat(workshop): brunetti branding + lamps + glow effects + centered heads, 557c33c feat(workshop): próxima edición 23 de agosto 2026 en Viña del Mar, 71f4522 feat(security+pwa+graphify): PWA → /ingreso, session timeout, login lockout + knowledge graph, 8b2e001 feat(dashboard): service card grid, new KPI panels + full-width buttons, 9fedac7 fix: nav Workshop+acceso, before/after sin colisión, móvil centrado, foto grupal al workshop, cb5cdb5 feat(panel): app interna solo-Brunetti (gestión de horas); resto inactivo y conservado, f64be2f feat(brand+workshop): Brunetti rebrand + workshop ASCENSIÓN (morado) (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (26): 0add054 feat: connect bookings metrics, 2b409d5 feat: refine weekly schedule controls, 2c02137 feat: add client history workspace, 718a371 feat: add barber permission management, 73c9ad0 feat: port liquid glass landing and workshop UI, bafd69f feat: derive finance metrics from bookings, AGENDA_SLOTS, buildWeek() (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (18): formatCLP(), Hero(), Pricing(), QuoteBlock(), Register(), Reveal(), StickyCta(), toEmbedUrl() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (20): 60eafcc feat: rediseño marca personal Brunetti (single-barber) + módulo Cursos, adfdeba feat: integrar Vercel Analytics, b756a8e feat: mobile UX improvements - responsive layouts, dock redesign, settings management, e7c39bc feat: full config panel, logo fix, theme scoped to dashboard, ed15cb2 feat: add theme toggle, iOS mobile dock, header avatar popover, autoTheme(), FloatingThemeToggle(), santiagoHour() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (11): 743d0cc feat: redesign UI for web - responsive grids, compact layouts, GlareCard component, GlareCard(), Emblem(), Icon(), MobileScreen(), ALL_BOOKING_SLOTS, DAYS_ES, MONTHS_ES (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (7): d3c224c feat(site): módulo /style (Encuentra tu estilo) + modo claro premium global, FACE_SHAPES, GALLERY, GALLERY_CATS, u(), Reveal(), useReveal()

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (12): DEMO_BOOKINGS, cleanPhone(), DEMO, handler(), sendJson(), getWebPush(), notifyAll(), notifyBarber() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (11): handleCheckout(), handler(), handleWebhook(), 0b98a08 feat(fintoc): widget embebido + webhook de pagos, 347562f debug: agregar logs para debuguear FINTOC_SECRET_KEY, 38edd9e feat(cursos): integrar widget Fintoc para pagos directos, 95799aa fix(dev): mock Fintoc API para desarrollo local, aad8b7e Add BrunettiCutz native iOS app (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.23
Nodes (9): FILTER_MAP, FILTERS, initialsOf(), ResCard(), ResModal(), resolveBarber(), STATUS_LABEL, STATUS_OPTIONS (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (3): CAT_COLORS, STATUS_DOT, CLPk()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (10): ALL_SLOTS, CAT_LABEL, CLIENT_APPTS, CLIENTS, EXPENSES, isAdminUser(), METRICS, SERVICES (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (5): 16876ec feat: barberos en mosaico grid, bandeja de reservas y dashboard resumen, 8ab8293 fix: panel iOS-proof (navbar/dock fijos), modales de reserva y cliente, textos, Icon(), PATHS, BARBERS

### Community 15 - "Community 15"
Cohesion: 0.39
Nodes (8): availability_blocks, barber_permissions, barbers, bookings, expenses, push_subscriptions, services, users

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): 7e64a81 feat: barberos en modal + permisos, botones funcionales y code-splitting, d226226 feat: acceso a módulos por barbero, dock/nav configurables, fotos y login simple, ALL_MODULE_IDS, emptyBarber, MODULES, PERMS

### Community 17 - "Community 17"
Cohesion: 0.40
Nodes (3): barberById(), cleanPhone(), CLP()

## Knowledge Gaps
- **61 isolated node(s):** `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS`, `DEMO_BOOKINGS`, `DEMO_CLIENTS` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `Community 7` to `Community 16`, `Community 17`, `Community 3`, `Community 6`, `Community 0`, `Community 1`, `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 6` to `Community 4`, `Community 8`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `CLP()` connect `Community 17` to `Community 11`, `Community 12`, `Community 1`, `Community 7`, `Community 4`, `Community 13`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `BARBER_PROFILES`, `ALL_SLOTS`, `STATIC_BARBERS` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06912442396313365 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07294117647058823 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06866002214839424 - nodes in this community are weakly interconnected._