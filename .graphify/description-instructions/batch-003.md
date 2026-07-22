# Node Description Batch 4 of 11

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

- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7773473c6341e26ac967c8ce1df8adff7d83c23b": "7773473 feat(workshop): actualizar link del video VSL" | kind=Commit | source=git | neighbors=[desarrollo, 0462baf feat(cursos): actualizar acorde…, workshop.js, b37ad49 fix(ios): full-screen en home y…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7be94608abd63b29bf8b4a27fcc38530439b8ee7": "7be9460 fix(vercel): use /tmp storage and serve uploads in serverless" | kind=Commit | source=git | neighbors=[desarrollo, main, 08193b2 fix(vercel): pin node 20 for be…, 9aacc7d fix(vercel): route all requests…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8562b5e61c2749c3b57230e600bdde8f67e34e4d": "8562b5e feat: rebuild figma web as multipage and configure vercel routes" | kind=Commit | source=git | neighbors=[08193b2 fix(vercel): pin node 20 for be…, desarrollo, main, bda2df1 fix: sync production css with l…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@942726a4bb831e26989e7f7908ea63d0efedde50": "942726a fix(móvil): logo nav más grande + barra de estado iOS sigue el tema (si…" | kind=Commit | source=git | neighbors=[9359c80 feat(marca/lámparas): logos bla…, desarrollo, 22be018 fix(nav móvil): logo más grande…, theme.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@95799aa34965352d62e0ca46dcc14acc12068e79": "95799aa fix(dev): mock Fintoc API para desarrollo local" | kind=Commit | source=git | neighbors=[38edd9e feat(cursos): integrar widget F…, desarrollo, 0b98a08 feat(fintoc): widget embebido +…, vite.config.js] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@9aa7f6428b41bbb7d0848f3f1bd5216efe1b20ab": "9aa7f64 fix(ios): theme-color en vivo al togglear (safe-areas sin quedarse en c…" | kind=Commit | source=git | neighbors=[desarrollo, b37ad49 fix(ios): full-screen en home y…, theme.jsx, edfd568 fix(ios): full-screen real en h…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@9aacc7da76205d26751e3d18e49722fcae4542a3": "9aacc7d fix(vercel): route all requests to express server" | kind=Commit | source=git | neighbors=[desarrollo, main, 7be9460 fix(vercel): use /tmp storage a…, ae80c54 chore: remove legacy ELIJA dire…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a2a2a3505d11888ee62be22c930bf2a966eea01a": "a2a2a35 feat(nav): logo como texto escalable + acentos de módulo y ajustes móvi…" | kind=Commit | source=git | neighbors=[144df19 fix: style brand-lockup image s…, desarrollo, 3e4755f fix(nav): alinea el logo dentro…, SiteNav.jsx] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a7b6d242bf5d48866fdd6a0c8d4d79ed892ea215": "a7b6d24 feat(cursos): vincular botón hero a Skool Brunetti Academy" | kind=Commit | source=git | neighbors=[desarrollo, cabf70f fix(cursos): eliminar link Driv…, Cursos.jsx, ad95ff7 fix(cursos): mostrar módulos si…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a90e53cbd4521b22280711408dd8123c72c11fe2": "a90e53c feat: add location module and update gallery assets" | kind=Commit | source=git | neighbors=[desarrollo, main, 7dc26f6 feat: persist registered client…, bda2df1 fix: sync production css with l…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a9400ad54d973c49ae6b3ac7eb482172f3c45a43": "a9400ad fix(móvil full-screen): página llena toda la pantalla (100dvh, sin over…" | kind=Commit | source=git | neighbors=[22be018 fix(nav móvil): logo más grande…, desarrollo, b188c45 fix(nav móvil): lockup centrado…, SiteNav.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ad95ff71791fd13ad64d5137a48246659d7e2b73": "ad95ff7 fix(cursos): mostrar módulos sin depender de IntersectionObserver" | kind=Commit | source=git | neighbors=[0462baf feat(cursos): actualizar acorde…, desarrollo, a7b6d24 feat(cursos): vincular botón he…, Cursos.jsx] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@adfdeba73f0656fcb44a5bf0a2fa86076c0a55d1": "adfdeba feat: integrar Vercel Analytics" | kind=Commit | source=git | neighbors=[desarrollo, 60eafcc feat: rediseño marca personal B…, main.jsx, d226226 feat: acceso a módulos por barb…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ae80c54232ac51762ce8c0fc3456459867e841de": "ae80c54 chore: remove legacy ELIJA directory after root migration" | kind=Commit | source=git | neighbors=[desarrollo, main, 9aacc7d fix(vercel): route all requests…, ca3c038 cambios visualesregistros] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@af6725cf2d7e6e9f14e32c9debb56eb3e8e91eb3": "af6725c feat(cursos): paleta azul #0B129E + hero alineado a la izquierda" | kind=Commit | source=git | neighbors=[desarrollo, 022b435 feat(site): nav unificado, foot…, Cursos.jsx, f64be2f feat(brand+workshop): Brunetti …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@b280a2139f4d04492b9ec139a52ed32ead93dee7": "b280a21 feat(ui): efectos Aceternity en CSS puro + fixes móvil" | kind=Commit | source=git | neighbors=[029c14f fix: nav nowrap, lámparas, pane…, desarrollo, 1aa5739 feat(ui): lámparas en secciones…, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@bafd69f36f24401e25a56ed7d114ce3b0f634f3c": "bafd69f feat: derive finance metrics from bookings" | kind=Commit | source=git | neighbors=[73c9ad0 feat: port liquid glass landing…, desarrollo, 743d0cc feat: redesign UI for web - res…, Dashboard.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@bda2df1cf19c5a4f6f6a6562cade5d8d4fa8c064": "bda2df1 fix: sync production css with local layout" | kind=Commit | source=git | neighbors=[8562b5e feat: rebuild figma web as mult…, desarrollo, main, a90e53c feat: add location module and u…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ca3c0382f2bb4731f20441d63438b52738995997": "ca3c038 cambios visualesregistros" | kind=Commit | source=git | neighbors=[65cf6db Cambios en modulo de registro, desarrollo, main, ae80c54 chore: remove legacy ELIJA dire…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@cabf70f3f413a53eb31e7bb8059d2f6eadd15d9e": "cabf70f fix(cursos): eliminar link Drive, quitar parpadeo al cambiar nivel" | kind=Commit | source=git | neighbors=[a7b6d24 feat(cursos): vincular botón he…, desarrollo, 620d56f fix(theme): hacer visible el ca…, Cursos.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e237f5c374fc398fa596bed9cad4cfd09bf8fbc5": "e237f5c fix: mover web al root" | kind=Commit | source=git | neighbors=[04f26d6 fix estructura para vercel, desarrollo, main, 65cf6db Cambios en modulo de registro] | lang=en
- "components_iconsextra_icon": "Icon()" | kind=code-symbol | source=src/components/IconsExtra.jsx:L30 | neighbors=[BarberShowcase.jsx, BookingsInbox.jsx, DashboardResumen.jsx, IconsExtra.jsx] | lang=en
- "components_ui_emblem": "Emblem()" | kind=code-symbol | source=src/components/ui.jsx:L3 | neighbors=[ui.jsx, BarberLogin.jsx, Booking.jsx, Login.jsx] | lang=en
- "components_ui_mobilescreen": "MobileScreen()" | kind=code-symbol | source=src/components/ui.jsx:L115 | neighbors=[ui.jsx, Account.jsx, Booking.jsx, Login.jsx] | lang=en
- "db_schema_bookings": "bookings" | kind=code-symbol | source=db/schema.sql:L42 | neighbors=[schema.sql, barbers, services, users] | lang=en
- "pages_workshop_useinview": "useInView()" | kind=code-symbol | source=src/pages/Workshop.jsx:L43 | neighbors=[Workshop.jsx, Pricing(), QuoteBlock(), Reveal()] | lang=en
- "src_bookingsstore_addlocalbooking": "addLocalBooking()" | kind=code-symbol | source=src/bookingsStore.js:L43 | neighbors=[Booking.jsx, bookingsStore.js, readLocalBookings(), writeLocalBookings()] | lang=en
- "src_bookingsstore_iscancelled": "isCancelled()" | kind=code-symbol | source=src/bookingsStore.js:L22 | neighbors=[Account.jsx, bookingsStore.js, cancelKeyOf(), readCancelledKeys()] | lang=en
- "src_enrollmentsstore_addlocalenrollment": "addLocalEnrollment()" | kind=code-symbol | source=src/enrollmentsStore.js:L22 | neighbors=[Workshop.jsx, enrollmentsStore.js, readLocalEnrollments(), writeLocalEnrollments()] | lang=en
- "src_push_disablepush": "disablePush()" | kind=code-symbol | source=src/push.js:L129 | neighbors=[Dashboard.jsx, push.js, authHeaders(), registerServiceWorker()] | lang=en
- "src_push_isios": "isIOS()" | kind=code-symbol | source=src/push.js:L18 | neighbors=[Dashboard.jsx, push.js, enablePush(), pushAvailableHere()] | lang=en
- "src_push_isstandalone": "isStandalone()" | kind=code-symbol | source=src/push.js:L25 | neighbors=[Dashboard.jsx, push.js, enablePush(), pushAvailableHere()] | lang=en
- "src_push_notifybarberofbooking": "notifyBarberOfBooking()" | kind=code-symbol | source=src/push.js:L175 | neighbors=[Dashboard.jsx, push.js, notifyLocal(), pushEnabledFor()] | lang=en
- "src_push_notifylocal": "notifyLocal()" | kind=code-symbol | source=src/push.js:L152 | neighbors=[Dashboard.jsx, push.js, notifyBarberOfBooking(), registerServiceWorker()] | lang=en
- "src_push_pushsupported": "pushSupported()" | kind=code-symbol | source=src/push.js:L31 | neighbors=[Dashboard.jsx, push.js, enablePush(), pushAvailableHere()] | lang=en
- "ui_lamp_lamp": "Lamp()" | kind=code-symbol | source=src/components/ui/lamp.jsx:L8 | neighbors=[Cursos.jsx, Home.jsx, Workshop.jsx, lamp.jsx] | lang=en
- "api_auth_barber_handler": "handler()" | kind=code-symbol | source=api/auth-barber.js:L110 | neighbors=[auth-barber.js, handleChangePassword(), handleLogin()] | lang=en
- "api_auth_barber_isadmin": "isAdmin()" | kind=code-symbol | source=api/auth-barber.js:L21 | neighbors=[auth-barber.js, fallbackLogin(), handleLogin()] | lang=en
- "api_auth_login": "auth-login.js" | kind=code-symbol | source=api/auth-login.js:L1 | neighbors=[handler(), 3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…] | lang=en
- "api_auth_readsession": "readSession()" | kind=code-symbol | source=api/_auth.js:L38 | neighbors=[_auth.js, sign(), requireInternal()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-003.json

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
