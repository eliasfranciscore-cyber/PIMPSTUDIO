# Node Description Batch 1 of 11

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

- "branch:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO#desarrollo": "desarrollo" | kind=Branch | source=git | neighbors=[022b435 feat(site): nav unificado, foot…, 029c14f fix: nav nowrap, lámparas, pane…, 0462baf feat(cursos): actualizar acorde…, 04681a7 fix: botón menú bajo el notch, …, 04f26d6 fix estructura para vercel, 053520c feat(workshop/cursos): video VS…] | lang=en
- "pages_dashboard": "Dashboard.jsx" | kind=code-symbol | source=src/pages/Dashboard.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 029c14f fix: nav nowrap, lámparas, pane…, 0add054 feat: connect bookings metrics, 16876ec feat: barberos en mosaico grid,…, 2b409d5 feat: refine weekly schedule co…, 2c02137 feat: add client history worksp…] | lang=en
- "pages_workshop": "Workshop.jsx" | kind=code-symbol | source=src/pages/Workshop.jsx:L1 | neighbors=[053520c feat(workshop/cursos): video VS…, 3dfdd68 feat(workshop): brunetti brandi…, 557c33c feat(workshop): próxima edición…, 73c9ad0 feat: port liquid glass landing…, 8ab8293 fix: panel iOS-proof (navbar/do…, 9359c80 feat(marca/lámparas): logos bla…] | lang=en
- "pages_home": "Home.jsx" | kind=code-symbol | source=src/pages/Home.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 029c14f fix: nav nowrap, lámparas, pane…, 16876ec feat: barberos en mosaico grid,…, 1aa5739 feat(ui): lámparas en secciones…, 1ed887a fix(site): correcciones de layo…, 3867c4f feat: migrar a React+Vite con d…] | lang=en
- "pages_booking": "Booking.jsx" | kind=code-symbol | source=src/pages/Booking.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 3867c4f feat: migrar a React+Vite con d…, 60eafcc feat: rediseño marca personal B…, 743d0cc feat: redesign UI for web - res…, 8d7573a feat: add barber operations das…, 8de0bcf fix: separate navbar logos and …] | lang=en
- "src_data": "data.js" | kind=code-symbol | source=src/data.js:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 2b409d5 feat: refine weekly schedule co…, 3867c4f feat: migrar a React+Vite con d…, 60eafcc feat: rediseño marca personal B…, 8b2e001 feat(dashboard): service card g…, 8d7573a feat: add barber operations das…] | lang=en
- "data_workshop": "workshop.js" | kind=code-symbol | source=src/data/workshop.js:L1 | neighbors=[053520c feat(workshop/cursos): video VS…, 3dfdd68 feat(workshop): brunetti brandi…, 557c33c feat(workshop): próxima edición…, 73c9ad0 feat: port liquid glass landing…, 7773473 feat(workshop): actualizar link…, 8ab8293 fix: panel iOS-proof (navbar/do…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@3867c4f1907ce6eed8ed44d83c7ba12a9888f422": "3867c4f feat: migrar a React+Vite con diseño nuevo negro/dorado completo" | kind=Commit | source=git | neighbors=[auth-barber.js, auth-login.js, availability.js, barbers.js, bookings.js, services.js] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8d7573a07cac0b1bde8850c7d7f8a17bffd4d119": "8d7573a feat: add barber operations dashboard" | kind=Commit | source=git | neighbors=[3867c4f feat: migrar a React+Vite con d…, _auth.js, auth-barber.js, auth-login.js, availability.js, barbers.js] | lang=pt
- "src_app": "App.jsx" | kind=code-symbol | source=src/App.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 3867c4f feat: migrar a React+Vite con d…, 60eafcc feat: rediseño marca personal B…, 73c9ad0 feat: port liquid glass landing…, 7e64a81 feat: barberos en modal + permi…, d304bcd feat(movil/pwa/push): acceso di…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ea0dc62e475ce043159a2414ccbfd472c882c041": "ea0dc62 feat: mobile booking UX, barber login access, push notifications + iOS …" | kind=Commit | source=git | neighbors=[3baad86 feat: agenda tile grid with MAÑ…, auth-barber.js, bookings.js, push.js, desarrollo, fe4fa75 fix: iOS sticky topbars (transp…] | lang=en
- "pages_cursos": "Cursos.jsx" | kind=code-symbol | source=src/pages/Cursos.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 0462baf feat(cursos): actualizar acorde…, 053520c feat(workshop/cursos): video VS…, 38edd9e feat(cursos): integrar widget F…, 5d51045 feat(cursos): eliminar selector…, 60eafcc feat: rediseño marca personal B…] | lang=en
- "components_ui": "ui.jsx" | kind=code-symbol | source=src/components/ui.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 3867c4f feat: migrar a React+Vite con d…, 3dfdd68 feat(workshop): brunetti brandi…, 8ab8293 fix: panel iOS-proof (navbar/do…, d2ea557 feat: dashboard improvements + …, d304bcd feat(movil/pwa/push): acceso di…] | lang=en
- "pages_encuentraestilo": "EncuentraEstilo.jsx" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L1 | neighbors=[6d6e303 fix(site): chrome compartido en…, d3c224c feat(site): módulo /style (Encu…, d886103 fix(ui): menu claro sigue tema,…, useTheme(), FACE_SHAPES, GALLERY] | lang=en
- "components_bookingsinbox": "BookingsInbox.jsx" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 8ab8293 fix: panel iOS-proof (navbar/do…, cb5cdb5 feat(panel): app interna solo-B…, f64be2f feat(brand+workshop): Brunetti …, BookingsInbox(), ConfirmCancel()] | lang=en
- "pages_barberlogin": "BarberLogin.jsx" | kind=code-symbol | source=src/pages/BarberLogin.jsx:L1 | neighbors=[029c14f fix: nav nowrap, lámparas, pane…, 3867c4f feat: migrar a React+Vite con d…, 71f4522 feat(security+pwa+graphify): PW…, 73c9ad0 feat: port liquid glass landing…, 8ab8293 fix: panel iOS-proof (navbar/do…, 8d7573a feat: add barber operations das…] | lang=en
- "branch:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO#main": "main" | kind=Branch | source=git | neighbors=[04f26d6 fix estructura para vercel, 08193b2 fix(vercel): pin node 20 for be…, 277b45d fix: store registered clients i…, 5ddd0c6 fix: support private blob store…, 65cf6db Cambios en modulo de registro, 7a0ba42 fix: add adaptive blob access f…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d304bcd4f892f650979247f1c63c26c2a4b19c63": "d304bcd feat(movil/pwa/push): acceso directo en PWA iOS, fixes responsive y pus…" | kind=Commit | source=git | neighbors=[904a775 chore(graph): actualiza knowled…, enrollments.js, push.js, desarrollo, de49fec chore(graph): sync knowledge gr…, brunetti.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@f64be2f9b3e8dbc458ccecbbc4c49a08d856224f": "f64be2f feat(brand+workshop): Brunetti rebrand + workshop ASCENSIÓN (morado)" | kind=Commit | source=git | neighbors=[71f4522 feat(security+pwa+graphify): PW…, desarrollo, af6725c feat(cursos): paleta azul #0B12…, BookingsInbox.jsx, ClientModal.jsx, liquidShowcase.jsx] | lang=en
- "components_dashboardresumen": "DashboardResumen.jsx" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, 8b2e001 feat(dashboard): service card g…, d2ea557 feat: dashboard improvements + …, Bars(), CAT_COLORS, DashboardResumen()] | lang=en
- "components_sitenav": "SiteNav.jsx" | kind=code-symbol | source=src/components/SiteNav.jsx:L1 | neighbors=[029c14f fix: nav nowrap, lámparas, pane…, 1ed887a fix(site): correcciones de layo…, 3dfdd68 feat(workshop): brunetti brandi…, 53f006b fix: separate navbar logos and …, 8de0bcf fix: separate navbar logos and …, 9359c80 feat(marca/lámparas): logos bla…] | lang=en
- "components_theme": "theme.jsx" | kind=code-symbol | source=src/components/theme.jsx:L1 | neighbors=[022b435 feat(site): nav unificado, foot…, 053520c feat(workshop/cursos): video VS…, 942726a fix(móvil): logo nav más grande…, 9aa7f64 fix(ios): theme-color en vivo a…, c427855 fix(site): hero sin gooey + mod…, e7c39bc feat: full config panel, logo f…] | lang=en
- "pages_account": "Account.jsx" | kind=code-symbol | source=src/pages/Account.jsx:L1 | neighbors=[3867c4f feat: migrar a React+Vite con d…, 743d0cc feat: redesign UI for web - res…, 8d7573a feat: add barber operations das…, ea0dc62 feat: mobile booking UX, barber…, Brandmark(), Icon()] | lang=en
- "api_auth_barber": "auth-barber.js" | kind=code-symbol | source=api/auth-barber.js:L1 | neighbors=[BARBER_PROFILES, fallbackLogin(), fallbackPasswords(), handleChangePassword(), handleLogin(), handler()] | lang=en
- "src_push": "push.js" | kind=code-symbol | source=src/push.js:L1 | neighbors=[ea0dc62 feat: mobile booking UX, barber…, authHeaders(), disablePush(), enablePush(), isIOS(), isStandalone()] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@16876ec742c817ca0aa4037c39c43b0844f52506": "16876ec feat: barberos en mosaico grid, bandeja de reservas y dashboard resumen" | kind=Commit | source=git | neighbors=[04681a7 fix: botón menú bajo el notch, …, desarrollo, 8ab8293 fix: panel iOS-proof (navbar/do…, BarberShowcase.jsx, BookingsInbox.jsx, DashboardResumen.jsx] | lang=en
- "api_auth_requireinternal": "requireInternal()" | kind=code-symbol | source=api/_auth.js:L55 | neighbors=[_auth.js, auth-barber.js, readSession(), availability.js, barbers.js, bookings.js] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8ab8293550e346c2befffc2e1aef29cbc06eb1d6": "8ab8293 fix: panel iOS-proof (navbar/dock fijos), modales de reserva y cliente,…" | kind=Commit | source=git | neighbors=[16876ec feat: barberos en mosaico grid,…, desarrollo, 7e64a81 feat: barberos en modal + permi…, BookingsInbox.jsx, ClientModal.jsx, ui.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@9359c8081e423bf1f1c72fe546ebfee3706336e9": "9359c80 feat(marca/lámparas): logos blackletter vectorizados, lámpara dorada an…" | kind=Commit | source=git | neighbors=[desarrollo, 942726a fix(móvil): logo nav más grande…, ModuleFooter.jsx, SiteNav.jsx, Home.jsx, Workshop.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d3c224c6d08d6f2a377209fb8f67eb8531b7dbd9": "d3c224c feat(site): módulo /style (Encuentra tu estilo) + modo claro premium gl…" | kind=Commit | source=git | neighbors=[5d863f1 chore(graph): actualiza knowled…, desarrollo, a8d696d chore(graph): actualiza knowled…, SiteNav.jsx, estilo.js, Booking.jsx] | lang=en
- "components_ui_icon": "Icon()" | kind=code-symbol | source=src/components/ui.jsx:L50 | neighbors=[BarberModal.jsx, ClientModal.jsx, liquidShowcase.jsx, MobileDock.jsx, SiteNav.jsx, ui.jsx] | lang=en
- "db_schema": "schema.sql" | kind=code-symbol | source=db/schema.sql:L1 | neighbors=[3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…, ea0dc62 feat: mobile booking UX, barber…, availability_blocks, barber_permissions, barbers] | lang=en
- "api_register_client": "register-client.js" | kind=code-symbol | source=api/register-client.js:L1 | neighbors=[{ put }, putClientRecord(), readBody(), sendJson(), 277b45d fix: store registered clients i…, 5ddd0c6 fix: support private blob store…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@60eafcc002e8260e00f14ed0919dbdd50eebc6a0": "60eafcc feat: rediseño marca personal Brunetti (single-barber) + módulo Cursos" | kind=Commit | source=git | neighbors=[desarrollo, 557c33c feat(workshop): próxima edición…, brunetti.jsx, Booking.jsx, Cursos.jsx, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@73c9ad0b808af5d17cf7dc4903871537f516cd85": "73c9ad0 feat: port liquid glass landing and workshop UI" | kind=Commit | source=git | neighbors=[2c02137 feat: add client history worksp…, desarrollo, bafd69f feat: derive finance metrics fr…, liquidShowcase.jsx, workshop.js, BarberLogin.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d226226809d2d5a9a623299914250d398c8f20dc": "d226226 feat: acceso a módulos por barbero, dock/nav configurables, fotos y log…" | kind=Commit | source=git | neighbors=[7e64a81 feat: barberos en modal + permi…, desarrollo, adfdeba feat: integrar Vercel Analytics, BarberModal.jsx, BarberShowcase.jsx, MobileDock.jsx] | lang=en
- "pages_login": "Login.jsx" | kind=code-symbol | source=src/pages/Login.jsx:L1 | neighbors=[3867c4f feat: migrar a React+Vite con d…, 743d0cc feat: redesign UI for web - res…, 8d7573a feat: add barber operations das…, d3c224c feat(site): módulo /style (Encu…, f64be2f feat(brand+workshop): Brunetti …, Emblem()] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@022b4355b85ce4205be1629718e7bda2bade63dc": "022b435 feat(site): nav unificado, footer compartido, modo claro/oscuro auto + …" | kind=Commit | source=git | neighbors=[desarrollo, 1ed887a fix(site): correcciones de layo…, ModuleFooter.jsx, theme.jsx, Cursos.jsx, Dashboard.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e9507355aee5aa4bbe7e6483475ab079d0240910": "e950735 fix(mobile): menu sheet blanco, burger más adentro, hero estilo centrad…" | kind=Commit | source=git | neighbors=[0fbc9fb feat(assets): actualiza foto de…, enrollments.js, desarrollo, d886103 fix(ui): menu claro sigue tema,…, SiteNav.jsx, Cursos.jsx] | lang=en
- "src_bookingsstore": "bookingsStore.js" | kind=code-symbol | source=src/bookingsStore.js:L1 | neighbors=[ea0dc62 feat: mobile booking UX, barber…, addLocalBooking(), cancelKeyOf(), cancelLocalBooking(), isCancelled(), mergeBookings()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-000.json

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
