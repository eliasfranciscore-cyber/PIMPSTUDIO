# PIMPSTUDIO - Changelog de implementacion

Este archivo registra el avance funcional de la rama `desarrollo` para que cualquier computador o agente pueda retomar la tarea sin depender del historial de chat.

## 2026-06-12 - Base operativa clientes, agenda y panel interno

### Contexto

- Worktree activo: `/Users/elija/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/PIMPSTUDIO-desarrollo`.
- Rama activa: `desarrollo`.
- Base remota inicial de esta etapa: `origin/desarrollo` en commit `3867c4f`.
- URL de referencia Vercel indicada por el usuario: `https://pimpstudio-git-desarrollo-eliasfranciscore-cybers-projects.vercel.app/panel`.
- Objetivo general: convertir PIMPSTUDIO en una app completa para clientes y barberos, con reservas, clientes, historial, servicios editables, gastos, usuarios/barberos, permisos por modulo, agenda operable, backend en Neon y despliegue en Vercel.

### Cambios implementados

- Se agrego un panel de clientes inicial en `/panel`, pestaña `Clientes`, usando registros desde `/api/clients`.
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
- La agenda interna ya no usa fechas fijas ni `slotState`; usa semana actual, navegacion semanal y slots de 30 minutos.
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
- `api/bookings.js` ahora permite listado interno autenticado de reservas y cambio de estado por `PATCH`.
- La pestaña `Reservas` ya no depende solo de `TODAY_BOOKINGS`; carga reservas desde `/api/bookings` cuando la API esta disponible.
- Las reservas internas permiten cambiar estado: pendiente, confirmada, en curso, completada y cancelada.
- El resumen del panel calcula ingresos, cantidad de reservas y ticket promedio desde reservas cargadas.
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
- Persistir metricas reales desde `bookings`, `services`, `expenses` y `barbers`, no solo mocks.
- Revisar responsive real con navegador en desktop, tablet y movil.
- Hacer commit en `desarrollo`, push y verificar deploy de Vercel.

### Notas tecnicas

- `DATABASE_URL` debe existir en Vercel/Neon para persistencia real.
- Ejecutar `db/schema.sql` y `db/seed.sql` en Neon antes de usar la app con base limpia.
- `PS_SESSION_SECRET` recomendado en Vercel para firmar sesiones internas. Si no existe, se usa fallback demo.
- `.DS_Store` aparece modificado como ruido local del worktree; no representa cambio funcional.
- `npm install` reporto 2 vulnerabilidades moderadas. No se aplico `npm audit fix --force` para evitar cambios rompientes.
