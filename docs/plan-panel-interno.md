# Plan de mejora del Panel Interno (por etapas)

> Diseño basado en los principios de Apple HIG (*Designing Fluid Interfaces*,
> *Principles of Great Design*): jerarquía antes que decoración, agrupación y
> mapeo (los controles viven junto a lo que afectan), feedback en pointer-down,
> perdón (deshacer) en vez de confirmaciones, y densidad adaptativa real.
>
> Cada etapa es un commit/deploy independiente y deja el panel usable.

## Diagnóstico (estado actual)

| Problema | Dónde | Causa en código |
| --- | --- | --- |
| Cards de filtro gigantes en Clientes | `clientes` | `.client-filter-card { aspect-ratio: 1 }` + `repeat(3,1fr)` (modules.css:395-414) |
| Baldosas de agenda enormes + espacios vacíos | `agenda` | `.agenda-tile { aspect-ratio: 1 }` + `minmax(72px,1fr)` (pimp.css:3059-3081) |
| Todo en una columna en desktop | `agenda`, `clientes`, `gastos` | wrappers `display:grid` sin columnas por breakpoint (Dashboard.jsx:686, 888) |
| Hero de agenda con KPIs y mucho aire | `agenda` | `.dk-hero` + `cols-5` sin variante compacta (Dashboard.jsx:706-728) |
| 6 botones de bloqueo sueltos | `agenda` | `.agenda-bulk-actions` (Dashboard.jsx:762-781) |
| Buscador duplicado | topbar + `clientes`/`reservas` | `.global-search` + `.client-search` |
| Botón "Nuevo cliente" a ancho completo, dominante | `clientes` | `btn-gold btn-block` (Dashboard.jsx:889) |
| Slot reservado no clickeable (sin detalle) | `agenda` | `disabled={state === "booked"}` (Dashboard.jsx:806) |
| Breakpoints inconsistentes | todo el panel | 480/560/640/720/760/768/960/1024 mezclados |
| Sidebar fija 236px siempre | shell | `.dashboard-shell { grid-template-columns: 236px 1fr }` |

---

## Etapa 0 — Fundaciones adaptativas (sistema, no parches)

**Objetivo:** que todos los módulos compartan un mismo sistema de densidad y
breakpoints antes de tocar cada uno.

1. **Breakpoints canónicos** (3, no 8): `--bp-compact: 640px` (teléfono),
   `--bp-medium: 1024px` (tablet/half-window), `--bp-wide: 1440px` (desktop).
   Migrar las media queries del panel a estos tres cortes (solo las de
   `pimp.css`/`modules.css` que afectan al panel; el sitio público no se toca).
2. **Grid de 12 columnas del panel**: utilidad `.dk-grid` (`display:grid;
   grid-template-columns: repeat(12, 1fr)`) + clases `span-*` por breakpoint.
   Cada tab deja de ser una columna única y declara cuántas columnas ocupa cada
   bloque en medium/wide.
3. **Tokens de densidad**: `--pad-panel`, `--gap-grid`, `--row-h` con valores
   por breakpoint (wide = más denso, no más grande: 44px de fila, paddings
   0.8rem). Regla Apple: en desktop crece la *información*, no los elementos.
4. **Sidebar colapsable**: en `≤1024px` colapsa a barra de iconos (56px) con
   tooltips; el usuario también puede colapsarla manualmente en wide
   (persistir en localStorage). Flexibilidad = el usuario controla su espacio.
5. **Press states globales**: `:active { transform: scale(.97) }` +
   `transition: 100ms` en `.btn`, `.agenda-tile`, cards clickeables (feedback
   en pointer-down, no en release). `@media (prefers-reduced-motion)` los
   reemplaza por cambio de opacidad.

**Archivos:** `pimp.css`, `modules.css`, `DashboardShell` en Dashboard.jsx.

---

## Etapa 1 — Agenda (el módulo con más aire muerto)

**Objetivo:** de "lista vertical con baldosas gigantes" a "cabina de control
del día" sin scroll en desktop.

1. **Slots compactos:** quitar `aspect-ratio:1`; altura fija 44px, ancho máximo
   `minmax(64px, 92px)` con `justify-content: start` — los slots ya no se
   estiran para llenar la fila. En móvil se mantienen táctiles (44px mínimo).
2. **Layout 2 columnas en ≥1024px:** izquierda (7/12) la grilla de slots
   MAÑANA/TARDE; derecha (5/12) un panel "Día seleccionado" con: reservas de
   ese día (hora, cliente, servicio, estado), próximo slot libre, y ocupación.
   Hoy esa información obliga a saltar al tab Reservas. *Mapeo:* lo que afecta
   al día vive junto al día.
3. **Hero compacto:** una sola fila (`flex`) con el anillo a 56px + 3 KPIs en
   línea + botón Nueva reserva. Altura objetivo ≤ 88px (hoy ~200px).
4. **Bulk actions agrupadas por contexto:**
   - En el header de cada periodo (MAÑANA/TARDE): un toggle "Bloquear/Habilitar
     periodo" — el control junto a lo que afecta.
   - Día completo y semana completa: menú "Acciones ▾" único al lado del
     selector de semana. Desaparecen los 6 botones sueltos.
5. **Slots reservados clickeables:** quitar `disabled`; click abre popover con
   cliente, servicio, teléfono y accesos (WhatsApp, cancelar, reagendar).
   Tooltip en hover para free/blocked ("Tocar para bloquear/atender").
6. **Drag para rango:** arrastrar sobre varios slots libres los bloquea de una
   pasada (pointer events + `setPointerCapture`, tracking 1:1).
