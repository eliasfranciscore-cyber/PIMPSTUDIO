# Brunetti · Barber Studio — Web + Panel

Sitio público y panel interno de **Brunetti** (barbería premium, Maipú · Santiago).
Producción: **https://brunetticutz.cl**

- **Frontend:** React 18 + React Router + Vite.
- **Backend:** funciones serverless de Vercel en `api/` (Node).
- **Base de datos:** Neon (PostgreSQL serverless). En desarrollo local sin backend, la app
  degrada a `localStorage` + datos demo (no rompe).
- **Auth interna:** sesión HMAC firmada (`api/_auth.js`) — requiere `PS_SESSION_SECRET`.

## Requisitos

- Node.js ≥ 18
- Cuenta de Vercel (deploy) y de Neon (base de datos) para producción.

## Puesta en marcha (PC nuevo)

```bash
git clone <repo> brunetti
cd brunetti
npm install
cp .env.example .env.local   # completar valores (ver abajo)
npm run dev                  # http://localhost:5173
```

> En `npm run dev` (Vite) **no hay backend `/api`**: la app usa fallbacks de
> `localStorage`/demo. Para probar las funciones serverless localmente, usar
> `npx vercel dev` con las variables de entorno cargadas.

## Scripts

| Comando           | Acción                                   |
|-------------------|------------------------------------------|
| `npm run dev`     | Servidor de desarrollo (Vite)            |
| `npm run build`   | Build de producción a `dist/`            |
| `npm run preview` | Sirve el build localmente                |

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable                | Requerida | Para qué |
|-------------------------|-----------|----------|
| `DATABASE_URL`          | Sí (prod) | Conexión Neon Postgres |
| `PS_SESSION_SECRET`     | **Sí (prod)** | Firma de sesiones internas (≥16 chars). Sin esto el login interno se rechaza. Generar: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `BARBER_PASSWORDS`      | Opcional  | JSON `{code: sha256(pass)}` — respaldo de login si la DB no está disponible |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Opcional | Web Push (PWA iOS). Generar: `npx web-push generate-vapid-keys` |
| `VITE_VAPID_PUBLIC_KEY` | Opcional  | La clave pública VAPID expuesta al front |
| `BLOB_READ_WRITE_TOKEN` | Opcional  | Vercel Blob (respaldo de registro de clientes) |

En producción las variables viven en Vercel:
```bash
npx vercel env ls
npx vercel env add PS_SESSION_SECRET production
```

## Base de datos (Neon)

El esquema y los datos semilla están en `db/`:
```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql   # opcional: datos de ejemplo
```
Varias tablas (`enrollments`, etc.) se auto-crean (`CREATE TABLE IF NOT EXISTS`) en el
primer uso de su endpoint, así que la app funciona aunque falte correr el seed.

## Deploy

```bash
git push origin desarrollo
npx vercel --prod --yes
```
Proyecto ya enlazado en `.vercel/`. Dominio público: **brunetticutz.cl**
(`pimpstudio.cl` redirige 308 al apex). Verificar contra `brunetticutz.cl`, no contra
la URL cruda `*.vercel.app` (puede dar 401 por protección de deployments).

## Estructura

```
api/            Funciones serverless (auth, reservas, clientes, gastos, push, inscripciones)
db/             schema.sql + seed.sql (setup de Neon)
public/         Estáticos servidos en /  (assets/, manifest, sw.js)
src/
  pages/        Home, Cursos, Workshop, EncuentraEstilo, Dashboard, Booking, Login...
  components/   SiteNav, ModuleFooter, theme, ui, BarberShowcase...
  styles/       pimp.css (base), brunetti.css, workshop.css, estilo.css
  data/         Datos estáticos (servicios, workshop, estilo)
index.html      Entry (meta/PWA/tema sin-flash)
vercel.json     Rewrites, headers de caché y seguridad
vite.config.js  Build (vendor split)
```

> `Archivos en desuso/` (gitignored) guarda material legacy: el sitio estático antiguo
> (`web/`), el backend local SQLite (`server.js`, `data/`) y la capa del agente ELIJA
> (`docs/`, `knowledge/`, `skills/`, `scripts/`, `inbox/`, `templates/`). No se versiona
> ni se despliega.
