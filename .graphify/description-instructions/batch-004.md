# Node Description Batch 5 of 11

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

- "api_auth_sign": "sign()" | kind=code-symbol | source=api/_auth.js:L18 | neighbors=[_auth.js, createSession(), readSession()] | lang=en
- "api_clients_cleanphone": "cleanPhone()" | kind=code-symbol | source=api/clients.js:L10 | neighbors=[clients.js, handler(), validateClient()] | lang=en
- "api_clients_handler": "handler()" | kind=code-symbol | source=api/clients.js:L24 | neighbors=[clients.js, cleanPhone(), validateClient()] | lang=en
- "api_clients_validateclient": "validateClient()" | kind=code-symbol | source=api/clients.js:L14 | neighbors=[clients.js, handler(), cleanPhone()] | lang=en
- "api_enrollments_handler": "handler()" | kind=code-symbol | source=api/enrollments.js:L27 | neighbors=[enrollments.js, cleanPhone(), sendJson()] | lang=en
- "api_fintoc_payments_handler": "handler()" | kind=code-symbol | source=api/fintoc-payments.js:L9 | neighbors=[fintoc-payments.js, handleCheckout(), handleWebhook()] | lang=en
- "api_push_getwebpush": "getWebPush()" | kind=code-symbol | source=api/push.js:L15 | neighbors=[push.js, notifyAll(), notifyBarber()] | lang=en
- "api_push_notifyall": "notifyAll()" | kind=code-symbol | source=api/push.js:L63 | neighbors=[enrollments.js, push.js, getWebPush()] | lang=en
- "api_push_notifybarber": "notifyBarber()" | kind=code-symbol | source=api/push.js:L31 | neighbors=[bookings.js, push.js, getWebPush()] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@04681a7f555ad6135978205c5c08fc521886accb": "04681a7 fix: botón menú bajo el notch, form de gastos sin superposición, dock s…" | kind=Commit | source=git | neighbors=[desarrollo, 16876ec feat: barberos en mosaico grid,…, e33f475 fix: navbars position:fixed (de…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@0fbc9fb52d180131b6db6f312e1b580879ac2c5f": "0fbc9fb feat(assets): actualiza foto de Bruno en hero (barbería en acción)" | kind=Commit | source=git | neighbors=[desarrollo, e950735 fix(mobile): menu sheet blanco,…, 8fc89af chore(graph): actualiza knowled…] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@0fcd3e1244f45425c0eb48d7ed16dc5f901c5773": "0fcd3e1 Update .DS_Store" | kind=Commit | source=git | neighbors=[desarrollo, 636dcdd Merge remote changes, 5e657ec fix: logo centrado+círculo sepa…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@144df192a993c2442a96feb4b8b133f7195aea1d": "144df19 fix: style brand-lockup image sizing for desktop" | kind=Commit | source=git | neighbors=[desarrollo, a2a2a35 feat(nav): logo como texto esca…, e4f6b47 fix: center brand-text properly…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@22be01874968efb88f11f69b13c42dc0f8b4436f": "22be018 fix(nav móvil): logo más grande y NÍTIDO (lockup sin glow, viewBox ajus…" | kind=Commit | source=git | neighbors=[desarrollo, a9400ad fix(móvil full-screen): página …, 942726a fix(móvil): logo nav más grande…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@36c2adc104d37afdeb8c5ba46660dc138439e12b": "36c2adc fix(ios): safe-areas full-screen en todos los módulos (fondo fijo por t…" | kind=Commit | source=git | neighbors=[053520c feat(workshop/cursos): video VS…, desarrollo, edfd568 fix(ios): full-screen real en h…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@3e4755fad9c5405bf13eedb7192980286413f7ef": "3e4755f fix(nav): alinea el logo dentro de la píldora del navbar en desktop" | kind=Commit | source=git | neighbors=[desarrollo, 7b6abb2 feat(nav): el logotipo adopta e…, a2a2a35 feat(nav): logo como texto esca…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@52c7d4b25a0d08235a384143efc324744da15266": "52c7d4b chore(repo): mueve sitio estático legacy + backend local + capa ELIJA a…" | kind=Commit | source=git | neighbors=[desarrollo, ffc1787 perf+docs: headers de caché/seg…, db2b096 security(api): firma de sesión …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@5d863f1cd93b3d72724878b6345fdc8d259419fd": "5d863f1 chore(graph): actualiza knowledge graph (hero sin gooey + modo claro)" | kind=Commit | source=git | neighbors=[desarrollo, d3c224c feat(site): módulo /style (Encu…, c427855 fix(site): hero sin gooey + mod…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@60f4eeebb1a161964b5cd909f3a90c4881ce4d98": "60f4eee fix: remove safe-area-inset-bottom for full-screen mobile view" | kind=Commit | source=git | neighbors=[desarrollo, 8de0bcf fix: separate navbar logos and …, 636dcdd Merge remote changes] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@620d56f927e9ab71be57ce185b639f25e38b288d": "620d56f fix(theme): hacer visible el cambio claro/oscuro" | kind=Commit | source=git | neighbors=[desarrollo, 5d51045 feat(cursos): eliminar selector…, cabf70f fix(cursos): eliminar link Driv…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@7b6abb22661b5f49f867dc7830998bab70410108": "7b6abb2 feat(nav): el logotipo adopta el color del módulo en /cursos y /workshop" | kind=Commit | source=git | neighbors=[3e4755f fix(nav): alinea el logo dentro…, desarrollo, 053520c feat(workshop/cursos): video VS…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@8fc89af5839e556cb228a53a32fe9202fb2c79b1": "8fc89af chore(graph): actualiza knowledge graph (chrome compartido /style + fix…" | kind=Commit | source=git | neighbors=[6d6e303 fix(site): chrome compartido en…, desarrollo, 0fbc9fb feat(assets): actualiza foto de…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@904a775057966afa63f6648ceabd8ea9cea0c529": "904a775 chore(graph): actualiza knowledge graph tras auditoría/limpieza (api ha…" | kind=Commit | source=git | neighbors=[desarrollo, d304bcd feat(movil/pwa/push): acceso di…, ffc1787 perf+docs: headers de caché/seg…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@9376d66f19a07fe6a3df3546d135447eac2bc11a": "9376d66 fix: BC letras 38pt, modal pricing claro+morado, tema auto por horario" | kind=Commit | source=git | neighbors=[5e657ec fix: logo centrado+círculo sepa…, desarrollo, f373927 fix: update logo to new design …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a091c5c1dc26788923acd480f927160a8a3f42a1": "a091c5c fix: sticky topbar on scroll + vertical config nav on mobile" | kind=Commit | source=git | neighbors=[desarrollo, 3baad86 feat: agenda tile grid with MAÑ…, d6fca2d fix: eliminate horizontal scrol…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a78192884d03cabc14f8f55fbe92ccc285b09df6": "a781928 fix: reactivate pimpstudio project on vercel" | kind=Commit | source=git | neighbors=[7a0ba42 fix: add adaptive blob access f…, desarrollo, 3867c4f feat: migrar a React+Vite con d…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@a8d696d58b0141b99a527926ebf657dac809e4c4": "a8d696d chore(graph): actualiza knowledge graph (módulo /style + modo claro pre…" | kind=Commit | source=git | neighbors=[desarrollo, 6d6e303 fix(site): chrome compartido en…, d3c224c feat(site): módulo /style (Encu…] | lang=pt
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@b188c451e8f6717b29e8d6b96db36cf81d7d9256": "b188c45 fix(nav móvil): lockup centrado en la barra y subido (padding vertical …" | kind=Commit | source=git | neighbors=[a9400ad fix(móvil full-screen): página …, desarrollo, 5e657ec fix: logo centrado+círculo sepa…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@b37ad49c7a053e06cf4f4a89651430268e9b1616": "b37ad49 fix(ios): full-screen en home y cursos eliminando safe-area bars" | kind=Commit | source=git | neighbors=[9aa7f64 fix(ios): theme-color en vivo a…, desarrollo, 7773473 feat(workshop): actualizar link…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@baadf43f497a6bf91f2c721d845180256d6091b7": "baadf43 chore(graph): sync manifest tras swap de fotos (sin re-extracción de vi…" | kind=Commit | source=git | neighbors=[desarrollo, db2b096 security(api): firma de sesión …, d886103 fix(ui): menu claro sigue tema,…] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@d6fca2da1a46ef75cd091fcd5c374bc7203010da": "d6fca2d fix: eliminate horizontal scroll and oversized layouts on mobile" | kind=Commit | source=git | neighbors=[b756a8e feat: mobile UX improvements - …, desarrollo, a091c5c fix: sticky topbar on scroll + …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@de49fec2fc7976db2ccee82c3495d14cbe3f1d1d": "de49fec chore(graph): sync knowledge graph tras auto-create de push_subscriptio…" | kind=Commit | source=git | neighbors=[d304bcd feat(movil/pwa/push): acceso di…, desarrollo, 9359c80 feat(marca/lámparas): logos bla…] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e33f475cbe921f1bd7100d612e6555378bafade0": "e33f475 fix: navbars position:fixed (definitivo) + PWA full-screen sin cuadros …" | kind=Commit | source=git | neighbors=[desarrollo, 04681a7 fix: botón menú bajo el notch, …, fe4fa75 fix: iOS sticky topbars (transp…] | lang=nl
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e4f6b471a895e397e04e919168329fbc6fd4f5df": "e4f6b47 fix: center brand-text properly on mobile navbar" | kind=Commit | source=git | neighbors=[53f006b fix: separate navbar logos and …, desarrollo, 144df19 fix: style brand-lockup image s…] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@e70198364654b7f301f9cce80352ec9704097133": "e701983 fix: increase logo sizes and center text in navbar" | kind=Commit | source=git | neighbors=[8de0bcf fix: separate navbar logos and …, desarrollo, 53f006b fix: separate navbar logos and …] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@edfd56852cb053bda02d54d9778226ec8e00e9bc": "edfd568 fix(ios): full-screen real en home y cursos (fondo opaco en el wrapper)" | kind=Commit | source=git | neighbors=[36c2adc fix(ios): safe-areas full-scree…, desarrollo, 9aa7f64 fix(ios): theme-color en vivo a…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@f0767e784014afbcf6ecb9ed531e5cfa83067ecb": "f0767e7 primer deploy real" | kind=Commit | source=git | neighbors=[desarrollo, main, 04f26d6 fix estructura para vercel] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@f37392785ca810ec2c788bac73a97d0a0b72af6e": "f373927 fix: update logo to new design with separated assets" | kind=Commit | source=git | neighbors=[9376d66 fix: BC letras 38pt, modal pric…, desarrollo, 636dcdd Merge remote changes] | lang=en
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@fe4fa758b338238dd7a3f912edda07fa9c18b697": "fe4fa75 fix: iOS sticky topbars (transparente) + dashboard dock no tapa el cont…" | kind=Commit | source=git | neighbors=[ea0dc62 feat: mobile booking UX, barber…, desarrollo, e33f475 fix: navbars position:fixed (de…] | lang=es
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@ffc17879fefa9487d1895db6bfdd05092162d8b1": "ffc1787 perf+docs: headers de caché/seguridad en Vercel + README y .env.example…" | kind=Commit | source=git | neighbors=[52c7d4b chore(repo): mueve sitio estáti…, desarrollo, 904a775 chore(graph): actualiza knowled…] | lang=es

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-004.json

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
