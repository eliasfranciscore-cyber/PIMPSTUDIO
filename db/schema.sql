-- PIMP STUDIO — Schema PostgreSQL (NEON)
-- Ejecutar en la consola SQL de NEON antes de usar la app

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  phone      VARCHAR(20)  UNIQUE NOT NULL,
  name       VARCHAR(200),
  email      VARCHAR(300),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barbers (
  id         INTEGER PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  short_name VARCHAR(100),
  code       VARCHAR(100) UNIQUE NOT NULL,
  role       VARCHAR(200),
  tier       VARCHAR(50)  DEFAULT 'general',
  exp_years  INTEGER      DEFAULT 0,
  rating     DECIMAL(3,1) DEFAULT 5.0,
  active     BOOLEAN      DEFAULT true,
  pin_hash   VARCHAR(64),
  created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id            INTEGER PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  price         INTEGER      NOT NULL,
  duration_min  INTEGER      NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  tne_eligible  BOOLEAN      DEFAULT false,
  description   TEXT,
  active        BOOLEAN      DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER REFERENCES users(id),
  barber_id     INTEGER REFERENCES barbers(id),
  service_id    INTEGER REFERENCES services(id),
  booking_date  DATE        NOT NULL,
  booking_time  TIME        NOT NULL,
  status        VARCHAR(50) DEFAULT 'confirmada',
  notes         TEXT,
  created_at    TIMESTAMP   DEFAULT NOW(),
  updated_at    TIMESTAMP   DEFAULT NOW(),
  UNIQUE (barber_id, booking_date, booking_time)
);

CREATE TABLE IF NOT EXISTS availability_blocks (
  id         SERIAL PRIMARY KEY,
  barber_id  INTEGER REFERENCES barbers(id),
  block_date DATE        NOT NULL,
  slot_time  TIME        NOT NULL,
  reason     VARCHAR(200),
  created_at TIMESTAMP   DEFAULT NOW(),
  UNIQUE (barber_id, block_date, slot_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_barber_date  ON bookings(barber_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client       ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_users_phone           ON users(phone);
