# PIMPSTUDIO - Changelog de implementacion

Este archivo registra el avance funcional de la rama `desarrollo` para que cualquier computador o agente pueda retomar la tarea sin depender del historial de chat.

## 2026-06-24 - Hero Brunetti sin efecto gooey + modo claro pulido en todos los módulos

### Resumen
Se eliminó el efecto de morphing "gooey" del nombre del hero (quedaba ilegible mid-transición, p. ej. "Bnto") y se reordenó el hero para que **Brunetti** vaya arriba y el kicker *Visagista · Barbería Premium · Maipú* debajo. Se hizo una pasada completa de **modo claro** corrigiendo todos los bloques oscuros hardcodeados, textos sin contraste y el `theme-color` de iOS.

### Cambios principales

- **Hero (`src/pages/Home.jsx`)**: se quitó `GooeyText` (componente eliminado) y se renderiza "Brunetti" estático con la animación limpia letra-por-letra (`bruLetterUp`). Nuevo orden: nombre → kicker → rol → subtítulo. `NAME` ahora es `'Brunetti'` (case mixto para Pirata One).
- **CSS gooey muerto eliminado** en `src/styles/brunetti.css` (`.gm-*`, `.bhero-morph`, filtro `#gm-goo`).
- **Modo claro — contraste de textos**: `--ink-2`/`--ink-3` reforzados (0.82 / 0.62) para que checklists, descripciones y metadatos se lean bien sobre fondo claro.
- **Modo claro — Cursos hero (sobre foto oscura)**: el botón ghost "VER PROGRAMA" y los indicadores `course-stats` (MÓDULOS/LECCIONES) ahora se quedan claros para no perderse sobre la foto.
- **Modo claro — Workshop**: superficies con fondo oscuro hardcodeado (que no usaban tokens) se vuelven claras: `.wks-panel` (tarjetas de precio/contenido), inputs y `<select>` del formulario (antes bloques negros ilegibles), `.wks-cd-cell`, barra de cupos, `.wks-success` y botones ghost.
- **iOS — `theme-color` dinámico** (`index.html` + `src/components/theme.jsx`): se reemplazaron los dos `<meta theme-color>` basados en `prefers-color-scheme` por uno único sincronizado por JS con `data-theme` (toggle / hora de Santiago). Así las barras superior/inferior de iOS dejan de pintarse con el color del tema contrario.

### Archivos modificados
- `src/pages/Home.jsx`, `src/components/theme.jsx`, `src/styles/brunetti.css`, `index.html`
- `src/components/GooeyText.jsx` (eliminado)

### Verificación realizada
- `npm run build` limpio. Verificado en preview (móvil 375px) en modo claro y oscuro: Home (orden hero + nombre sin gooey), Cursos (ghost + indicadores sobre foto), Workshop (panel de precio y formulario claros). Deploy a producción.

## 2026-06-22 - Marca personal Brunetti (un solo barbero) + módulo Cursos + panel interno solo-Brunetti

### Resumen
Giro radical a marca personal de **un único barbero, Brunetti (Bruno Herrera)**. Se rehízo la landing 1:1 desde el design handoff, se agregó la página `/cursos`, se mantuvo el `/workshop` antiguo (con nueva fecha/sede) y se redujo el panel interno a la **gestión exclusiva de horas de Brunetti**, dejando el resto inactivo pero conservado en código.

### Cambios principales

