# Node Description Batch 8 of 11

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

- "src_data_tne": "tne()" | kind=code-symbol | source=src/data.js:L137 | neighbors=[Booking.jsx, data.js]
- "src_data_today_bookings": "TODAY_BOOKINGS" | kind=code-symbol | source=src/data.js:L56 | neighbors=[Dashboard.jsx, data.js]
- "src_enrollmentsstore_writelocalenrollments": "writeLocalEnrollments()" | kind=code-symbol | source=src/enrollmentsStore.js:L17 | neighbors=[enrollmentsStore.js, addLocalEnrollment()]
- "src_push_urlbase64touint8array": "urlBase64ToUint8Array()" | kind=code-symbol | source=src/push.js:L64 | neighbors=[push.js, enablePush()]
- "ui_lamp": "lamp.jsx" | kind=code-symbol | source=src/components/ui/lamp.jsx:L1 | neighbors=[9359c80 feat(marca/lámparas): logos bla…, Lamp()]
- "api_auth_barber_barber_profiles": "BARBER_PROFILES" | kind=code-symbol | source=api/auth-barber.js:L28 | neighbors=[auth-barber.js]
- "api_auth_login_handler": "handler()" | kind=code-symbol | source=api/auth-login.js:L3 | neighbors=[auth-login.js]
- "api_availability_all_slots": "ALL_SLOTS" | kind=code-symbol | source=api/availability.js:L4 | neighbors=[availability.js]
- "api_availability_handler": "handler()" | kind=code-symbol | source=api/availability.js:L6 | neighbors=[availability.js]
- "api_barbers_handler": "handler()" | kind=code-symbol | source=api/barbers.js:L16 | neighbors=[barbers.js]
- "api_barbers_static_barbers": "STATIC_BARBERS" | kind=code-symbol | source=api/barbers.js:L5 | neighbors=[barbers.js]
- "api_bookings_demo_bookings": "DEMO_BOOKINGS" | kind=code-symbol | source=api/bookings.js:L5 | neighbors=[bookings.js]
- "api_bookings_handler": "handler()" | kind=code-symbol | source=api/bookings.js:L11 | neighbors=[bookings.js]
- "api_clients_demo_clients": "DEMO_CLIENTS" | kind=code-symbol | source=api/clients.js:L4 | neighbors=[clients.js]
- "api_enrollments_demo": "DEMO" | kind=code-symbol | source=api/enrollments.js:L19 | neighbors=[enrollments.js]
- "api_expenses_demo_expenses": "DEMO_EXPENSES" | kind=code-symbol | source=api/expenses.js:L4 | neighbors=[expenses.js]
- "api_push_handler": "handler()" | kind=code-symbol | source=api/push.js:L88 | neighbors=[push.js]
- "api_register_client_put": "{ put }" | kind=code-symbol | source=api/register-client.js:L1 | neighbors=[register-client.js]
- "api_register_client_putclientrecord": "putClientRecord()" | kind=code-symbol | source=api/register-client.js:L18 | neighbors=[register-client.js]
- "api_register_client_readbody": "readBody()" | kind=code-symbol | source=api/register-client.js:L3 | neighbors=[register-client.js]
- "api_register_client_sendjson": "sendJson()" | kind=code-symbol | source=api/register-client.js:L12 | neighbors=[register-client.js]
- "api_services_handler": "handler()" | kind=code-symbol | source=api/services.js:L18 | neighbors=[services.js]
- "api_services_static_services": "STATIC_SERVICES" | kind=code-symbol | source=api/services.js:L4 | neighbors=[services.js]
- "components_barbermodal_all_module_ids": "ALL_MODULE_IDS" | kind=code-symbol | source=src/components/BarberModal.jsx:L30 | neighbors=[BarberModal.jsx]
- "components_barbermodal_barbermodal": "BarberModal()" | kind=code-symbol | source=src/components/BarberModal.jsx:L34 | neighbors=[BarberModal.jsx]
- "components_barbermodal_emptybarber": "emptyBarber" | kind=code-symbol | source=src/components/BarberModal.jsx:L32 | neighbors=[BarberModal.jsx]
- "components_barbermodal_modules": "MODULES" | kind=code-symbol | source=src/components/BarberModal.jsx:L24 | neighbors=[BarberModal.jsx]
- "components_barbermodal_perms": "PERMS" | kind=code-symbol | source=src/components/BarberModal.jsx:L15 | neighbors=[BarberModal.jsx]
- "components_barbershowcase_barbercard": "BarberCard()" | kind=code-symbol | source=src/components/BarberShowcase.jsx:L23 | neighbors=[BarberShowcase.jsx]
- "components_barbershowcase_barbermodal": "BarberModal()" | kind=code-symbol | source=src/components/BarberShowcase.jsx:L44 | neighbors=[BarberShowcase.jsx]
- "components_barbershowcase_barbershowcase": "BarberShowcase()" | kind=code-symbol | source=src/components/BarberShowcase.jsx:L80 | neighbors=[BarberShowcase.jsx]
- "components_bookingsinbox_bookingsinbox": "BookingsInbox()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L170 | neighbors=[BookingsInbox.jsx]
- "components_bookingsinbox_confirmcancel": "ConfirmCancel()" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L152 | neighbors=[BookingsInbox.jsx]
- "components_bookingsinbox_filter_map": "FILTER_MAP" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L26 | neighbors=[BookingsInbox.jsx]
- "components_bookingsinbox_filters": "FILTERS" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L25 | neighbors=[BookingsInbox.jsx]
- "components_bookingsinbox_status_label": "STATUS_LABEL" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L23 | neighbors=[BookingsInbox.jsx]
- "components_bookingsinbox_status_options": "STATUS_OPTIONS" | kind=code-symbol | source=src/components/BookingsInbox.jsx:L24 | neighbors=[BookingsInbox.jsx]
- "components_brunetti_brunettifooter": "BrunettiFooter()" | kind=code-symbol | source=src/components/brunetti.jsx:L137 | neighbors=[brunetti.jsx]
- "components_clientmodal_clientmodal": "ClientModal()" | kind=code-symbol | source=src/components/ClientModal.jsx:L15 | neighbors=[ClientModal.jsx]
- "components_dashboardresumen_bars": "Bars()" | kind=code-symbol | source=src/components/DashboardResumen.jsx:L44 | neighbors=[DashboardResumen.jsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /Users/elija/Documents/GitHub/PIMPSTUDIO-desarrollo/.graphify/description-instructions/batch-007.json

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
