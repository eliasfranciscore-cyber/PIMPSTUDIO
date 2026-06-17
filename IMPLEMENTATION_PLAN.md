# PIMP STUDIO — Plan de implementación (3 módulos nuevos)

> **Origen del contenido:** `~/Downloads/PIMPSTUDIO (4).zip` → `pimpstudio-nuevos-modulos/`
> (extraído en `/tmp/pimp_zip/` durante la sesión del 2026-06-16).
> Repo: `eliasfranciscore-cyber/PIMPSTUDIO`, rama de trabajo: `desarrollo`.
> **Meta (/goal):** los 3 cambios 100% funcionales — cada botón, cada función,
> cada detalle implementado. Nada decorativo. Al terminar: `git push` + deploy
> Vercel **producción** + aviso al móvil.

Marca cada casilla `[x]` al completarla. La tarea automatizada de la 1:20 AM
(17-jun) debe leer este archivo, completar lo que quede `[ ]`, compilar, pushear
y deployar a producción, y avisar al móvil.

---

## Estado del repo (verificado 2026-06-16)

- App React + Vite. Entrada: `src/main.jsx`. Estilos globales: `src/styles/pimp.css`.
- Datos: `src/data.js` (`BARBERS`, `SERVICES`, `SERVICE_BARBERS`, `METRICS`, `CLP`,
  `CLPk`, `barberById`, etc.). **Ya existen** `CLP`, `CLPk`, `barberById`.
- Páginas: `src/pages/Home.jsx`, `Booking.jsx`, `Dashboard.jsx`.
- Los componentes nuevos del zip son auto-contenidos y usan prefijo `.psn-`.

---

## ETAPA 0 — Copiar archivos y registrar CSS  `[ ]`

1. Copiar desde el zip a `src/`:
   - `src/components/IconsExtra.jsx`
   - `src/components/BarberShowcase.jsx`
   - `src/components/BookingsInbox.jsx`
   - `src/components/DashboardResumen.jsx`
   - `src/styles/modules.css`
2. En `src/main.jsx`, junto a `import './styles/pimp.css'`, añadir:
   `import './styles/modules.css'`

---

## ETAPA 1 — Landing barberos (web pública)  `[ ]`

**Archivos:** `src/data.js`, `src/pages/Home.jsx`, `src/components/BarberShowcase.jsx`,
`src/styles/modules.css`, `src/pages/Booking.jsx`.

### 1.a Datos de barberos (`src/data.js`)
Añadir `instagram` y `photo` a cada barbero del array `BARBERS`. Único Instagram
confirmado: **Bruno/Brunetti**. Los demás handles quedan como placeholder hasta
que el usuario confirme (dejar un comentario `// TODO: handle real`). Fotos en
`public/assets/barbers/<archivo>.jpg`. Si falta foto, el componente usa
`/assets/pimp-studio-logo.jpg` (ya implementado en el componente).

| id | nombre | instagram (placeholder salvo Bruno) | photo |
|----|--------|------|-------|
| 4 | Juan Carlos | juancarlos.cuts | /assets/barbers/juan-carlos.jpg |
| 5 | Andryz | andryz.barber | /assets/barbers/andryz.jpg |
| 6 | Brunetti | **(handle real de Bruno — confirmar)** | /assets/barbers/brunetti.jpg |
| 7 | Diego Moya | diegomoya.barber | /assets/barbers/diego-moya.jpg |
| 8 | Thinn Sayen Herrera | thinn.studio | /assets/barbers/thinn.jpg |
| 9 | Vicente Pietrapiana | vicente.barber | /assets/barbers/vicente.jpg |
| 10 | Rodrigo Godoy | rodrigo.fade | /assets/barbers/rodrigo.jpg |
| 11 | Matías Inostroza | matias.barber | /assets/barbers/matias.jpg |

### 1.b Reemplazar la sección de barberos en `Home.jsx`
Reemplazar **todo** el `<section id="sec-barberos">…</section>` (≈ líneas 129-149)
por `<BarberShowcase />` e importar el componente. Quitar el `SectionHead` viejo
(el componente trae su propio encabezado).

