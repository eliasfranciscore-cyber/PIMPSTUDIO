/* PIMP STUDIO — Log de auditoría de intentos de reserva (flujo público).
   ------------------------------------------------------------------
   El incidente que originó esta ronda de arreglos no se pudo diagnosticar
   con certeza porque, para cuando se revisó, los logs efímeros de Vercel
   ya habían rotado. Esta tabla registra cada intento real de reserva del
   cliente —éxito, rechazo o error— para que la próxima vez la pregunta
   "¿por qué no me quedó la hora?" se responda con una consulta SQL en vez
   de con logs que ya no están. Best-effort: si esto falla, nunca debe
   tumbar la reserva real que se está procesando. */

export async function logBookingAttempt(sql, { phone, barberId, serviceId, date, time, outcome, reason, bookingId } = {}) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS booking_attempts (
        id           SERIAL PRIMARY KEY,
        phone        TEXT,
        barber_id    INTEGER,
        service_id   INTEGER,
        booking_date DATE,
        booking_time TEXT,
        outcome      TEXT NOT NULL,
        reason       TEXT,
        booking_id   INTEGER,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sql`
      INSERT INTO booking_attempts (phone, barber_id, service_id, booking_date, booking_time, outcome, reason, booking_id)
      VALUES (${phone || null}, ${barberId ? Number(barberId) : null}, ${serviceId ? Number(serviceId) : null},
              ${date || null}, ${time || null}, ${outcome}, ${reason || null}, ${bookingId || null})
    `
  } catch (err) {
    console.error("logBookingAttempt error (no bloquea):", err)
  }
}
