# Node Description Batch 11 of 11

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

- "pages_home_home": "Home()" | kind=code-symbol | source=src/pages/Home.jsx:L65 | neighbors=[Home.jsx]
- "pages_home_name": "NAME" | kind=code-symbol | source=src/pages/Home.jsx:L63 | neighbors=[Home.jsx]
- "pages_home_pillars": "PILLARS" | kind=code-symbol | source=src/pages/Home.jsx:L13 | neighbors=[Home.jsx]
- "pages_home_services": "SERVICES" | kind=code-symbol | source=src/pages/Home.jsx:L41 | neighbors=[Home.jsx]
- "pages_home_testimonials": "TESTIMONIALS" | kind=code-symbol | source=src/pages/Home.jsx:L56 | neighbors=[Home.jsx]
- "pages_home_tmword": "TmWord()" | kind=code-symbol | source=src/pages/Home.jsx:L512 | neighbors=[Home.jsx]
- "pages_login_fmtphone": "fmtPhone()" | kind=code-symbol | source=src/pages/Login.jsx:L5 | neighbors=[Login.jsx]
- "pages_login_login": "Login()" | kind=code-symbol | source=src/pages/Login.jsx:L12 | neighbors=[Login.jsx]
- "pages_workshop_bw": "Bw()" | kind=code-symbol | source=src/pages/Workshop.jsx:L70 | neighbors=[Workshop.jsx]
- "pages_workshop_calc": "calc()" | kind=code-symbol | source=src/pages/Workshop.jsx:L174 | neighbors=[Workshop.jsx]
- "pages_workshop_cronograma": "Cronograma()" | kind=code-symbol | source=src/pages/Workshop.jsx:L381 | neighbors=[Workshop.jsx]
- "pages_workshop_faq": "Faq()" | kind=code-symbol | source=src/pages/Workshop.jsx:L604 | neighbors=[Workshop.jsx]
- "pages_workshop_featurerow": "FeatureRow()" | kind=code-symbol | source=src/pages/Workshop.jsx:L305 | neighbors=[Workshop.jsx]
- "pages_workshop_footer": "Footer()" | kind=code-symbol | source=src/pages/Workshop.jsx:L633 | neighbors=[Workshop.jsx]
- "pages_workshop_givekit": "GiveKit()" | kind=code-symbol | source=src/pages/Workshop.jsx:L408 | neighbors=[Workshop.jsx]
- "pages_workshop_icon": "Icon()" | kind=code-symbol | source=src/pages/Workshop.jsx:L34 | neighbors=[Workshop.jsx]
- "pages_workshop_programa": "Programa()" | kind=code-symbol | source=src/pages/Workshop.jsx:L337 | neighbors=[Workshop.jsx]
- "pages_workshop_smoothto": "smoothTo()" | kind=code-symbol | source=src/pages/Workshop.jsx:L184 | neighbors=[Workshop.jsx]
- "pages_workshop_transform": "Transform()" | kind=code-symbol | source=src/pages/Workshop.jsx:L249 | neighbors=[Workshop.jsx]
- "pages_workshop_videoshowcase": "VideoShowcase()" | kind=code-symbol | source=src/pages/Workshop.jsx:L129 | neighbors=[Workshop.jsx]
- "pages_workshop_wk_icons": "WK_ICONS" | kind=code-symbol | source=src/pages/Workshop.jsx:L13 | neighbors=[Workshop.jsx]
- "pages_workshop_workshop": "Workshop()" | kind=code-symbol | source=src/pages/Workshop.jsx:L698 | neighbors=[Workshop.jsx]
- "postcss_config": "postcss.config.js" | kind=code-symbol | source=postcss.config.js:L1 | neighbors=[9359c80 feat(marca/lámparas): logos bla…]
- "src_app_account": "Account" | kind=code-symbol | source=src/App.jsx:L38 | neighbors=[App.jsx]
- "src_app_app": "App()" | kind=code-symbol | source=src/App.jsx:L53 | neighbors=[App.jsx]
- "src_app_barberlogin": "BarberLogin" | kind=code-symbol | source=src/App.jsx:L39 | neighbors=[App.jsx]
- "src_app_booking": "Booking" | kind=code-symbol | source=src/App.jsx:L37 | neighbors=[App.jsx]
- "src_app_cursos": "Cursos" | kind=code-symbol | source=src/App.jsx:L42 | neighbors=[App.jsx]
- "src_app_dashboard": "Dashboard" | kind=code-symbol | source=src/App.jsx:L40 | neighbors=[App.jsx]
- "src_app_encuentraestilo": "EncuentraEstilo" | kind=code-symbol | source=src/App.jsx:L43 | neighbors=[App.jsx]
- "src_app_isstandalonelaunch": "isStandaloneLaunch()" | kind=code-symbol | source=src/App.jsx:L13 | neighbors=[App.jsx]
- "src_app_login": "Login" | kind=code-symbol | source=src/App.jsx:L36 | neighbors=[App.jsx]
- "src_app_pwalaunchrouter": "PWALaunchRouter()" | kind=code-symbol | source=src/App.jsx:L19 | neighbors=[App.jsx]
- "src_app_routefallback": "RouteFallback()" | kind=code-symbol | source=src/App.jsx:L45 | neighbors=[App.jsx]
- "src_app_workshop": "Workshop" | kind=code-symbol | source=src/App.jsx:L41 | neighbors=[App.jsx]
- "src_data_all_slots": "ALL_SLOTS" | kind=code-symbol | source=src/data.js:L43 | neighbors=[data.js]
- "src_data_cat_label": "CAT_LABEL" | kind=code-symbol | source=src/data.js:L36 | neighbors=[data.js]
- "tailwind_config": "tailwind.config.js" | kind=code-symbol | source=tailwind.config.js:L1 | neighbors=[9359c80 feat(marca/lámparas): logos bla…]
- "vite_config_mockfintocplugin": "mockFintocPlugin" | kind=code-symbol | source=vite.config.js:L4 | neighbors=[vite.config.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-010.json

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
