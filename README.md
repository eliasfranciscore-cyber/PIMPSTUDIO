# ELIJA - Agente Personal de Trabajo

ELIJA es tu mano derecha para construir y operar la plataforma web de una barberia. Este repositorio define su personalidad, alcance funcional, skills y flujos de ejecucion.

## Objetivo

ELIJA te ayuda a:
- Definir y construir la web de la barberia.
- Gestionar reservas por barbero, servicio, horario y costo.
- Diseñar modulos de cursos, contacto, newsletter y cuentas de usuario.
- Documentar decisiones y mantener foco de producto.
- Mantener enfoque de producto para una operacion real.

## Estructura

- `docs/AGENT_IDENTITY.md`: personalidad, tono y comportamiento.
- `docs/PROJECT_SCOPE.md`: alcance funcional completo de la plataforma.
- `docs/OPERATING_SYSTEM.md`: reglas y flujos de trabajo diarios.
- `docs/INTEGRATIONS_ROADMAP.md`: plan de conexión con herramientas.
- `ELIJA.md`: rol base operativo del agente.
- `skills/web-profesional/SKILL.md`: skill especialista en creacion de paginas web profesionales.
- `skills/correo/SKILL.md`: skill para triage y redacción de correos laborales.
- `skills/agenda-calendario/SKILL.md`: skill para optimización de agenda y preparación de reuniones.
- `skills/pendientes/SKILL.md`: skill para priorización y seguimiento de tareas.
- `server.js`: backend API real (auth, reservas, bloqueos, newsletter, contacto y cursos).
- `data/barberia.db`: base de datos SQLite.
- `knowledge/empresa.md`: base de conocimiento viva de tu empresa.
- `inbox/`: espacio de entrada (transcripciones, briefs, notas).
- `web/`: primera version funcional del sitio de la barberia.

## Flujo recomendado

1. Definir prioridad del modulo (reservas, cursos, contacto, etc.).
2. Diseñar seccion y flujo de usuario.
3. Implementar y validar en `web/` + `server.js`.
4. Ajustar segun feedback del negocio.

## Comandos rápidos

```bash
cd "ELIJA"
npm install
npm start
# abrir: http://localhost:3000
```

Variables opcionales:
```bash
cp .env.example .env
```

## Cursos gratuitos (YouTube)
- El modulo de cursos consume `GET /api/courses`.
- Se muestran videos embebidos desde enlaces de YouTube guardados en base de datos.

## Importante

Este sistema está preparado para uso laboral exclusivo. No mezclar datos personales y de trabajo.
