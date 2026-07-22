# Node Description Batch 2 of 11

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "src_push_enablepush": "enablePush()" | kind=code-symbol | source=src/push.js:L80 | neighbors=[Dashboard.jsx, push.js, authHeaders(), isIOS(), isStandalone(), permissionState()] | lang=en
- "api_enrollments": "enrollments.js" | kind=code-symbol | source=api/enrollments.js:L1 | neighbors=[requireInternal(), cleanPhone(), DEMO, handler(), sendJson(), notifyAll()] | lang=en
- "api_push": "push.js" | kind=code-symbol | source=api/push.js:L1 | neighbors=[requireInternal(), getWebPush(), handler(), notifyAll(), notifyBarber(), d304bcd feat(movil/pwa/push): acceso di…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@053520c5b794c92e35898afbe88e92f00c7b9e20": "053520c feat(workshop/cursos): video VSL, toggle por módulo, lámparas y modo cl…" | kind=Commit | source=git | neighbors=[desarrollo, 36c2adc fix(ios): safe-areas full-scree…, ModuleFooter.jsx, theme.jsx, workshop.js, Cursos.jsx] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ed15cb203dfd8f5395304cf4ca1a0b18a2d0eba0": "ed15cb2 feat: add theme toggle, iOS mobile dock, header avatar popover" | kind=Commit | source=git | neighbors=[743d0cc feat: redesign UI for web - res…, desarrollo, e7c39bc feat: full config panel, logo f…, MobileDock.jsx, theme.jsx, ui.jsx] | lang=en
- "components_barbermodal": "BarberModal.jsx" | kind=code-symbol | source=src/components/BarberModal.jsx:L1 | neighbors=[7e64a81 feat: barberos en modal + permi…, d226226 feat: acceso a módulos por barb…, ALL_MODULE_IDS, BarberModal(), emptyBarber, MODULES] | lang=en
- "components_liquidshowcase": "liquidShowcase.jsx" | kind=code-symbol | source=src/components/liquidShowcase.jsx:L1 | neighbors=[73c9ad0 feat: port liquid glass landing…, f64be2f feat(brand+workshop): Brunetti …, FeatureCarousel(), ImageCompare(), LampBanner(), Testimonials()] | lang=en
- "src_main": "main.jsx" | kind=code-symbol | source=src/main.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 3867c4f feat: migrar a React+Vite con d…, 60eafcc feat: rediseño marca personal B…, 9359c80 feat(marca/lámparas): logos bla…, adfdeba feat: integrar Vercel Analytics, e7c39bc feat: full config panel, logo f…] | lang=en
- "api_auth": "_auth.js" | kind=code-symbol | source=api/_auth.js:L1 | neighbors=[b64url(), createSession(), readSession(), requireInternal(), sign(), 8d7573a feat: add barber operations das…] | lang=en
- "api_bookings": "bookings.js" | kind=code-symbol | source=api/bookings.js:L1 | neighbors=[requireInternal(), DEMO_BOOKINGS, handler(), notifyBarber(), 0add054 feat: connect bookings metrics, 3867c4f feat: migrar a React+Vite con d…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@029c14f807b6eeb2d1c865f60f609fda8258c8c8": "029c14f fix: nav nowrap, lámparas, panel tabs, workshop nav, WA btn, login dev …" | kind=Commit | source=git | neighbors=[desarrollo, b280a21 feat(ui): efectos Aceternity en…, SiteNav.jsx, BarberLogin.jsx, Dashboard.jsx, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@3dfdd6839f0a89898852d18733ba034e1b69b306": "3dfdd68 feat(workshop): brunetti branding + lamps + glow effects + centered hea…" | kind=Commit | source=git | neighbors=[desarrollo, 8b2e001 feat(dashboard): service card g…, SiteNav.jsx, ui.jsx, workshop.js, Workshop.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@743d0cc1bf42c7214fc139b59ac2330bd3ddbc17": "743d0cc feat: redesign UI for web - responsive grids, compact layouts, GlareCar…" | kind=Commit | source=git | neighbors=[desarrollo, ed15cb2 feat: add theme toggle, iOS mob…, GlareCard.jsx, Account.jsx, Booking.jsx, Login.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d2ea5579d87ffe2e3b485f353bf25ea54aa4bed1": "d2ea557 feat: dashboard improvements + lamp halo + visual fixes" | kind=Commit | source=git | neighbors=[1aa5739 feat(ui): lámparas en secciones…, desarrollo, 3dfdd68 feat(workshop): brunetti brandi…, DashboardResumen.jsx, ui.jsx, Dashboard.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@db2b09697f32e60974ffdec0382b2a126d7baf3a": "db2b096 security(api): firma de sesión falla cerrado + elimina secreto público …" | kind=Commit | source=git | neighbors=[baadf43 chore(graph): sync manifest tra…, _auth.js, auth-barber.js, push.js, register-client.js, desarrollo] | lang=nl
- "components_barbershowcase": "BarberShowcase.jsx" | kind=code-symbol | source=src/components/BarberShowcase.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, d226226 feat: acceso a módulos por barb…, BarberCard(), BarberModal(), BarberShowcase(), Icon()] | lang=en
- "components_clientmodal": "ClientModal.jsx" | kind=code-symbol | source=src/components/ClientModal.jsx:L1 | neighbors=[8ab8293 fix: panel iOS-proof (navbar/do…, f64be2f feat(brand+workshop): Brunetti …, ClientModal(), Icon(), barberById(), cleanPhone()] | lang=en
- "components_modulefooter": "ModuleFooter.jsx" | kind=code-symbol | source=src/components/ModuleFooter.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 053520c feat(workshop/cursos): video VS…, 9359c80 feat(marca/lámparas): logos bla…, d304bcd feat(movil/pwa/push): acceso di…, Ic(), ICONS] | lang=en
- "src_data_barberbyid": "barberById()" | kind=code-symbol | source=src/data.js:L136 | neighbors=[BookingsInbox.jsx, ClientModal.jsx, DashboardResumen.jsx, Account.jsx, Booking.jsx, Dashboard.jsx] | lang=en
- "src_data_clp": "CLP()" | kind=code-symbol | source=src/data.js:L134 | neighbors=[BookingsInbox.jsx, ClientModal.jsx, DashboardResumen.jsx, Account.jsx, Booking.jsx, Dashboard.jsx] | lang=en
- "api_availability": "availability.js" | kind=code-symbol | source=api/availability.js:L1 | neighbors=[requireInternal(), ALL_SLOTS, handler(), 2b409d5 feat: refine weekly schedule co…, 3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…] | lang=en
- "api_clients": "clients.js" | kind=code-symbol | source=api/clients.js:L1 | neighbors=[requireInternal(), cleanPhone(), DEMO_CLIENTS, handler(), validateClient(), 8d7573a feat: add barber operations das…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@2b409d5bc10b1ac31b070f6055a9b48b317e07e3": "2b409d5 feat: refine weekly schedule controls" | kind=Commit | source=git | neighbors=[0add054 feat: connect bookings metrics, availability.js, desarrollo, 2c02137 feat: add client history worksp…, Dashboard.jsx, data.js] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7e64a8127e8b8b5ccd328dde05e9a61ed2a9df23": "7e64a81 feat: barberos en modal + permisos, botones funcionales y code-splitting" | kind=Commit | source=git | neighbors=[desarrollo, d226226 feat: acceso a módulos por barb…, BarberModal.jsx, Dashboard.jsx, App.jsx, 8ab8293 fix: panel iOS-proof (navbar/do…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8b2e001bdc5187730e56b1756f391ff14e1681d1": "8b2e001 feat(dashboard): service card grid, new KPI panels + full-width buttons" | kind=Commit | source=git | neighbors=[3dfdd68 feat(workshop): brunetti brandi…, desarrollo, 71f4522 feat(security+pwa+graphify): PW…, DashboardResumen.jsx, Dashboard.jsx, data.js] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@9fedac72c67ae8a55d0b0b1dfb90314a2056cfc1": "9fedac7 fix: nav Workshop+acceso, before/after sin colisión, móvil centrado, fo…" | kind=Commit | source=git | neighbors=[557c33c feat(workshop): próxima edición…, desarrollo, cb5cdb5 feat(panel): app interna solo-B…, workshop.js, Cursos.jsx, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ad693d57805b0c50d92228f71f8acd89b7232944": "ad693d5 refactor(fintoc): unificar checkout + webhook en una sola function" | kind=Commit | source=git | neighbors=[0b98a08 feat(fintoc): widget embebido +…, fintoc-payments.js, desarrollo, 347562f debug: agregar logs para debugu…, FintocCheckout.jsx, vite.config.js] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@cb5cdb52f5c189fc545b11efe93592619bbd4955": "cb5cdb5 feat(panel): app interna solo-Brunetti (gestión de horas); resto inacti…" | kind=Commit | source=git | neighbors=[9fedac7 fix: nav Workshop+acceso, befor…, desarrollo, 029c14f fix: nav nowrap, lámparas, pane…, BookingsInbox.jsx, BarberLogin.jsx, Dashboard.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e7c39bce97228558f43531e998aced88fa8f709f": "e7c39bc feat: full config panel, logo fix, theme scoped to dashboard" | kind=Commit | source=git | neighbors=[desarrollo, b756a8e feat: mobile UX improvements - …, theme.jsx, Dashboard.jsx, main.jsx, ed15cb2 feat: add theme toggle, iOS mob…] | lang=en
- "src_bookingsstore_cancellocalbooking": "cancelLocalBooking()" | kind=code-symbol | source=src/bookingsStore.js:L28 | neighbors=[Account.jsx, bookingsStore.js, cancelKeyOf(), readCancelledKeys(), readLocalBookings(), writeLocalBookings()] | lang=en
- "src_bookingsstore_readlocalbookings": "readLocalBookings()" | kind=code-symbol | source=src/bookingsStore.js:L12 | neighbors=[Account.jsx, Dashboard.jsx, bookingsStore.js, addLocalBooking(), cancelLocalBooking(), mergeBookings()] | lang=en
- "vite_config": "vite.config.js" | kind=code-symbol | source=vite.config.js:L1 | neighbors=[0462baf feat(cursos): actualizar acorde…, 3867c4f feat: migrar a React+Vite con d…, 95799aa fix(dev): mock Fintoc API para …, ad693d5 refactor(fintoc): unificar chec…, f64be2f feat(brand+workshop): Brunetti …, mockFintocPlugin] | lang=en
- "api_auth_barber_fallbacklogin": "fallbackLogin()" | kind=code-symbol | source=api/auth-barber.js:L43 | neighbors=[auth-barber.js, fallbackPasswords(), isAdmin(), sha256(), handleLogin()] | lang=en
- "api_auth_barber_handlelogin": "handleLogin()" | kind=code-symbol | source=api/auth-barber.js:L53 | neighbors=[auth-barber.js, fallbackLogin(), isAdmin(), sha256(), handler()] | lang=en
- "api_barbers": "barbers.js" | kind=code-symbol | source=api/barbers.js:L1 | neighbors=[requireInternal(), handler(), STATIC_BARBERS, 3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…] | lang=en
- "api_expenses": "expenses.js" | kind=code-symbol | source=api/expenses.js:L1 | neighbors=[requireInternal(), DEMO_EXPENSES, handler(), validateExpense(), 8d7573a feat: add barber operations das…] | lang=en
- "api_fintoc_payments": "fintoc-payments.js" | kind=code-symbol | source=api/fintoc-payments.js:L1 | neighbors=[handleCheckout(), handler(), handleWebhook(), 347562f debug: agregar logs para debugu…, ad693d5 refactor(fintoc): unificar chec…] | lang=en
- "api_services": "services.js" | kind=code-symbol | source=api/services.js:L1 | neighbors=[requireInternal(), handler(), STATIC_SERVICES, 3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@0462baf80a73756e33204b7e3070ad2e4c8d563f": "0462baf feat(cursos): actualizar acordeón con módulos reales de comunidad Skool" | kind=Commit | source=git | neighbors=[desarrollo, ad95ff7 fix(cursos): mostrar módulos si…, Cursos.jsx, vite.config.js, 7773473 feat(workshop): actualizar link…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@0add054b59d7340be7fcccbf503e1f663edfc513": "0add054 feat: connect bookings metrics" | kind=Commit | source=git | neighbors=[bookings.js, desarrollo, 2b409d5 feat: refine weekly schedule co…, Dashboard.jsx, 718a371 feat: add barber permission man…] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-001.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
