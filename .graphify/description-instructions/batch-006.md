# Node Description Batch 7 of 11

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "components_bookingsinbox_walink": "waLink()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L28 | neighbors=[BookingsInbox.jsx, ResModal()]
- "components_glarecard": "GlareCard.jsx" | kind=code-symbol | source=src/components/GlareCard.jsx:L1 | neighbors=[743d0cc feat: redesign UI for web - res…, GlareCard()]
- "components_glarecard_glarecard": "GlareCard()" | kind=code-symbol | source=src/components/GlareCard.jsx:L3 | neighbors=[GlareCard.jsx, Booking.jsx]
- "components_theme_autotheme": "autoTheme()" | kind=code-symbol | source=src/components/theme.jsx:L25 | neighbors=[theme.jsx, santiagoHour()]
- "components_theme_santiagohour": "santiagoHour()" | kind=code-symbol | source=src/components/theme.jsx:L17 | neighbors=[theme.jsx, autoTheme()]
- "components_ui_stat": "Stat()" | kind=code-symbol | source=src/components/ui.jsx:L82 | neighbors=[ui.jsx, Dashboard.jsx]
- "components_ui_useinview": "useInView()" | kind=code-symbol | source=src/components/ui.jsx:L59 | neighbors=[ui.jsx, Reveal()]
- "data_estilo_face_shapes": "FACE_SHAPES" | kind=code-symbol | source=src/data/estilo.js:L15 | neighbors=[estilo.js, EncuentraEstilo.jsx]
- "data_estilo_gallery": "GALLERY" | kind=code-symbol | source=src/data/estilo.js:L116 | neighbors=[estilo.js, EncuentraEstilo.jsx]
- "data_estilo_gallery_cats": "GALLERY_CATS" | kind=code-symbol | source=src/data/estilo.js:L115 | neighbors=[estilo.js, EncuentraEstilo.jsx]
- "data_estilo_u": "u()" | kind=code-symbol | source=src/data/estilo.js:L10 | neighbors=[estilo.js, EncuentraEstilo.jsx]
- "data_workshop_workshop": "WORKSHOP" | kind=code-symbol | source=src/data/workshop.js:L158 | neighbors=[workshop.js, Workshop.jsx]
- "db_schema_availability_blocks": "availability_blocks" | kind=code-symbol | source=db/schema.sql:L56 | neighbors=[schema.sql, barbers]
- "db_schema_barber_permissions": "barber_permissions" | kind=code-symbol | source=db/schema.sql:L76 | neighbors=[schema.sql, barbers]
- "db_schema_push_subscriptions": "push_subscriptions" | kind=code-symbol | source=db/schema.sql:L86 | neighbors=[schema.sql, barbers]
- "db_schema_services": "services" | kind=code-symbol | source=db/schema.sql:L31 | neighbors=[schema.sql, bookings]
- "db_schema_users": "users" | kind=code-symbol | source=db/schema.sql:L4 | neighbors=[schema.sql, bookings]
- "db_seed": "seed.sql" | kind=code-symbol | source=db/seed.sql:L1 | neighbors=[3867c4f feat: migrar a React+Vite con d…, 8d7573a feat: add barber operations das…]
- "pages_dashboard_buildweek": "buildWeek()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L36 | neighbors=[Dashboard.jsx, Dashboard()]
- "pages_dashboard_configpanel": "ConfigPanel()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L1007 | neighbors=[Dashboard.jsx, isStrongPassword()]
- "pages_dashboard_dashboard": "Dashboard()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L89 | neighbors=[Dashboard.jsx, buildWeek()]
- "pages_dashboard_isstrongpassword": "isStrongPassword()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L1003 | neighbors=[Dashboard.jsx, ConfigPanel()]
- "pages_encuentraestilo_reveal": "Reveal()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L71 | neighbors=[EncuentraEstilo.jsx, useReveal()]
- "pages_encuentraestilo_usereveal": "useReveal()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L54 | neighbors=[EncuentraEstilo.jsx, Reveal()]
- "pages_workshop_quoteblock": "QuoteBlock()" | kind=code-symbol | source=src/pages/Workshop.jsx:L276 | neighbors=[Workshop.jsx, useInView()]
- "pages_workshop_register": "Register()" | kind=code-symbol | source=src/pages/Workshop.jsx:L491 | neighbors=[Workshop.jsx, formatCLP()]
- "pages_workshop_reveal": "Reveal()" | kind=code-symbol | source=src/pages/Workshop.jsx:L59 | neighbors=[Workshop.jsx, useInView()]
- "pages_workshop_usecountdown": "useCountdown()" | kind=code-symbol | source=src/pages/Workshop.jsx:L166 | neighbors=[Workshop.jsx, Hero()]
- "pages_workshop_usescrolled": "useScrolled()" | kind=code-symbol | source=src/pages/Workshop.jsx:L155 | neighbors=[Workshop.jsx, StickyCta()]
- "public_sw": "sw.js" | kind=code-symbol | source=public/sw.js:L1 | neighbors=[ea0dc62 feat: mobile booking UX, barber…, f64be2f feat(brand+workshop): Brunetti …]
- "src_data_cleanphone": "cleanPhone()" | kind=code-symbol | source=src/data.js:L138 | neighbors=[ClientModal.jsx, data.js]
- "src_data_client_appts": "CLIENT_APPTS" | kind=code-symbol | source=src/data.js:L71 | neighbors=[Account.jsx, data.js]
- "src_data_clients": "CLIENTS" | kind=code-symbol | source=src/data.js:L21 | neighbors=[Dashboard.jsx, data.js]
- "src_data_days_es": "DAYS_ES" | kind=code-symbol | source=src/data.js:L45 | neighbors=[Booking.jsx, data.js]
- "src_data_expenses": "EXPENSES" | kind=code-symbol | source=src/data.js:L27 | neighbors=[Dashboard.jsx, data.js]
- "src_data_isadminuser": "isAdminUser()" | kind=code-symbol | source=src/data.js:L139 | neighbors=[Dashboard.jsx, data.js]
- "src_data_metrics": "METRICS" | kind=code-symbol | source=src/data.js:L78 | neighbors=[Dashboard.jsx, data.js]
- "src_data_service_barbers": "SERVICE_BARBERS" | kind=code-symbol | source=src/data.js:L34 | neighbors=[Booking.jsx, data.js]
- "src_data_slot_groups": "SLOT_GROUPS" | kind=code-symbol | source=src/data.js:L38 | neighbors=[Booking.jsx, data.js]
- "src_data_slotstate": "slotState()" | kind=code-symbol | source=src/data.js:L48 | neighbors=[Booking.jsx, data.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-006.json

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