- **Landing (`src/pages/Home.jsx`)**: recreación del diseño Brunetti (hero cinematográfico con la foto de Bruno, visagismo 5 pilares, sobre Bruno con contadores, servicios, antes/después, carrusel + modal, teaser cursos, testimonios, contacto, ubicación). Foto central del hero = `public/assets/bruno-hero.jpg`.
- **CSS scopeado** en `src/styles/brunetti.css` bajo `.brunetti-site` (tokens oro/glass, keyframes `bru*`) para no afectar booking/dashboard/login.
- **Página Cursos** (`src/pages/Cursos.jsx`, ruta `/cursos`): hero Ken Burns, acordeón de 6 módulos, formulario de lista de espera (`localStorage["curso_waitlist"]`). Se **mantiene** `/workshop` antiguo.
- **Workshop**: próxima edición **23 de agosto 2026 en Viña del Mar** (`src/data/workshop.js`); foto grupal (sesión anterior) como hero; título sin desbordes en móvil.
- **Un solo barbero**: `src/data.js` `BARBERS` = solo Brunetti (id 6); `SERVICE_BARBERS` y datos demo reasignados a id 6. `Booking.jsx` omite el paso "Barbero" (arranca en Servicio con Brunetti) y no repuebla barberos desde la API.
- **Navbar**: enlaces a `Workshop` y `Cursos`; "Acceso barberos" disponible en el menú móvil. Todo el texto centrado en vista móvil; sin solapes ni desbordes.
- **Eliminada colisión CSS**: se removió de `pimp.css` el bloque muerto de estilos showcase (`.cmp-*/.tm-*/.ac-*/.lamp-*/.feature-*`) que rompía el antes/después.
- **Panel interno solo-Brunetti** (flag `BRUNETTI_ONLY` en `Dashboard.jsx`): nav reducida a **Agenda + Reservas + Config**; resumen multi-barbero, finanzas, clientes, servicios, gastos, marketing y la sección **Equipo** quedan ocultos pero el código se conserva para reactivar a futuro. Selector de barbero retirado de la Agenda; `BookingsInbox` oculta filtro y columna de barbero cuando hay uno solo. `BarberModal` se conserva (inactivo). Login interno (`BarberLogin.jsx`) recopiado a "Acceso Brunetti".

### Cómo revertir a multi-barbero
- `Dashboard.jsx`: poner `BRUNETTI_ONLY = false` (reaparecen todos los módulos + Equipo).
- Restaurar el fetch `/api/barbers` comentado en el `useEffect` de carga y repoblar `BARBERS` en `src/data.js`.

### Archivos modificados
- `src/pages/Home.jsx`, `src/pages/Cursos.jsx` (nuevo), `src/pages/Booking.jsx`, `src/pages/Dashboard.jsx`, `src/pages/BarberLogin.jsx`
- `src/components/brunetti.jsx` (nuevo), `src/components/BookingsInbox.jsx`
- `src/styles/brunetti.css` (nuevo), `src/styles/pimp.css`, `src/styles/workshop.css`
- `src/data.js`, `src/data/workshop.js`, `src/App.jsx`, `src/main.jsx`
- `public/assets/bruno-hero.jpg`, `bruno-feature.jpg`, `bruno-portrait.jpg`, `workshop-2026.jpg`

### Verificación realizada
- `npm run build` limpio. Landing/cursos/booking/workshop verificados en preview. Deploy a producción (`pimpstudio.cl`).

## 2026-06-13 - Rediseño UI para web y componentes responsivos

### Resumen
Se transformó la interfaz de usuario de una app móvil agrandada a una aplicación web moderna y responsiva. Se eliminó StatusBar de todas las páginas, se creó componente GlareCard personalizado para efectos visuales, y se rediseñó completamente el flujo de reserva (barberos, servicios, fecha/hora) con grids responsivos. Se compactaron todas las vistas internas (Account, confirmación) para web.

### Cambios principales

