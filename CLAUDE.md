# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Build for production (outputs to dist/)
npm run preview          # Serve the production build locally
```

> **Note:** `npm run dev` runs Vite only — serverless API functions are NOT available locally. The app falls back to `localStorage` + demo data. For testing backend endpoints, use `npx vercel dev` (requires `.env.local` with DATABASE_URL and PS_SESSION_SECRET).

## Project Overview

**Brunetti** is a barber shop web platform with public booking interface and internal barber dashboard.

- **Frontend:** React 18 + React Router v6 + Vite (ES modules)
- **Backend:** Vercel serverless functions (Node.js) in `/api` folder
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** HMAC-signed session tokens (no session database)
- **PWA:** Web Push notifications, installable on mobile

### Architecture

#### Frontend (React)

**Entry point:** `src/main.jsx` → `src/App.jsx` sets up routing with code-split lazy routes.

**Pages (lazy-loaded):**
- `Home` — Landing page (loaded eagerly, no splitting)
- `Booking` — Public booking flow
- `Login` — Account/history view for clients
- `BarberLogin` — Barber authentication
- `Dashboard` — Barber panel (reservations, expenses, analytics)
- `Workshop`, `Cursos`, `EncuentraEstilo` — Marketing pages

**Components:** Organized by function (UI primitives in `ui.jsx`, page-specific in respective folders). Tailwind + custom CSS (`src/styles/`).

**State management:** Lightweight Zustand-like stores (`bookingsStore.js`, `enrollmentsStore.js`) for local client state. No global Redux.

**Styling:** Tailwind CSS with PostCSS. Base styles in `src/styles/pimp.css` (reusable), page-specific in `brunetti.css`, `workshop.css`, etc.

#### Backend (Vercel Functions)

Each file in `/api` exports a default handler: `async function handler(req, res)`.

**Authentication:** `_auth.js` exports:
- `createSession(barber)` — signs a JWT-like token (base64url payload + HMAC-SHA256)
- `readSession(req)` — validates token from `Authorization: Bearer <token>` header
- `requireInternal(req, res, {admin?})` — middleware; returns null + 401/403 if not authenticated

**Key endpoints:**
- `/api/auth-login.js` — Barber login (phone + password validation)
- `/api/auth-barber.js` — Barber authentication checks
- `/api/bookings.js` — CRUD for reservations (with graceful demo fallback)
- `/api/services.js` — Menu items
- `/api/clients.js` — Customer registry (barber view)
- `/api/expenses.js` — Finance tracking
- `/api/fintoc-payments.js` — Unified payment checkout + webhook handler
- `/api/push.js` — Web Push notifications
- `/api/availability.js` — Barber time slots

**Graceful degradation:** All endpoints return demo data on database errors so the app remains usable offline.

#### Database (PostgreSQL)

Schema in `db/schema.sql`:
- `users` — Clients (phone, name, email)
- `barbers` — Staff (id, code, password_hash, rating, tier)
- `services` — Menu (name, price, duration, category)
- `bookings` — Reservations (client_id, barber_id, service_id, date, time, status)
- `availability_blocks` — Barber unavailability (time off)
- `expenses` — Finance tracking
- `barber_permissions` — Role-based access (finance, team management, etc.)
- `push_subscriptions` — Web Push endpoints per barber

Seed data in `db/seed.sql` (optional; most tables auto-create on first use).

### Build & Deployment

**Vite config** (`vite.config.js`):
- Vendor splitting: React + React Router cached separately (`react-vendor` chunk)
- Custom Fintoc mock middleware for local dev (intercepts `/api/fintoc-payments` POST in dev mode)
- Chunk size warning raised to 700KB (minified CSS is large)

**Vercel config** (`vercel.json`):
- SPA routing: all non-asset requests → `/index.html`
- Strict security headers (X-Frame-Options, CSP via Permissions-Policy, etc.)
- Aggressive caching for assets (immutable, 1-year max-age)
- Images cached for 1 hour + must-revalidate

**Environment variables** (`.env.local` or Vercel settings):
- `DATABASE_URL` — Neon connection string (required in prod)
- `PS_SESSION_SECRET` — ≥16 char key for HMAC signing (required in prod; if missing, system fails closed — no sessions accepted)
- `FINTOC_SECRET_KEY` — Fintoc API key for payment sessions
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push keys
- `VITE_VAPID_PUBLIC_KEY` — Public VAPID key exposed to frontend
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (optional backup storage)
- `BARBER_PASSWORDS` — JSON fallback: `{code: sha256_hex}` if DB is down

## Patterns & Conventions

### API Error Handling

Always respond with JSON:
```js
res.status(400).json({ error: "message" })
res.status(401).json({ ok: false, error: "..." })
res.json({ ok: true, data: ... })
```

Errors are caught with try/catch; if database is unavailable, return demo data instead of throwing. This keeps the app usable offline.

### Frontend Data Flow

- Fetch functions live near their usage (in component files or in `src/data.js` for shared constants)
- Error handling: show UI fallback or localStorage cache, do NOT block the page
- For internal dashboard (barber), require valid session token in `Authorization` header

### Session Management

Sessions are cryptographically signed, stateless tokens (no DB lookup):
1. Barber logs in → `auth-login` creates token via `createSession()`
2. Token stored in `localStorage` as `ps_barber`
3. Each protected request sends `Authorization: Bearer <token>`
4. Server validates via `readSession()` — no session table, just HMAC verification
5. If `PS_SESSION_SECRET` is missing/weak in production, all tokens are rejected (fail-closed)

### PWA & Standalone Mode

iOS "Add to Home Screen" often ignores manifest `start_url` and instead launches the last-viewed page. The app detects this with `isStandaloneLaunch()` in `App.jsx` and redirects:
- If barber session exists → `/panel` (dashboard)
- Otherwise → `/ingreso` (login)

This only happens once per app session (sessionStorage flag).

### Fintoc Integration

**Checkout flow:**
1. Frontend posts to `/api/fintoc-payments` with `{amount, email, name, phone}`
2. API calls Fintoc REST API, returns `{sessionUrl, sessionId}`
3. Frontend redirects user to `sessionUrl` (Fintoc hosted checkout)
4. After payment, Fintoc POSTs to `/api/fintoc-payments?webhook=1` with transaction data
5. Webhook validates signature and updates enrollment records

In dev mode (`npm run dev`), Fintoc requests are mocked by Vite middleware (see `vite.config.js`).

## Common Tasks

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
# Output: dist/
```

