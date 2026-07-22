-- Mantenimiento puntual: elimina todas las reservas del usuario "Amaro Morales"
-- (estaba agendando muchas reservas simultáneas / spam).
--
-- Cómo usar:
--   1. Revisa primero el SELECT para confirmar que es el usuario correcto.
--   2. Si el nombre coincide con más de un usuario o no coincide, ajusta el
--      filtro (por ejemplo por u.phone) antes de borrar.
--   3. Ejecuta con: psql "$DATABASE_URL" -f db/maintenance-delete-amaro-morales.sql
--
-- No se puede ejecutar desde este entorno: no hay credenciales de la base de
-- datos de producción (DATABASE_URL) disponibles en esta sesión.

-- 1) Verificar antes de borrar
SELECT b.id, b.booking_date, b.booking_time, b.status, u.name, u.phone
FROM bookings b
JOIN users u ON b.client_id = u.id
WHERE u.name ILIKE '%amaro%morales%';

-- 2) Borrado definitivo de esas reservas
DELETE FROM bookings
WHERE client_id IN (
  SELECT id FROM users WHERE name ILIKE '%amaro%morales%'
);