- **Eliminado StatusBar**: removido de `Login.jsx`, `Booking.jsx` y `Account.jsx` para limpiar la interfaz.
- **Nuevo componente GlareCard** (`src/components/GlareCard.jsx`): efecto de brillo dinámico al pasar el mouse, con soporte para múltiples elementos (`as` prop).
- **Rediseño Booking paso 0 (barberos)**: cambio de lista vertical a grid responsivo `repeat(auto-fill, minmax(140px, 1fr))`, tarjetas más compactas con solo nombres y logos.
- **Rediseño Booking paso 1 (servicios)**: grid responsivo `repeat(auto-fill, minmax(160px, 1fr))` con tarjetas centradas y más pequeñas.
- **Rediseño Booking paso 2 (fecha/hora)**: layout horizontal con calendario compacto a la izquierda (`1fr`) y horas disponibles a la derecha (`1.2fr`), solo mostrando semanas y navegación de próxima semana.
- **Rediseño Booking paso 3 (confirmación)**: compactado con círculo de checkmark más pequeño (60x60), título reducido, botones lado a lado en 2 columnas.
- **Footer de Booking**: botón "CONFIRMAR RESERVA" ahora 1/4 del tamaño, posicionado al lado derecho con flex layout.
- **Account.jsx (página cliente)**: agregado `maxWidth: 900px`, reducidos todos los paddings/gaps/font-sizes, grid de estadísticas responsivo, historial limitado a 5 items, botones más pequeños.
- **Config general**: `maxWidth: 1000px` al contenedor principal de Booking para evitar que la interfaz sea demasiado ancha en desktop.

### Archivos modificados

- `src/components/GlareCard.jsx`: nuevo componente
- `src/pages/Booking.jsx`: rediseño completo de los 4 pasos con grids responsivos y componentes compactos
- `src/pages/Account.jsx`: compactado para web, reducción de paddings y font-sizes
- `.claude/launch.json`: archivo de configuración de dev server

### Verificación realizada

- Dev server ejecutándose en puerto 5173
- Interfaz responsive en desktop: tarjetas de barberos/servicios en múltiples columnas, calendario compacto, botones proporcionales
- Efecto GlareCard funcionando en tarjetas (brillo dinámico al hover)
- Flujo de reserva completo probado: barberos → servicios → fecha/hora → confirmación

### Pendiente inmediato

- Probar responsive en tablet y móvil para validar adaptabilidad del nuevo grid
- Considerar animaciones suaves en transiciones entre pasos
- Ajustar si hay overflow en pantallas muy pequeñas

## 2026-06-12 - Base operativa clientes, agenda y panel interno

### Contexto

- Worktree activo: `/Users/elija/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/PIMPSTUDIO-desarrollo`.
- Rama activa: `desarrollo`.
- Base remota inicial de esta etapa: `origin/desarrollo` en commit `3867c4f`.
- URL de referencia Vercel indicada por el usuario: `https://pimpstudio-git-desarrollo-eliasfranciscore-cybers-projects.vercel.app/panel`.
- Objetivo general: convertir PIMPSTUDIO en una app completa para clientes y barberos, con reservas, clientes, historial, servicios editables, gastos, usuarios/barberos, permisos por modulo, agenda operable, backend en Neon y despliegue en Vercel.

### Cambios implementados

