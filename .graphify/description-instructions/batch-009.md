# Node Description Batch 10 of 11

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

- "db_schema_expenses": "expenses" | kind=code-symbol | source=db/schema.sql:L66 | neighbors=[schema.sql]
- "pages_account_account": "Account()" | kind=code-symbol | source=src/pages/Account.jsx:L23 | neighbors=[Account.jsx]
- "pages_account_withlocalappts": "withLocalAppts()" | kind=code-symbol | source=src/pages/Account.jsx:L9 | neighbors=[Account.jsx]
- "pages_barberlogin_barberlogin": "BarberLogin()" | kind=code-symbol | source=src/pages/BarberLogin.jsx:L21 | neighbors=[BarberLogin.jsx]
- "pages_barberlogin_clearlockout": "clearLockout()" | kind=code-symbol | source=src/pages/BarberLogin.jsx:L17 | neighbors=[BarberLogin.jsx]
- "pages_barberlogin_getlockout": "getLockout()" | kind=code-symbol | source=src/pages/BarberLogin.jsx:L9 | neighbors=[BarberLogin.jsx]
- "pages_barberlogin_setlockout": "setLockout()" | kind=code-symbol | source=src/pages/BarberLogin.jsx:L14 | neighbors=[BarberLogin.jsx]
- "pages_booking_all_booking_slots": "ALL_BOOKING_SLOTS" | kind=code-symbol | source=src/pages/Booking.jsx:L8 | neighbors=[Booking.jsx]
- "pages_booking_booking": "Booking()" | kind=code-symbol | source=src/pages/Booking.jsx:L18 | neighbors=[Booking.jsx]
- "pages_booking_localblockkey": "localBlockKey()" | kind=code-symbol | source=src/pages/Booking.jsx:L10 | neighbors=[Booking.jsx]
- "pages_booking_readlocalblocks": "readLocalBlocks()" | kind=code-symbol | source=src/pages/Booking.jsx:L14 | neighbors=[Booking.jsx]
- "pages_cursos_cursos": "Cursos()" | kind=code-symbol | source=src/pages/Cursos.jsx:L81 | neighbors=[Cursos.jsx]
- "pages_cursos_includes": "INCLUDES" | kind=code-symbol | source=src/pages/Cursos.jsx:L74 | neighbors=[Cursos.jsx]
- "pages_cursos_modules": "MODULES" | kind=code-symbol | source=src/pages/Cursos.jsx:L14 | neighbors=[Cursos.jsx]
- "pages_dashboard_agenda_slots": "AGENDA_SLOTS" | kind=code-symbol | source=src/pages/Dashboard.jsx:L19 | neighbors=[Dashboard.jsx]
- "pages_dashboard_barchart": "BarChart()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L60 | neighbors=[Dashboard.jsx]
- "pages_dashboard_cfg_sections": "CFG_SECTIONS" | kind=code-symbol | source=src/pages/Dashboard.jsx:L785 | neighbors=[Dashboard.jsx]
- "pages_dashboard_cfgrow": "CfgRow()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L905 | neighbors=[Dashboard.jsx]
- "pages_dashboard_configswitch": "ConfigSwitch()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L881 | neighbors=[Dashboard.jsx]
- "pages_dashboard_dashboardshell": "DashboardShell()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L1442 | neighbors=[Dashboard.jsx]
- "pages_dashboard_dashboardtopbar": "DashboardTopbar()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L1470 | neighbors=[Dashboard.jsx]
- "pages_dashboard_day_labels": "DAY_LABELS" | kind=code-symbol | source=src/pages/Dashboard.jsx:L21 | neighbors=[Dashboard.jsx]
- "pages_dashboard_enrollmentspanel": "EnrollmentsPanel()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L803 | neighbors=[Dashboard.jsx]
- "pages_dashboard_getsvcicon": "getSvcIcon()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L23 | neighbors=[Dashboard.jsx]
- "pages_dashboard_isodate": "isoDate()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L32 | neighbors=[Dashboard.jsx]
- "pages_dashboard_localblockkey": "localBlockKey()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L48 | neighbors=[Dashboard.jsx]
- "pages_dashboard_panel": "Panel()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L77 | neighbors=[Dashboard.jsx]
- "pages_dashboard_pushcard": "PushCard()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L920 | neighbors=[Dashboard.jsx]
- "pages_dashboard_readlocalblocks": "readLocalBlocks()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L52 | neighbors=[Dashboard.jsx]
- "pages_dashboard_writelocalblocks": "writeLocalBlocks()" | kind=code-symbol | source=src/pages/Dashboard.jsx:L56 | neighbors=[Dashboard.jsx]
- "pages_encuentraestilo_ctaband": "CtaBand()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L256 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_encuentraestilo": "EncuentraEstilo()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L283 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_faceglyph": "FaceGlyph()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L49 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_galeria": "Galeria()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L214 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_hero": "Hero()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L85 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_icon": "Icon()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L24 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_smartimg": "SmartImg()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L39 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_smoothscroll": "smoothScroll()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L76 | neighbors=[EncuentraEstilo.jsx]
- "pages_encuentraestilo_visagismo": "Visagismo()" | kind=code-symbol | source=src/pages/EncuentraEstilo.jsx:L120 | neighbors=[EncuentraEstilo.jsx]
- "pages_home_cards": "CARDS" | kind=code-symbol | source=src/pages/Home.jsx:L47 | neighbors=[Home.jsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-009.json

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
