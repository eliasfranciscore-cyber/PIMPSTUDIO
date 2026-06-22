# Plan de implementación — Rediseño Brunetti (marca personal Bruno Herrera)

> Fuente del diseño: `PIMPSTUDIO (5).zip` → `design_handoff_brunetti_landing/`
> (HTML/CSS/JS vanilla de alta fidelidad). Hay que **recrearlo en el stack React+Vite**
> del proyecto, respetando tokens, animaciones y copys 1:1.

## Decisiones clave (confirmadas con el usuario)
- **Marca personal de un solo barbero: Brunetti (Bruno Herrera).** Se eliminan los demás barberos del sitio público y del flujo de reserva.
- **Imagen central del hero**: foto adjunta de Bruno (HEIC) → `public/assets/bruno-hero.jpg`.
- **Workshop**: se MANTIENE la página/ruta `/workshop` existente tal cual. NO se borra.
- **Cursos**: se AGREGA una página nueva `/cursos` (diseño `cursos.html`) además del Workshop.
- Stack: React 18 + Vite + react-router-dom. CSS scope: todo el CSS del diseño va en
  `src/styles/brunetti.css`, **scopeado bajo `.brunetti-site`** para no romper booking/dashboard/login.

## Estado / Checklist por fases
- [ ] **F1 — Base CSS + tokens + assets**
  - Añadir tokens faltantes (`--gold-bright/-deep/-edge/-soft`, `--ink-2/-3`, `--on-gold`, `--pill`, `--ease-out`, `--b-maxw`, `--g-edge-strong`, etc.).
  - Crear `src/styles/brunetti.css` (port de ios-glass + components + brunetti + base header/footer), scopeado `.brunetti-site`, keyframes renombrados `bru*` para evitar choque con `fadeUp`/`marquee` de pimp.css.
  - Importar en `main.jsx`.
  - Copiar assets a `public/assets/`: `bruno-hero.jpg` (foto adjunta), `bruno-feature.jpg`, `bruno-portrait.jpg`, `workshop-2026.jpg` (del bundle).
- [ ] **F2 — Landing (Home) Brunetti**
  - Reescribir `src/pages/Home.jsx`: header pill, hero (nombre letra×letra, parallax+tilt, chips), marquee, visagismo (5 pilares), sobre Bruno (contadores), servicios (3), compare antes/después, carrusel + modal, teaser cursos, testimonios, contacto, ubicación, footer.
  - Hooks JS portados: reveal (IntersectionObserver+failsafe), parallax, tilt, counters, navbar shrink, testimonials, carousel+modal, compare slider.
- [ ] **F3 — Página Cursos `/cursos`**
  - Nuevo `src/pages/Cursos.jsx` (hero Ken Burns, intro 4 beneficios, acordeón 6 módulos, inscripción con form→localStorage `curso_waitlist`).
  - Ruta en `App.jsx`. Link "Cursos" en navs.
- [ ] **F4 — Un solo barbero (Bruno)**
  - `data.js`: `BARBERS` = solo Brunetti (id 6). Ajustar `SERVICE_BARBERS`, rankings/seeds que referencian otros ids.
  - `Booking.jsx`: fijar barbero Brunetti (sin selector multi-barbero) — barber_id=6.
  - `BarberShowcase`: retirar de la landing nueva (la landing ya tiene "Sobre Bruno").
  - Revisar Dashboard para que no truene con un solo barbero (datos demo).
- [ ] **F5 — Build + verificación + deploy**
  - `npm run build` limpio.
  - Verificar en preview (hero, animaciones, acordeón, form, navegación, responsive).
  - Deploy: commit en `desarrollo` + `npx vercel --prod` (prod = pimpstudio.cl).

## Notas de retoma (si se corta)
- Diseño extraído en `/tmp/pimp_zip/design_handoff_brunetti_landing/` (re-extraer del zip si se limpió /tmp).
- Foto de Bruno convertida en `/tmp/bruno_design.png` (origen HEIC en ~/Downloads).
- Mapear rutas del diseño → app: `/booking?...` ⇒ `/reservar` (o `/login`); `/cursos` ⇒ nueva; `/barber/login` ⇒ `/ingreso`.
- Pendientes del cliente (placeholders): retrato dedicado, tel `(+56) 9 1234 5678`, email `hola@brunetti.cl`, precio/fechas curso, handles IG.