- Se agrego un panel de clientes inicial en `/panel`, pestaña `Clientes`, usando registros desde `/api/clients`.
- La pestaña `Clientes` ahora incluye buscador por nombre, telefono o correo.
- La pestaña `Clientes` ahora muestra detalle del cliente seleccionado con visitas, total consumido, ultima visita e historial de reservas.
- El detalle de cliente consulta `/api/bookings?phone=...` y usa reservas locales como fallback.
- Se agrego identificacion de cliente por telefono de 9 digitos en `/login`.
- Si el telefono no existe, el login cambia a modo registro y exige nombre, telefono y correo.
- Se agrego panel de cuenta del cliente en `/cuenta` con contador de visitas, historial, gasto historico y proxima reserva.
- Se conecto `/reservar` a `/api/barbers`, `/api/services` y `/api/availability`.
- Se agrego consulta de disponibilidad real por barbero/fecha al flujo de reserva del cliente.
- Se agrego carrusel de galeria en landing con fotos existentes en `public/assets`.
- Se agrego efecto visual tipo glowing sobre cards de precios de servicios.
- Se agrego fondo animado con tonos negro, gris, blanco sutil y dorado.
- Se agrego modulo `Servicios` en `/panel` para crear, editar y publicar/ocultar servicios.
- La landing y la reserva consumen servicios desde `/api/services`, por lo que cambios internos impactan la pagina publica.
- Se agrego modulo `Gastos` en `/panel` para registrar y listar gastos.
- Se agrego modulo `Config.` con estado inicial de permisos por barbero.
- Se agrego sesion firmada basica para barberos/admin en `api/_auth.js`.
- `api/auth-barber.js` ahora emite `token` junto con `barber`.
- `src/pages/BarberLogin.jsx` guarda `ps_barber_token` en `localStorage`.
- Se amplio `api/barbers.js` para listar barberos activos/inactivos y soportar `POST`/`PATCH` protegidos.
- Se amplio `api/availability.js` para `GET`, `POST` y `DELETE`.
- `api/availability.js` ahora devuelve estado por slot: `free`, `blocked` o `booked`.
- Se reemplazo la agenda interna mock por una grilla semanal real en `/panel`, pestaña `Agenda`.
- La agenda interna permite bloquear/desbloquear horarios por barbero y fecha.
- Los bloqueos de la agenda interna alimentan el mismo endpoint que ve el cliente al agendar.
- La agenda interna ya no usa fechas fijas ni `slotState`; usa semana actual, navegacion semanal y slots de 1 hora.
- La agenda interna y la reserva publica ahora usan bloques de 1 hora: `09:00` a `19:00`.
- La agenda interna muestra selector de semana anterior/actual/siguiente, resumen de semana e indicadores de disponibles.
- Los estados de agenda quedan separados como `Atiende`, `Bloqueado` y `Reservado`.
- Los slots `Reservado` no se pueden tocar desde la grilla para evitar sobrescribir reservas de clientes.
- Se agrego fallback local con `localStorage.ps_availability_blocks` para probar bloqueo/desbloqueo en `localhost:5174`, donde Vite no ejecuta serverless functions.
- `/reservar` tambien lee `localStorage.ps_availability_blocks` como fallback local, por lo que un bloqueo hecho en `/panel` se refleja al reservar durante pruebas locales.
- `api/clients.js`, `api/expenses.js` y mutaciones de `api/services.js` ahora exigen sesion interna cuando corren como API real.
- La pestaña `Config.` ahora incluye formulario para crear cuentas de barberos con nombre, usuario, rol, categoria y PIN inicial.
- La pestaña `Config.` ahora permite editar nombre/usuario/rol, activar/desactivar barberos y guardar permisos por modulo.
- Los permisos disponibles son: `Finanzas`, `Servicios`, `Equipo` y `Bloques`.
- La navegacion interna usa permisos: finanzas solo aparece con permiso financiero/admin; servicios solo aparece con permiso de servicios/admin.
- La cuenta Brunetti/admin queda protegida como administrador completo y no se puede desactivar desde la tabla.
- La pestaña `Config.` ahora agrega opciones operativas: duracion de bloque, anticipacion minima, ventana de reservas, domingos, recordatorio cliente y regla de cancelacion.
- Se agrego bloque de seguridad/datos/mantencion con recordatorios de `PS_SESSION_SECRET`, backups Neon, exportaciones y auditoria futura.
- `api/bookings.js` ahora permite listado interno autenticado de reservas y cambio de estado por `PATCH`.
- La pestaña `Reservas` ya no depende solo de `TODAY_BOOKINGS`; carga reservas desde `/api/bookings` cuando la API esta disponible.
- Las reservas internas permiten cambiar estado: pendiente, confirmada, en curso, completada y cancelada.
- El resumen del panel calcula ingresos, cantidad de reservas y ticket promedio desde reservas cargadas.
- La pestaña `Finanzas` ahora deriva ingresos, ticket promedio, cantidad de servicios, proyeccion, ingresos por dia, ingresos por servicio e ingresos por barbero desde reservas completadas cargadas; los mocks quedan solo como fallback cuando no hay datos reales.
- Los barberos normales ven sus propias reservas y metricas derivadas; Brunetti/admin ve la vista global.
- Se agregaron tablas `expenses` y `barber_permissions` a `db/schema.sql`.
- Se agregaron seeds de gastos y permisos admin Brunetti a `db/seed.sql`.