### Test backend locally (requires Vercel CLI)
```bash
npx vercel dev
# Starts Vite + serverless functions on localhost:3000
```

### Database schema setup (after cloning)
```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql  # optional
```

### Generate secure session secret
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Generate Web Push keys
```bash
npx web-push generate-vapid-keys
```

### Deploy to production
```bash
git push origin desarrollo  # Push to branch
npx vercel --prod --yes     # Deploy (project already linked in .vercel/)
```

## Key Files to Know

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Route definitions, PWA launch detection |
| `src/main.jsx` | React DOM render |
| `src/data.js` | Static data (services, constants) |
| `api/_auth.js` | Session creation/validation |
| `db/schema.sql` | Database table definitions |
| `vite.config.js` | Vite build config + Fintoc mock |
| `vercel.json` | Deployment routing, headers, caching |
| `.env.example` | Required environment variables |

## Deployment Checklist

Before `npx vercel --prod`:
1. Verify `PS_SESSION_SECRET` is set in Vercel (≥16 chars)
2. Verify `DATABASE_URL` is accessible and schema is initialized
3. If using Fintoc, verify `FINTOC_SECRET_KEY` is set
4. Run `npm run build` locally and test with `npm run preview`
5. Push to `desarrollo` branch first (staging; domain auto-deployed)
6. Then `npx vercel --prod` for production (`brunetticutz.cl`)