7. **Deshacer en vez de confirmar:** tras un bloqueo masivo, toast "Semana
   bloqueada — Deshacer" (8s). Nada de dialogs para acciones reversibles.

**Archivos:** Dashboard.jsx (tab agenda), pimp.css (agenda-*), nuevo
`AgendaDayPanel.jsx`.

---

## Etapa 2 — Clientes (cards → tabla densa)

**Objetivo:** que en web se vean 15–20 clientes sin scroll, no 3 cards vacías.

1. **Filter-cards → stat-chips:** quitar `aspect-ratio:1`; chips horizontales
   (icono + número + label en una línea, altura 56px) alineados con el
   buscador. Siguen siendo filtros clickeables con estado activo.
2. **Tabla densa en ≥1024px:** columnas Cliente / Contacto / Visitas / Total /
   Última visita / Acciones, filas de 48px, cabecera clickeable para **ordenar**
   (nombre, visitas, gasto, última visita). En móvil se conserva el card-row
   actual de 2 líneas.
3. **Acciones en hover:** editar, reservar y WhatsApp aparecen al hover de la
   fila (siempre visibles en táctil). Fila entera clickeable → perfil.
4. **Filtros nuevos:** además de activos/inactivos/top — rango de gasto y
   "sin visitas". Chips combinables con la búsqueda.
5. **Un solo buscador:** el del panel se elimina; la búsqueda global del topbar
   filtra la tabla cuando estás en Clientes (ya emite eventos de cliente).
6. **"Nuevo cliente" compacto:** botón normal en el header del panel (esquina
   superior derecha), no banda dorada a todo el ancho.
7. **Export CSV** del listado filtrado (botón secundario en el header).

**Archivos:** Dashboard.jsx (tab clientes), modules.css, pimp.css (client-row).

---

## Etapa 3 — Reservas (inbox operativo)

1. **Filtros por estado como segmented control con contador** (Pendientes 3 ·
   Confirmadas 8 · Canceladas 1) en vez de dropdown; + rango de fechas rápido
   (Hoy / Semana / Todas).
2. **Grid adaptativo:** cards de reserva en 2 col (medium) / 3 col (wide);
   fila compacta tipo lista opcional en wide (toggle lista/cards, persistido).
3. **Acciones rápidas en hover:** confirmar / cancelar / WhatsApp sin abrir el
   modal. Cambio de estado con **deshacer** en toast, no confirm.
4. **Búsqueda unificada** con el topbar (igual que Clientes).
5. **Indicador de origen:** chip "web / manual" en cada reserva (el dato ya
   existe en la fila).

**Archivos:** BookingsInbox.jsx, modules.css.

---

## Etapa 4 — Resumen (dashboard ejecutivo)

1. **Grid 12-col:** hero KPI (8) + próxima cita (4); debajo ingresos 7d (6),
   horas pico (3), top servicios (3). Hoy en wide quedan bandas con aire.
2. **Sparklines en KPIs** (ya hay SVG kit `.dk-*`): tendencia semanal en
   ingresos y reservas.
3. **Accesos rápidos contextuales:** si hay reservas pendientes → chip
   "3 pendientes de confirmar" que salta a Reservas filtrado.
4. **Skeletons** en la carga inicial en vez de layout que salta.

**Archivos:** DashboardResumen.jsx, modules.css.

---

## Etapa 5 — Finanzas + Gastos

1. **Finanzas:** selector de periodo (semana/mes/año) como segmented; tabla de
   movimientos densa con orden por columna; totales sticky.
2. **Gastos:** formulario en drawer lateral (no inline gigante); lista con
   filtro por categoría y mes; barra de presupuesto por categoría (dato ya
   existe: `expenseBudgets`).
3. **Export CSV** en ambos.

## Etapa 6 — Servicios, Inscripciones, Marketing, Config

1. **Servicios:** el `svc-grid` ya es auto-fill — subir densidad (minmax 132px),
   edición en drawer lateral en vez de expandir la card a fila completa.
2. **Inscripciones:** tabla densa + estados con chips + búsqueda.
3. **Marketing:** grid 2-col en wide.
4. **Config:** agrupar en secciones colapsables con búsqueda de ajustes.

## Etapa 7 — Craft transversal (el pulido que se siente)

1. **Tipografía:** tracking negativo solo en display (`.dk-hero-title`,
   valores grandes de KPI), `0` en cuerpo; `tabular-nums` en todas las cifras.
2. **Transición de tabs:** cross-fade corto (120ms) + slide 8px, interrumpible;
   sin animación con `prefers-reduced-motion`.
3. **Tooltips** consistentes (delay 400ms) en todos los iconos sin texto.
4. **Empty states accionables:** cada "no hay X" incluye el botón para crear X.
5. **Focus visible + navegación por teclado** en tablas y agenda (flechas entre
   slots, Enter para alternar).
6. **Topbar translúcido:** `backdrop-filter: blur(20px)` + fondo 60% — el
   contenido pasa por debajo; borde inferior solo cuando hay scroll.

---

## Orden y tamaño estimado

| Etapa | Alcance | Tamaño |
| --- | --- | --- |
| 0 | Sistema adaptativo + press states | M |
| 1 | Agenda completa | L |
| 2 | Clientes | M |
| 3 | Reservas | M |
| 4 | Resumen | S |
| 5 | Finanzas/Gastos | M |
| 6 | Módulos restantes | M |
| 7 | Craft transversal | S |

Regla de ejecución: una etapa = un commit + deploy verificado en
`brunetticutz.cl/panel` antes de pasar a la siguiente.