### 1.c Requisito visual del usuario: tarjetas CUADRADAS
- Las tarjetas (`.psn-barber-card`) deben ser **cuadradas** y del **mismo tamaño**
  que las tarjetas que ya hay en la página (no rectángulos verticales).
- **Excepción Bruno** (`.is-featured`, tier premium): su tarjeta debe medir **la
  mitad** del tamaño actual.
- Implementar en `src/styles/modules.css`: igualar `width`/`height` de
  `.psn-barber-card` (aspect-ratio 1/1) y una regla `.psn-barber-card.is-featured`
  con la mitad de las dimensiones. Verificar en preview a 1440 / 768 / 390 px.

### 1.d Flujo "Reservar con X" (al abrir la tarjeta)
- El modal (ya en `BarberShowcase.jsx`) muestra foto en círculo, link directo a
  Instagram (`https://instagram.com/<handle>`, target=_blank) y botón
  "Reservar con X".
- "Reservar" guarda `localStorage.ps_pending_barber = id` y navega a `/login`
  (o `/reservar` si ya hay sesión). **Ya implementado** en el componente.

### 1.e Patch en `Booking.jsx` — entrar directo a fecha/hora del barbero elegido
En el primer `useEffect` (validación de sesión, ≈ línea 32), tras el chequeo de
`ps_user`, añadir la lectura de `ps_pending_barber`:
```js
const pending = localStorage.getItem("ps_pending_barber")
if (pending) {
  localStorage.removeItem("ps_pending_barber")
  const id = Number(pending)
  setBarberId(id)
  const allowed = SERVICES.filter((s) => SERVICE_BARBERS[id] ? SERVICE_BARBERS[id].includes(s.id) : true)
  if (allowed[0]) setServiceId(allowed[0].id)
  setStep(2) // paso de fecha + hora
}
```
El cliente entra ya con el barbero elegido y salta al **paso de fecha/hora**, que
lee la disponibilidad real vía `/api/availability` (con fallback local). El botón
"atrás" del header de Booking lo devuelve a servicio → barbero sin cambios extra.

**Aceptación etapa 1:** desde Home, tocar tarjeta → modal con foto/IG/CTA →
"Reservar" → login (si hace falta) → Booking arranca en fecha/hora del barbero.
Tarjetas cuadradas; Bruno a la mitad. IG abre el perfil correcto.

---

## ETAPA 2 — Reservas (panel interno)  `[ ]`

**Archivos:** `src/pages/Dashboard.jsx`, `src/components/BookingsInbox.jsx`.

- Reemplazar el bloque `{tab === "reservas" && ( … )}` (≈ líneas 427-462) por
  `<BookingsInbox bookings={visibleBookings} barbers={barbers} barber={barber}
  admin={admin} onStatus={(bk, s) => updateBookingStatus(bk, s)}
  onReschedule={() => setTab("agenda")} />` e importar el componente.
- `visibleBookings`, `barbers`, `barber`, `admin`, `updateBookingStatus` ya
  existen en Dashboard (verificado).
- Funcionalidad: tarjetas con estado por color; botones Confirmar / Iniciar /
  Completar / Reagendar / Cancelar; **WhatsApp** con mensaje pre-redactado
  (`https://wa.me/56<phone>`); admin (Bruno) ve todos + filtro por barbero;
  barbero normal ve solo su agenda del día.
- Las reservas que caen desde la web pública (cliente) y las creadas en la interna
  deben aparecer aquí y depender de la agenda real de cada barbero.

**Aceptación etapa 2:** cada botón persiste el estado vía `updateBookingStatus`;
WhatsApp abre con el número del cliente; filtros y búsqueda operativos; vista
admin vs. barbero correcta.

---

## ETAPA 3 — Dashboard / Resumen (panel interno)  `[ ]`

**Archivos:** `src/pages/Dashboard.jsx`, `src/components/DashboardResumen.jsx`,
`src/data.js`.

