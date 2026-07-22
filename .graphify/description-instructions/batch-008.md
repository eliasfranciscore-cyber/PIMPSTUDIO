# Node Description Batch 9 of 11

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

- "components_dashboardresumen_cat_colors": "CAT_COLORS" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L22 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_dashboardresumen": "DashboardResumen()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L149 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_getsvciconbyname": "getSvcIconByName()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L59 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_kpi": "Kpi()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L25 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_occupancyring": "OccupancyRing()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L67 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_peakhours": "PeakHours()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L93 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_status_dot": "STATUS_DOT" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L21 | neighbors=[DashboardResumen.jsx]
- "components_dashboardresumen_topsvc": "TopSvc()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L123 | neighbors=[DashboardResumen.jsx]
- "components_fintoccheckout_checkout_items": "CHECKOUT_ITEMS" | kind=code-symbol | source=src/components/FintocCheckout.jsx:L4 | neighbors=[FintocCheckout.jsx]
- "components_fintoccheckout_fintoccheckout": "FintocCheckout()" | kind=code-symbol | source=src/components/FintocCheckout.jsx:L12 | neighbors=[FintocCheckout.jsx]
- "components_iconsextra_paths": "PATHS" | kind=code-symbol | source=src/components/IconsExtra.jsx:L8 | neighbors=[IconsExtra.jsx]
- "components_liquidshowcase_featurecarousel": "FeatureCarousel()" | kind=code-symbol | source=src/components/liquidShowcase.jsx:L70 | neighbors=[liquidShowcase.jsx]
- "components_liquidshowcase_imagecompare": "ImageCompare()" | kind=code-symbol | source=src/components/liquidShowcase.jsx:L133 | neighbors=[liquidShowcase.jsx]
- "components_liquidshowcase_lampbanner": "LampBanner()" | kind=code-symbol | source=src/components/liquidShowcase.jsx:L4 | neighbors=[liquidShowcase.jsx]
- "components_liquidshowcase_testimonials": "Testimonials()" | kind=code-symbol | source=src/components/liquidShowcase.jsx:L19 | neighbors=[liquidShowcase.jsx]
- "components_mobiledock_mobiledock": "MobileDock()" | kind=code-symbol | source=src/components/MobileDock.jsx:L9 | neighbors=[MobileDock.jsx]
- "components_modulefooter_ic": "Ic()" | kind=code-symbol | source=src/components/ModuleFooter.jsx:L16 | neighbors=[ModuleFooter.jsx]
- "components_modulefooter_icons": "ICONS" | kind=code-symbol | source=src/components/ModuleFooter.jsx:L11 | neighbors=[ModuleFooter.jsx]
- "components_modulefooter_modulefooter": "ModuleFooter()" | kind=code-symbol | source=src/components/ModuleFooter.jsx:L24 | neighbors=[ModuleFooter.jsx]
- "components_sitenav_nav": "NAV" | kind=code-symbol | source=src/components/SiteNav.jsx:L15 | neighbors=[SiteNav.jsx]
- "components_sitenav_sitenav": "SiteNav()" | kind=code-symbol | source=src/components/SiteNav.jsx:L26 | neighbors=[SiteNav.jsx]
- "components_theme_moonicon": "MoonIcon()" | kind=code-symbol | source=src/components/theme.jsx:L119 | neighbors=[theme.jsx]
- "components_theme_sunicon": "SunIcon()" | kind=code-symbol | source=src/components/theme.jsx:L126 | neighbors=[theme.jsx]
- "components_theme_themectx": "ThemeCtx" | kind=code-symbol | source=src/components/theme.jsx:L14 | neighbors=[theme.jsx]
- "components_ui_icons": "ICONS" | kind=code-symbol | source=src/components/ui.jsx:L23 | neighbors=[ui.jsx]
- "components_ui_sectionhead": "SectionHead()" | kind=code-symbol | source=src/components/ui.jsx:L104 | neighbors=[ui.jsx]
- "components_ui_statusbar": "StatusBar()" | kind=code-symbol | source=src/components/ui.jsx:L130 | neighbors=[ui.jsx]
- "data_workshop_feature_cards": "FEATURE_CARDS" | kind=code-symbol | source=src/data/workshop.js:L28 | neighbors=[workshop.js]
- "data_workshop_testimonials": "TESTIMONIALS" | kind=code-symbol | source=src/data/workshop.js:L7 | neighbors=[workshop.js]
- "data_workshop_wk_base": "WK_BASE" | kind=code-symbol | source=src/data/workshop.js:L140 | neighbors=[workshop.js]
- "data_workshop_wk_dias": "WK_DIAS" | kind=code-symbol | source=src/data/workshop.js:L142 | neighbors=[workshop.js]
- "data_workshop_wk_ed": "WK_ED" | kind=code-symbol | source=src/data/workshop.js:L156 | neighbors=[workshop.js]
- "data_workshop_wk_meses": "WK_MESES" | kind=code-symbol | source=src/data/workshop.js:L141 | neighbors=[workshop.js]
- "data_workshop_wkeditiondate": "wkEditionDate()" | kind=code-symbol | source=src/data/workshop.js:L143 | neighbors=[workshop.js]
- "data_workshop_workshop_dates": "WORKSHOP_DATES" | kind=code-symbol | source=src/data/workshop.js:L103 | neighbors=[workshop.js]
- "data_workshop_workshop_highlights": "WORKSHOP_HIGHLIGHTS" | kind=code-symbol | source=src/data/workshop.js:L1 | neighbors=[workshop.js]
- "data_workshop_workshop_includes": "WORKSHOP_INCLUDES" | kind=code-symbol | source=src/data/workshop.js:L96 | neighbors=[workshop.js]
- "data_workshop_workshop_modules": "WORKSHOP_MODULES" | kind=code-symbol | source=src/data/workshop.js:L61 | neighbors=[workshop.js]
- "data_workshop_workshop_timeline": "WORKSHOP_TIMELINE" | kind=code-symbol | source=src/data/workshop.js:L88 | neighbors=[workshop.js]
- "data_workshop_workshop_videos": "WORKSHOP_VIDEOS" | kind=code-symbol | source=src/data/workshop.js:L120 | neighbors=[workshop.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-008.json

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
