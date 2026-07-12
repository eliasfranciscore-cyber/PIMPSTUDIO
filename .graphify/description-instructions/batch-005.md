# Node Description Batch 6 of 11

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "components_bookingsinbox_rescard": "ResCard()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L46 | neighbors=[BookingsInbox.jsx, initialsOf(), resolveBarber()]
- "components_bookingsinbox_resmodal": "ResModal()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L88 | neighbors=[BookingsInbox.jsx, resolveBarber(), waLink()]
- "components_bookingsinbox_resolvebarber": "resolveBarber()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L42 | neighbors=[BookingsInbox.jsx, ResCard(), ResModal()]
- "components_brunetti_scrolltoid": "scrollToId()" | kind=code-symbol | source=src/components/brunetti.jsx:L130 | neighbors=[brunetti.jsx, Cursos.jsx, Home.jsx]
- "components_brunetti_usebrunettifx": "useBrunettiFx()" | kind=code-symbol | source=src/components/brunetti.jsx:L8 | neighbors=[brunetti.jsx, Cursos.jsx, Home.jsx]
- "components_iconsextra": "IconsExtra.jsx" | kind=code-symbol | source=src/components/IconsExtra.jsx:L1 | neighbors=[16876ec feat: barberos en mosaico grid,…, Icon(), PATHS]
- "components_theme_floatingthemetoggle": "FloatingThemeToggle()" | kind=code-symbol | source=src/components/theme.jsx:L135 | neighbors=[theme.jsx, useTheme(), App.jsx]
- "components_theme_themeprovider": "ThemeProvider()" | kind=code-symbol | source=src/components/theme.jsx:L30 | neighbors=[theme.jsx, Dashboard.jsx, App.jsx]
- "components_theme_themetoggle": "ThemeToggle()" | kind=code-symbol | source=src/components/theme.jsx:L92 | neighbors=[theme.jsx, useTheme(), Dashboard.jsx]
- "components_ui_brandmark": "Brandmark()" | kind=code-symbol | source=src/components/ui.jsx:L14 | neighbors=[ui.jsx, Account.jsx, Dashboard.jsx]
- "components_ui_reveal": "Reveal()" | kind=code-symbol | source=src/components/ui.jsx:L75 | neighbors=[liquidShowcase.jsx, ui.jsx, useInView()]
- "pages_workshop_hero": "Hero()" | kind=code-symbol | source=src/pages/Workshop.jsx:L190 | neighbors=[Workshop.jsx, formatCLP(), useCountdown()]
- "pages_workshop_pricing": "Pricing()" | kind=code-symbol | source=src/pages/Workshop.jsx:L446 | neighbors=[Workshop.jsx, formatCLP(), useInView()]
- "pages_workshop_stickycta": "StickyCta()" | kind=code-symbol | source=src/pages/Workshop.jsx:L687 | neighbors=[Workshop.jsx, formatCLP(), useScrolled()]
- "pages_workshop_toembedurl": "toEmbedUrl()" | kind=code-symbol | source=src/pages/Workshop.jsx:L87 | neighbors=[Workshop.jsx, ytId(), VideoEmbed()]
- "pages_workshop_videoembed": "VideoEmbed()" | kind=code-symbol | source=src/pages/Workshop.jsx:L100 | neighbors=[Workshop.jsx, toEmbedUrl(), ytId()]
- "pages_workshop_ytid": "ytId()" | kind=code-symbol | source=src/pages/Workshop.jsx:L80 | neighbors=[Workshop.jsx, toEmbedUrl(), VideoEmbed()]
- "src_bookingsstore_cancelkeyof": "cancelKeyOf()" | kind=code-symbol | source=src/bookingsStore.js:L16 | neighbors=[bookingsStore.js, cancelLocalBooking(), isCancelled()]
- "src_bookingsstore_mergebookings": "mergeBookings()" | kind=code-symbol | source=src/bookingsStore.js:L67 | neighbors=[Dashboard.jsx, bookingsStore.js, readLocalBookings()]
- "src_bookingsstore_readcancelledkeys": "readCancelledKeys()" | kind=code-symbol | source=src/bookingsStore.js:L18 | neighbors=[bookingsStore.js, cancelLocalBooking(), isCancelled()]
- "src_bookingsstore_writelocalbookings": "writeLocalBookings()" | kind=code-symbol | source=src/bookingsStore.js:L39 | neighbors=[bookingsStore.js, addLocalBooking(), cancelLocalBooking()]
- "src_data_clpk": "CLPk()" | kind=code-symbol | source=src/data.js:L135 | neighbors=[DashboardResumen.jsx, Dashboard.jsx, data.js]
- "src_data_months_es": "MONTHS_ES" | kind=code-symbol | source=src/data.js:L46 | neighbors=[Account.jsx, Booking.jsx, data.js]
- "src_data_services": "SERVICES" | kind=code-symbol | source=src/data.js:L7 | neighbors=[Booking.jsx, Dashboard.jsx, data.js]
- "src_enrollmentsstore_mergeenrollments": "mergeEnrollments()" | kind=code-symbol | source=src/enrollmentsStore.js:L45 | neighbors=[Dashboard.jsx, enrollmentsStore.js, readLocalEnrollments()]
- "src_enrollmentsstore_readlocalenrollments": "readLocalEnrollments()" | kind=code-symbol | source=src/enrollmentsStore.js:L13 | neighbors=[enrollmentsStore.js, addLocalEnrollment(), mergeEnrollments()]
- "src_push_authheaders": "authHeaders()" | kind=code-symbol | source=src/push.js:L73 | neighbors=[push.js, disablePush(), enablePush()]
- "src_push_permissionstate": "permissionState()" | kind=code-symbol | source=src/push.js:L45 | neighbors=[Dashboard.jsx, push.js, enablePush()]
- "src_push_pushenabledfor": "pushEnabledFor()" | kind=code-symbol | source=src/push.js:L146 | neighbors=[Dashboard.jsx, push.js, notifyBarberOfBooking()]
- "api_auth_b64url": "b64url()" | kind=code-symbol | source=api/_auth.js:L14 | neighbors=[_auth.js, createSession()]
- "api_auth_barber_fallbackpasswords": "fallbackPasswords()" | kind=code-symbol | source=api/auth-barber.js:L39 | neighbors=[auth-barber.js, fallbackLogin()]
- "api_auth_barber_isvalidpassword": "isValidPassword()" | kind=code-symbol | source=api/auth-barber.js:L23 | neighbors=[auth-barber.js, handleChangePassword()]
- "api_enrollments_cleanphone": "cleanPhone()" | kind=code-symbol | source=api/enrollments.js:L24 | neighbors=[enrollments.js, handler()]
- "api_enrollments_sendjson": "sendJson()" | kind=code-symbol | source=api/enrollments.js:L25 | neighbors=[enrollments.js, handler()]
- "api_expenses_handler": "handler()" | kind=code-symbol | source=api/expenses.js:L23 | neighbors=[expenses.js, validateExpense()]
- "api_expenses_validateexpense": "validateExpense()" | kind=code-symbol | source=api/expenses.js:L10 | neighbors=[expenses.js, handler()]
- "api_fintoc_payments_handlecheckout": "handleCheckout()" | kind=code-symbol | source=api/fintoc-payments.js:L26 | neighbors=[fintoc-payments.js, handler()]
- "api_fintoc_payments_handlewebhook": "handleWebhook()" | kind=code-symbol | source=api/fintoc-payments.js:L81 | neighbors=[fintoc-payments.js, handler()]
- "commit:repo:github.com/eliasfranciscore-cyber/PIMPSTUDIO@aad8b7e301147fd24f490e7b7c776b33f135e936": "aad8b7e Add BrunettiCutz native iOS app" | kind=Commit | source=git | neighbors=[347562f debug: agregar logs para debugu…, desarrollo]
- "components_bookingsinbox_initialsof": "initialsOf()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L43 | neighbors=[BookingsInbox.jsx, ResCard()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-005.json

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