### 3.a Métricas extra en `METRICS` (`src/data.js`)
Añadir (fallback del componente; calcula en vivo lo que puede):
```js
revenueDay: 248910, revenueDayDelta: 12.4,
bookingsDayDelta: 8.1,
expensesMonth: 850000, expensesDelta: -4.2,
newClientsDelta: 14.2,
marketingRoi: 3.8, marketingRoiDelta: 0.6,
// (newClients, occupancy, avgTicket, revenueByDay, barberRanking,
//  channels, promos ya existen)
```
Opcional: `expenseCats` como fallback si `expenses` llega vacío.

### 3.b Reemplazar el bloque `{tab === "resumen" && ( … )}`
(≈ líneas 309-355) por `<DashboardResumen metrics={m} bookings={bookings}
barbers={barbers} expenses={expenses} />` e importar el componente.

- KPIs: ingresos del día, reservas del día, ticket promedio, ocupación, gastos
  del mes, barberos activos, clientes nuevos, ROI marketing.
- Paneles: ingresos por día, ranking barberos, reservas del día, gastos por
  categoría (donut), marketing/origen + promos, equipo de hoy. Responsivo web+iOS.

**Aceptación etapa 3:** el resumen calcula en vivo desde `bookings`/`expenses`,
usa `METRICS` como fallback, y se ve bien a 1440 / 768 / 390 px sin romper el
dock móvil del Dashboard.

---

## ETAPA 4 — Verificación, push y deploy  `[ ]`

1. `npm run build` sin errores.
2. Verificar en preview: Home (barberos cuadrados + Bruno mitad + modal + IG +
   reservar), Dashboard → Reservas, Dashboard → Resumen. 1440 / 768 / 390 px.
3. Commit en rama de trabajo y `git push`.
4. Deploy a **producción** Vercel: `vercel --prod` (o `npx vercel --prod`).
   Verificar que el deploy quede OK (URL de prod responde 200).
5. Avisar al móvil con `PushNotification` (resumen de lo hecho + URL de prod).

---

## Pendientes que requieren al usuario (no bloquean el build)

- **Fotos reales** de los barberos en `public/assets/barbers/` (mientras tanto:
  fallback al logo).
- **Handles de Instagram reales** (solo el de Bruno está confirmado; el resto son
  placeholders marcados con `// TODO`).
- Confirmar handle real de Bruno/Brunetti.

## Registro de avance — 2026-06-17

- **Etapa 0** `[x]` — 5 archivos copiados a `src/`; `modules.css` importado en `main.jsx`.
- **Etapa 1** `[x]` — Barberos integrados. **Layout revisado por el cliente:** ya
  NO es carrusel ni "Bruno a la mitad". Ahora es un **mosaico grid** (todos
  visibles): **Bruno (premium) es la tarjeta GRANDE 2×2 y va primero**, el resto
  son tarjetas cuadradas más pequeñas debajo (desktop 4 col / tablet 3 / móvil 2,
  con Bruno a ancho completo en móvil). Modal con foto en círculo + IG + "Reservar
  con X". Patch de `Booking.jsx` entra directo al paso fecha/hora. Fallback de foto
  al logo vía `onError`.
- **Etapa 2** `[x]` — `BookingsInbox` integrado (estados, WhatsApp, filtros, vista
  admin vs. barbero).
- **Etapa 3** `[x]` — `DashboardResumen` integrado (8 KPIs + paneles).
- **Extras pedidos 2026-06-17** `[x]`:
  - Lista de **precios en grid de 2 columnas en móvil** (web igual). `pimp.css`.
  - **Instagram de la barbería en el footer**: https://www.instagram.com/pimpstudiochile/
    (ícono `instagram` agregado a `ui.jsx`).
- **Etapa 4** — `npm run build` OK; verificado en preview (desktop 1280 + móvil 390);
  push + deploy Vercel producción + aviso al móvil.

### Sigue pendiente (requiere al usuario, no bloquea)
- Fotos reales de barberos en `public/assets/barbers/` (hoy: fallback al logo).
- Handles de Instagram reales por barbero (placeholders con `// TODO`; falta
  confirmar el de Bruno).

## Notas

- WhatsApp usa el `phone` del cliente: `https://wa.me/56<numero>`.
- "Barberos activos" = `barber.active !== false`.
- Todo el CSS nuevo usa tokens de `pimp.css` y prefijo `.psn-`.
