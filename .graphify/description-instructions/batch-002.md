# Node Description Batch 3 of 11

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

- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@1ed887a09da70471ac9bef0b34db6b4aaa1363b2": "1ed887a fix(site): correcciones de layout + modo claro + foto grupo HD" | kind=Commit | source=git | neighbors=[022b435 feat(site): nav unificado, foot…, desarrollo, c427855 fix(site): hero sin gooey + mod…, SiteNav.jsx, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@277b45df00260fc8cc94b729e6d1e23d3b8c4279": "277b45d fix: store registered clients in blob with supported public access" | kind=Commit | source=git | neighbors=[register-client.js, desarrollo, main, 5ddd0c6 fix: support private blob store…, 7dc26f6 feat: persist registered client…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@38edd9e105b7d132794a0331d7c6a1eebd4b125f": "38edd9e feat(cursos): integrar widget Fintoc para pagos directos" | kind=Commit | source=git | neighbors=[desarrollo, 95799aa fix(dev): mock Fintoc API para …, FintocCheckout.jsx, Cursos.jsx, 5d51045 feat(cursos): eliminar selector…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@557c33cc460dfa18f006e0356dc998aa1cc30e62": "557c33c feat(workshop): próxima edición 23 de agosto 2026 en Viña del Mar" | kind=Commit | source=git | neighbors=[desarrollo, 9fedac7 fix: nav Workshop+acceso, befor…, workshop.js, Workshop.jsx, 60eafcc feat: rediseño marca personal B…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@5ddd0c60225525351d70dd900a3e6645df44a456": "5ddd0c6 fix: support private blob stores for client registration" | kind=Commit | source=git | neighbors=[277b45d fix: store registered clients i…, register-client.js, desarrollo, main, 7a0ba42 fix: add adaptive blob access f…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@5e657ec13774b5ce8ccdb7ea42399fff55c09fcf": "5e657ec fix: logo centrado+círculo separado, kicker simplificado, lámparas con …" | kind=Commit | source=git | neighbors=[desarrollo, 0fcd3e1 Update .DS_Store, 9376d66 fix: BC letras 38pt, modal pric…, Home.jsx, b188c45 fix(nav móvil): lockup centrado…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@71f452213eec0d9c2d66b51326e2daad811f07c3": "71f4522 feat(security+pwa+graphify): PWA → /ingreso, session timeout, login loc…" | kind=Commit | source=git | neighbors=[desarrollo, f64be2f feat(brand+workshop): Brunetti …, BarberLogin.jsx, Dashboard.jsx, 8b2e001 feat(dashboard): service card g…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7a0ba42f5eb6d4e259dada60fb1992fd4fb13d5e": "7a0ba42 fix: add adaptive blob access fallback for private stores" | kind=Commit | source=git | neighbors=[5ddd0c6 fix: support private blob store…, register-client.js, desarrollo, main, a781928 fix: reactivate pimpstudio proj…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7dc26f60fb4c9f51257d245806d25ef37993fe83": "7dc26f6 feat: persist registered clients using Vercel Blob API" | kind=Commit | source=git | neighbors=[register-client.js, desarrollo, main, 277b45d fix: store registered clients i…, a90e53c feat: add location module and u…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8de0bcf8c0eacf03566a65bcfc96f745e80d20ef": "8de0bcf fix: separate navbar logos and remove all safe areas for full screen" | kind=Commit | source=git | neighbors=[60f4eee fix: remove safe-area-inset-bot…, desarrollo, e701983 fix: increase logo sizes and ce…, SiteNav.jsx, Booking.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@b756a8ec3eabd2707bee1a7f9d4594c98482d737": "b756a8e feat: mobile UX improvements - responsive layouts, dock redesign, setti…" | kind=Commit | source=git | neighbors=[desarrollo, d6fca2d fix: eliminate horizontal scrol…, MobileDock.jsx, Dashboard.jsx, e7c39bc feat: full config panel, logo f…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@c4278553d9c64c79dd03be5e47359e7abd096d45": "c427855 fix(site): hero sin gooey + modo claro pulido + theme-color iOS dinámico" | kind=Commit | source=git | neighbors=[1ed887a fix(site): correcciones de layo…, desarrollo, 5d863f1 chore(graph): actualiza knowled…, theme.jsx, Home.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d88610382d14a5776992fc6c85f8e9fb36cddb58": "d886103 fix(ui): menu claro sigue tema, timer workshop legible, acceso interno,…" | kind=Commit | source=git | neighbors=[desarrollo, baadf43 chore(graph): sync manifest tra…, SiteNav.jsx, EncuentraEstilo.jsx, e950735 fix(mobile): menu sheet blanco,…] | lang=nl
- "components_brunetti": "brunetti.jsx" | kind=code-symbol | source=src/components/brunetti.jsx:L1 | neighbors=[60eafcc feat: rediseño marca personal B…, d304bcd feat(movil/pwa/push): acceso di…, BrunettiFooter(), scrollToId(), useBrunettiFx()] | lang=en
- "components_fintoccheckout": "FintocCheckout.jsx" | kind=code-symbol | source=src/components/FintocCheckout.jsx:L1 | neighbors=[0b98a08 feat(fintoc): widget embebido +…, 38edd9e feat(cursos): integrar widget F…, ad693d5 refactor(fintoc): unificar chec…, CHECKOUT_ITEMS, FintocCheckout()] | lang=en
- "components_mobiledock": "MobileDock.jsx" | kind=code-symbol | source=src/components/MobileDock.jsx:L1 | neighbors=[b756a8e feat: mobile UX improvements - …, d226226 feat: acceso a módulos por barb…, ed15cb2 feat: add theme toggle, iOS mob…, MobileDock(), Icon()] | lang=en
- "components_theme_usetheme": "useTheme()" | kind=code-symbol | source=src/components/theme.jsx:L89 | neighbors=[theme.jsx, FloatingThemeToggle(), ThemeToggle(), Dashboard.jsx, EncuentraEstilo.jsx] | lang=en
- "data_estilo": "estilo.js" | kind=code-symbol | source=src/data/estilo.js:L1 | neighbors=[d3c224c feat(site): módulo /style (Encu…, FACE_SHAPES, GALLERY, GALLERY_CATS, u()] | lang=en
- "db_schema_barbers": "barbers" | kind=code-symbol | source=db/schema.sql:L13 | neighbors=[schema.sql, availability_blocks, barber_permissions, bookings, push_subscriptions] | lang=en
- "pages_workshop_formatclp": "formatCLP()" | kind=code-symbol | source=src/pages/Workshop.jsx:L148 | neighbors=[Workshop.jsx, Hero(), Pricing(), Register(), StickyCta()] | lang=en
- "src_data_barbers": "BARBERS" | kind=code-symbol | source=src/data.js:L3 | neighbors=[BarberShowcase.jsx, BarberLogin.jsx, Booking.jsx, Dashboard.jsx, data.js] | lang=en
- "src_enrollmentsstore": "enrollmentsStore.js" | kind=code-symbol | source=src/enrollmentsStore.js:L1 | neighbors=[d304bcd feat(movil/pwa/push): acceso di…, addLocalEnrollment(), mergeEnrollments(), readLocalEnrollments(), writeLocalEnrollments()] | lang=en
- "src_push_pushavailablehere": "pushAvailableHere()" | kind=code-symbol | source=src/push.js:L39 | neighbors=[Dashboard.jsx, push.js, isIOS(), isStandalone(), pushSupported()] | lang=en
- "src_push_registerserviceworker": "registerServiceWorker()" | kind=code-symbol | source=src/push.js:L51 | neighbors=[Dashboard.jsx, push.js, disablePush(), enablePush(), notifyLocal()] | lang=en
- "api_auth_barber_handlechangepassword": "handleChangePassword()" | kind=code-symbol | source=api/auth-barber.js:L87 | neighbors=[auth-barber.js, isValidPassword(), sha256(), handler()] | lang=en
- "api_auth_barber_sha256": "sha256()" | kind=code-symbol | source=api/auth-barber.js:L19 | neighbors=[auth-barber.js, fallbackLogin(), handleChangePassword(), handleLogin()] | lang=en
- "api_auth_createsession": "createSession()" | kind=code-symbol | source=api/_auth.js:L23 | neighbors=[_auth.js, auth-barber.js, b64url(), sign()] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@04f26d6b493c77dc8591fc54dd7b3883e7bb7ee1": "04f26d6 fix estructura para vercel" | kind=Commit | source=git | neighbors=[desarrollo, main, e237f5c fix: mover web al root, f0767e7 primer deploy real] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@08193b20686215e1c2d0c88b5597876c3b5ccda5": "08193b2 fix(vercel): pin node 20 for better-sqlite3 runtime compatibility" | kind=Commit | source=git | neighbors=[desarrollo, main, 8562b5e feat: rebuild figma web as mult…, 7be9460 fix(vercel): use /tmp storage a…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@0b98a088212eb4b200325a5f15a1e01effe41309": "0b98a08 feat(fintoc): widget embebido + webhook de pagos" | kind=Commit | source=git | neighbors=[desarrollo, ad693d5 refactor(fintoc): unificar chec…, FintocCheckout.jsx, 95799aa fix(dev): mock Fintoc API para …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@1aa5739b70e342b733738322ad077cc1f772de60": "1aa5739 feat(ui): lámparas en secciones, foto hero → IG, línea visagismo full-w…" | kind=Commit | source=git | neighbors=[desarrollo, d2ea557 feat: dashboard improvements + …, Home.jsx, b280a21 feat(ui): efectos Aceternity en…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@2c021373754b4748b1f4c3034779c774ab1fe08d": "2c02137 feat: add client history workspace" | kind=Commit | source=git | neighbors=[2b409d5 feat: refine weekly schedule co…, desarrollo, 73c9ad0 feat: port liquid glass landing…, Dashboard.jsx] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@347562f3135ec6d2d85f7fc40bc2f36a632ccd17": "347562f debug: agregar logs para debuguear FINTOC_SECRET_KEY" | kind=Commit | source=git | neighbors=[fintoc-payments.js, desarrollo, aad8b7e Add BrunettiCutz native iOS app, ad693d5 refactor(fintoc): unificar chec…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@3baad86cecf1d2a6654de2dac657110ff862892e": "3baad86 feat: agenda tile grid with MAÑANA/TARDE sections + config list→detail …" | kind=Commit | source=git | neighbors=[desarrollo, ea0dc62 feat: mobile booking UX, barber…, Dashboard.jsx, a091c5c fix: sticky topbar on scroll + …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@53f006b70532e2f8ede03e1f5045ac44389647ba": "53f006b fix: separate navbar logos and fix responsive layout" | kind=Commit | source=git | neighbors=[desarrollo, e4f6b47 fix: center brand-text properly…, SiteNav.jsx, e701983 fix: increase logo sizes and ce…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@5d51045c086b726b06a6ff3182cf19dbbf0cc669": "5d51045 feat(cursos): eliminar selector de niveles + checkout Fintoc" | kind=Commit | source=git | neighbors=[desarrollo, 38edd9e feat(cursos): integrar widget F…, Cursos.jsx, 620d56f fix(theme): hacer visible el ca…] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@636dcdd53cbd53d6f4e20290597a2ae3fed5b60a": "636dcdd Merge remote changes" | kind=Commit | source=git | neighbors=[0fcd3e1 Update .DS_Store, desarrollo, 60f4eee fix: remove safe-area-inset-bot…, f373927 fix: update logo to new design …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@65cf6db5e46e1cff6be748395642c804c1a64ec6": "65cf6db Cambios en modulo de registro" | kind=Commit | source=git | neighbors=[desarrollo, main, ca3c038 cambios visualesregistros, e237f5c fix: mover web al root] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@6d6e3039700f3d2113b2fdfb2dbf45cb0ca3aa34": "6d6e303 fix(site): chrome compartido en /style + safe areas full-bleed + CTA le…" | kind=Commit | source=git | neighbors=[desarrollo, 8fc89af chore(graph): actualiza knowled…, EncuentraEstilo.jsx, a8d696d chore(graph): actualiza knowled…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@718a37151a912de0099db88b165bd58a13eef5b9": "718a371 feat: add barber permission management" | kind=Commit | source=git | neighbors=[desarrollo, 0add054 feat: connect bookings metrics, Dashboard.jsx, 8d7573a feat: add barber operations das…] | lang=pt

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-002.json

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