## Visual Editor (dev-only)

`npm run edit` launches Vite + a zero-dep save server (`scripts/content-server.mjs`, port 4101)
and enables an in-browser visual editor. The floating **✎ Editar** button (bottom-right, with a
server-status dot) toggles edit mode. Two independent layers:

- **Content (text):** `EditableText` / `Editable` wrap a string bound to `file`+`path` in
  `src/data/content/*.json`. Editing inline saves via `POST /save` → writes the JSON. Text is edited
  in place (contentEditable).
- **Overrides (layout/style/image):** every editable element carries a stable `editId`
  (`"<file>:<path>"`). Clicking it selects it and opens the **Inspector** popup with tools:
  **Mover** (offset drag/nudge 6px/X-Y, plus *Desanclar* → free absolute position; moved elements
  get `z-index:50` so they overlap on top without reflowing neighbors), **Fuente** (font-size,
  alignment, and **color** — picker + quick swatches — text only), **Imagen** (width/height, replace
  via upload or pick an existing asset). Each change is stored per-`editId` in
  `src/data/overrides/<file>.json` via
  `POST /save-override`, and image uploads go to `public/assets/uploads/` via `POST /upload-image`.

Key files: `src/components/edit/` → `context.js` (shared contexts), `OverridesProvider.jsx`
(always-on layer that loads `src/data/overrides/*.json` via `import.meta.glob` and applies them),
`Editable.jsx` (the primitive), `EditProvider.jsx` (dev-only UI: bar, selection overlay, Inspector),
`useDragResize.js`. Mounted in `App.jsx` as `<OverridesProvider><EditProvider>…`.

**Production:** overrides ship (the JSON is inlined into the build and applied by
`OverridesProvider` in prod, same as text content). The editor UI lives behind
`import.meta.env.DEV` and is tree-shaken out of the production bundle.

**Coverage:** all `EditableText` usages are editable everywhere (text move/font/color/position come
for free). Fixed editorial images are tagged with `<Editable as="img" editId="<page>:<name>" …/>`:
Home (`home-hero:cutout`, `home-hero:bg`, `home-sobre:figure`, `home-estilo:teaserBg`,
`home-cursos:teaserBg`, `home:compareBefore/After`), Cursos (`cursos:heroCutout`, `cursos:heroBg`),
Encuentra tu estilo (`estilo-hero:<i>`, `estilo:ctaBg`), Workshop (`workshop:hero`, `workshop:logo`,
`workshop:pricingBg`). Data-driven galleries/thumbnails (mapped `SmartImg` grids, recommendation
cards, testimonial photos) are intentionally NOT tagged — their images come from data files
(`src/data/*.js`), so edit those, not per-item overrides. To tag a new fixed image, wrap its `<img>`
in `<Editable as="img" editId="…" …/>`. The native iOS app cannot be edited by this web tool.

## Native iOS App

`ios/BrunettiCutz/` is a native SwiftUI companion app (barber dashboard client), separate from the web PWA above. It talks to the same `/api` backend.

- `BrunettiCutzApp.swift` — app entry point
- `APIClient.swift` — HTTP client hitting the Vercel `/api` endpoints (uses the same `Authorization: Bearer <token>` session scheme as the web app)
- `SessionStore.swift` / `KeychainStore.swift` — session token persisted in the iOS Keychain (vs. `localStorage` on web)
- `DashboardModel.swift` / `DashboardView.swift` / `ModuleViews.swift` / `DetailSheets.swift` — dashboard state and views, mirroring `src/pages/Dashboard.jsx`
- `DesignSystem.swift` — shared colors/typography for the native UI
- `BrunettiAppIntents.swift` — App Intents (Siri/Shortcuts) integration
- `DemoData.swift` — offline/demo fallback data, mirroring the web app's graceful-degradation pattern

Note: graphify cannot parse Swift (no tree-sitter grammar available), so this directory is invisible to `graphify query`/`explain`/`path` — use `Read`/`grep` directly for iOS code.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