### Archivos principales tocados

- `api/_auth.js`: helper de sesion firmada para panel interno.
- `api/auth-barber.js`: login interno con token.
- `api/auth-login.js`: login/registro de cliente por telefono.
- `api/barbers.js`: CRUD inicial de barberos y permisos.
- `api/clients.js`: lookup por telefono y listado interno de clientes.
- `api/availability.js`: disponibilidad real y bloqueos horarios.
- `api/expenses.js`: modulo de gastos.
- `api/services.js`: servicios dinamicos y edicion.
- `db/schema.sql`: tablas base Neon.
- `db/seed.sql`: datos de prueba.
- `src/pages/Login.jsx`: flujo cliente registrado/no registrado.
- `src/pages/Booking.jsx`: reserva con datos desde API.
- `src/pages/Account.jsx`: panel del cliente.
- `src/pages/Home.jsx`: carrusel, servicios dinamicos y glow.
- `src/pages/Dashboard.jsx`: panel interno con clientes, servicios, gastos, configuracion y agenda real.
- `src/styles/pimp.css`: responsive, carrusel, glow, fondo animado y agenda.
- `src/data.js`: fallbacks demo para desarrollo sin Neon.

### Verificacion realizada

- `npm install` ejecutado en el worktree `PIMPSTUDIO-desarrollo`.
- `npm run build` paso correctamente despues de la primera etapa.
- Dev server usado: `npm run dev -- --host 127.0.0.1 --port 5174`.
- `curl -I http://127.0.0.1:5174/` respondio `HTTP/1.1 200 OK`.

### Pendiente inmediato

- Ejecutar nuevamente `npm run build` despues de los ultimos cambios de agenda.
- Probar manualmente en `/panel`:
  - Login interno con usuario `Brunetti` y PIN `1234`.
  - Pestaña `Agenda`: bloquear una hora libre y desbloquearla.
  - `/reservar`: confirmar que esa hora aparece no disponible para el cliente.
- Completar proteccion granular por permiso especifico, no solo admin/sesion.
- Probar manualmente UI CRUD de barberos en `Config.` con Neon activo: crear, activar/desactivar, permisos por modulo y PIN.
- Probar manualmente cambios de estado en `Reservas` con Neon activo y verificar que `completada` alimente historial/metricas.
- Completar restriccion real por permisos:
  - Brunetti/admin ve finanzas, gastos, usuarios y servicios.
  - Barbero normal ve solo su agenda, sus metricas, sus reservas y disponibilidad.
- Completar reportes avanzados cruzando `bookings`, `services`, `expenses` y `barbers`, incluyendo utilidad neta, costos por categoria y rangos de fecha configurables.
- Revisar responsive real con navegador en desktop, tablet y movil.
- Hacer commit en `desarrollo`, push y verificar deploy de Vercel.

### Notas tecnicas

- `DATABASE_URL` debe existir en Vercel/Neon para persistencia real.
- Ejecutar `db/schema.sql` y `db/seed.sql` en Neon antes de usar la app con base limpia.
- `PS_SESSION_SECRET` recomendado en Vercel para firmar sesiones internas. Si no existe, se usa fallback demo.
- `.DS_Store` aparece modificado como ruido local del worktree; no representa cambio funcional.
- `npm install` reporto 2 vulnerabilidades moderadas. No se aplico `npm audit fix --force` para evitar cambios rompientes.
