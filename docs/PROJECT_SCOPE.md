# Alcance Funcional - Plataforma Web Barberia

## Objetivo
Construir una plataforma web para la barberia que permita captar clientes, gestionar reservas y administrar operacion por barbero.

## Modulo 1: Sitio principal
- Home con propuesta de valor de la barberia.
- Pagina de servicios con descripcion, duracion y costo.
- Perfil de barberos (especialidad, experiencia, disponibilidad general).

## Modulo 2: Reservas online
- Seleccion de servicio.
- Seleccion de barbero.
- Seleccion de fecha y bloque horario disponible.
- Confirmacion de reserva.
- Reagendamiento y cancelacion bajo politicas definidas.

## Modulo 3: Gestion de disponibilidad
- Cada barbero define bloques de tiempo disponibles.
- Soporte para horarios distintos por dia.
- Bloqueo de horarios por ausencia o evento especial.
- Visualizacion clara de cupos tomados y libres.

## Modulo 4: Servicios y precios
- CRUD de servicios (crear, editar, activar/desactivar).
- Costo por servicio.
- Duracion estimada por servicio.
- Posibilidad de asignar servicio a uno o varios barberos.

## Modulo 5: Cursos para nuevos barberos
- Catalogo de cursos.
- Ficha por curso (descripcion, duracion, modalidad, costo).
- Registro de interesados.
- Seguimiento de inscripciones.

## Modulo 6: Contacto
- Formulario de contacto (nombre, email, telefono, mensaje).
- Canal directo para consultas.
- Confirmacion de envio.

## Modulo 7: Ubicacion en mapa real
- Integracion con mapa real (Google Maps u OpenStreetMap).
- Marcador con direccion exacta de la barberia.
- Boton para abrir ruta.

## Modulo 8: Newsletter
- Formulario de suscripcion.
- Gestion de lista de suscriptores.
- Consentimiento y politica de privacidad.
- Base para envio de promociones y novedades.

## Modulo 9: Cuentas de usuario
- Registro e inicio de sesion.
- Perfil de cliente con datos guardados.
- Historial de reservas.
- Gestion de futuras reservas.

## Reglas clave de negocio
- Ninguna reserva puede duplicar un bloque ya ocupado.
- El costo final debe corresponder al servicio seleccionado.
- El sistema debe registrar barbero, cliente, servicio, fecha y hora.
- El usuario autenticado debe poder ver y gestionar solo sus reservas.

## Datos minimos por reserva
- Cliente.
- Barbero.
- Servicio.
- Duracion.
- Costo.
- Fecha.
- Hora.
- Estado (confirmada, completada, cancelada, reagendada).

## Priorizacion inicial sugerida (MVP)
1. Servicios y precios.
2. Gestion de barberos y disponibilidad.
3. Reservas online.
4. Cuentas de usuario.
5. Contacto + mapa.
6. Newsletter.
7. Cursos.
