const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "elija-dev-secret";
const ADMIN_KEY = process.env.ADMIN_KEY || "barber-admin-2026";
const DB_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DB_DIR, "barberia.db");
const UPLOADS_DIR = path.join(__dirname, "web", "uploads");
const BASE_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];
const BARBERS_CATALOG = [
  { code: "juan-carlos", name: "Juan Carlos", specialty: "Corte y perfilado" },
  { code: "andryz", name: "Andryz", specialty: "Corte y estilo urbano" },
  { code: "bruno-herrera", name: "Bruno Herrera", specialty: "Brunetti Experiencia" },
  { code: "diego-moya", name: "Diego Moya", specialty: "Corte y barba" },
  { code: "thinn-sayen-herrera", name: "Thinn Sayen Herrera", specialty: "Corte y visagismo" },
  { code: "vicente-pietrapiana", name: "Vicente Pietrapiana", specialty: "Fade y perfilado" },
  { code: "rodrigo-godoy", name: "Rodrigo Godoy", specialty: "Corte clásico y moderno" },
];
const SERVICES_CATALOG = [
  {
    code: "asesoria-corte",
    name: "Asesoría de corte",
    duration: 60,
    price: 24990,
    category: "Servicios",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "corte-cabello",
    name: "Corte de cabello",
    duration: 45,
    price: 15990,
    category: "Servicios",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "corte-cabello-perfilado-barba",
    name: "Corte de cabello y Perfilado de barba",
    duration: 70,
    price: 22990,
    category: "Servicios",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "perfilado-barba",
    name: "Perfilado de barba",
    duration: 35,
    price: 11990,
    category: "Servicios",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "solo-fade",
    name: "Solo fade",
    duration: 30,
    price: 9990,
    category: "Servicios",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "asesoria-imagen-visagista",
    name: "Asesoría de Imagen-Visagista",
    duration: 75,
    price: 39990,
    category: "Brunetti Experiencia",
    tneEligible: false,
    onlyBruno: true,
  },
  {
    code: "bruno-corte-cabello",
    name: "Corte de cabello",
    duration: 50,
    price: 19990,
    category: "Brunetti Experiencia",
    tneEligible: false,
    onlyBruno: true,
  },
  {
    code: "corte-cabello-barba-bruno",
    name: "Corte de cabello y barba",
    duration: 75,
    price: 29990,
    category: "Brunetti Experiencia",
    tneEligible: false,
    onlyBruno: true,
  },
  {
    code: "ondulacion-permanente",
    name: "Ondulación permanente",
    duration: 120,
    price: 65990,
    category: "Servicios Químicos",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "platinado-global",
    name: "Platinado Global",
    duration: 150,
    price: 89990,
    category: "Servicios Químicos",
    tneEligible: true,
    onlyBruno: false,
  },
  {
    code: "visos-platinados",
    name: "Visos Platinados",
    duration: 135,
    price: 74990,
    category: "Servicios Químicos",
    tneEligible: true,
    onlyBruno: false,
  },
];

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

function hasColumn(table, column) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  return columns.some((c) => c.name === column);
}

function formatPhoneCl(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("569")) {
    return `+569 ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
  }
  return String(raw || "").trim();
}

function isValidPhoneCl(raw) {
  return /^\+569\s\d{4}\s\d{4}$/.test(String(raw || "").trim());
}

function saveBarberPhotoDataUrl(photoDataUrl, barberCode) {
  if (!photoDataUrl) return null;
  const raw = String(photoDataUrl).trim();
  const match = raw.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error("Formato de foto inválido. Debe ser imagen png/jpg/webp.");
  }
  const mime = match[1];
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const base64 = match[3];
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 4 * 1024 * 1024) {
    throw new Error("La foto supera 4MB.");
  }
  const safeCode = String(barberCode || "barber")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const filename = `${safeCode}-${Date.now()}.${ext}`;
  const target = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(target, buffer);
  return `uploads/${filename}`;
}

function ensureSchemaMigrations() {
  if (!hasColumn("users", "phone")) {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  }
  if (!hasColumn("barbers", "code")) {
    db.exec("ALTER TABLE barbers ADD COLUMN code TEXT");
  }
  if (!hasColumn("barbers", "active")) {
    db.exec("ALTER TABLE barbers ADD COLUMN active INTEGER NOT NULL DEFAULT 1");
  }
  if (!hasColumn("barbers", "photo_url")) {
    db.exec("ALTER TABLE barbers ADD COLUMN photo_url TEXT");
  }
  if (!hasColumn("services", "code")) {
    db.exec("ALTER TABLE services ADD COLUMN code TEXT");
  }
  if (!hasColumn("services", "category")) {
    db.exec("ALTER TABLE services ADD COLUMN category TEXT NOT NULL DEFAULT 'Servicios'");
  }
  if (!hasColumn("services", "tne_eligible")) {
    db.exec("ALTER TABLE services ADD COLUMN tne_eligible INTEGER NOT NULL DEFAULT 0");
  }
  if (!hasColumn("services", "only_bruno")) {
    db.exec("ALTER TABLE services ADD COLUMN only_bruno INTEGER NOT NULL DEFAULT 0");
  }

  db.exec(`
    UPDATE barbers
    SET code = NULL
    WHERE code IS NOT NULL
      AND id NOT IN (
        SELECT MIN(id) FROM barbers WHERE code IS NOT NULL GROUP BY code
      );

    UPDATE services
    SET code = NULL
    WHERE code IS NOT NULL
      AND id NOT IN (
        SELECT MIN(id) FROM services WHERE code IS NOT NULL GROUP BY code
      );

    DROP INDEX IF EXISTS idx_barbers_code_unique;
    CREATE UNIQUE INDEX idx_barbers_code_unique
    ON barbers(code);

    DROP INDEX IF EXISTS idx_services_code_unique;
    CREATE UNIQUE INDEX idx_services_code_unique
    ON services(code);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique
    ON users(phone);
  `);
}

function syncBusinessCatalog() {
  const upsertBarber = db.prepare(
    `INSERT INTO barbers (code, name, specialty, active)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(code) DO UPDATE SET
       name = excluded.name,
       specialty = excluded.specialty,
       active = 1`
  );
  const upsertService = db.prepare(
    `INSERT INTO services (code, name, duration_minutes, price_clp, category, tne_eligible, only_bruno, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(code) DO UPDATE SET
       name = excluded.name,
       duration_minutes = excluded.duration_minutes,
       price_clp = excluded.price_clp,
       category = excluded.category,
       tne_eligible = excluded.tne_eligible,
       only_bruno = excluded.only_bruno,
       active = 1`
  );

  db.prepare("UPDATE barbers SET active = 0").run();
  db.prepare("UPDATE services SET active = 0").run();

  for (const barber of BARBERS_CATALOG) {
    upsertBarber.run(barber.code, barber.name, barber.specialty);
  }

  for (const service of SERVICES_CATALOG) {
    upsertService.run(
      service.code,
      service.name,
      service.duration,
      service.price,
      service.category,
      service.tneEligible ? 1 : 0,
      service.onlyBruno ? 1 : 0
    );
  }

  const bruno = db.prepare("SELECT id FROM barbers WHERE code = 'bruno-herrera'").get();
  const barbers = db.prepare("SELECT id, code FROM barbers WHERE code IS NOT NULL AND active = 1").all();
  const services = db.prepare("SELECT id, code, only_bruno FROM services WHERE active = 1").all();

  db.prepare("DELETE FROM service_barbers").run();
  const insertMapping = db.prepare("INSERT OR IGNORE INTO service_barbers (service_id, barber_id) VALUES (?, ?)");

  for (const service of services) {
    for (const barber of barbers) {
      const match = service.only_bruno ? barber.code === "bruno-herrera" : barber.code !== "bruno-herrera";
      if (match) {
        insertMapping.run(service.id, barber.id);
      }
    }
  }

  if (!bruno) {
    throw new Error("No se pudo sincronizar el catálogo de barberos");
  }
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      photo_url TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_clp INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'Servicios',
      tne_eligible INTEGER NOT NULL DEFAULT 0,
      only_bruno INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS service_barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      barber_id INTEGER NOT NULL,
      UNIQUE(service_id, barber_id),
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      is_free INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(barber_id, date, slot),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(barber_id) REFERENCES barbers(id),
      FOREIGN KEY(service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(barber_id, date, slot),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    );

    CREATE TABLE IF NOT EXISTS barber_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    );

    CREATE TABLE IF NOT EXISTS barber_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(barber_id, date, slot),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  ensureSchemaMigrations();
  syncBusinessCatalog();

  const coursesCount = db.prepare("SELECT COUNT(*) AS count FROM courses").get().count;
  if (coursesCount === 0) {
    const insert = db.prepare(
      "INSERT INTO courses (title, description, youtube_url, is_free) VALUES (?, ?, ?, 1)"
    );
    insert.run(
      "Curso Gratis: Fundamentos de Corte",
      "Bases tecnicas para comenzar en barberia desde cero.",
      "https://www.youtube.com/watch?v=q0J7A7VxQW4"
    );
    insert.run(
      "Curso Gratis: Fade Paso a Paso",
      "Introduccion practica a degradados con tecnica profesional.",
      "https://www.youtube.com/watch?v=Jjg2-hM8fC0"
    );
    insert.run(
      "Curso Gratis: Diseno de Barba",
      "Perfilado, simetria y acabados para servicio premium.",
      "https://www.youtube.com/watch?v=vf6f9f7m8JU"
    );
  }
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Token invalido" });
  }
}

function barberAuthRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "barber" || !payload.barber_id) {
      return res.status(403).json({ error: "Acceso solo para barberos" });
    }
    req.barberAuth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Token invalido" });
  }
}

function adminRequired(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_KEY) {
    return res.status(403).json({ error: "Acceso admin denegado" });
  }
  return next();
}

function toYouTubeEmbed(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

initDb();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "web")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get("/api/services", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id,
              s.code,
              s.name,
              s.duration_minutes AS duration,
              s.price_clp AS price,
              s.category,
              s.tne_eligible AS tne_eligible,
              s.only_bruno AS only_bruno,
              COALESCE(GROUP_CONCAT(sb.barber_id), '') AS barber_ids
       FROM services s
       LEFT JOIN service_barbers sb ON sb.service_id = s.id
       WHERE s.active = 1
       GROUP BY s.id, s.code, s.name, s.duration_minutes, s.price_clp, s.category, s.tne_eligible, s.only_bruno
       ORDER BY
         CASE s.category
           WHEN 'Servicios' THEN 1
           WHEN 'Brunetti Experiencia' THEN 2
           WHEN 'Servicios Químicos' THEN 3
           ELSE 4
         END,
         s.id`
    )
    .all()
    .map((s) => ({
      ...s,
      tne_eligible: Boolean(s.tne_eligible),
      only_bruno: Boolean(s.only_bruno),
      barber_ids: s.barber_ids
        ? String(s.barber_ids)
            .split(",")
            .map((id) => Number(id))
            .filter(Boolean)
        : [],
    }));
  res.json(rows);
});

app.get("/api/barbers", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, code, name, specialty, photo_url
       FROM barbers
       WHERE code IS NOT NULL AND active = 1
       ORDER BY
         CASE code
           WHEN 'juan-carlos' THEN 1
           WHEN 'andryz' THEN 2
           WHEN 'bruno-herrera' THEN 3
           WHEN 'diego-moya' THEN 4
           WHEN 'thinn-sayen-herrera' THEN 5
           WHEN 'vicente-pietrapiana' THEN 6
           WHEN 'rodrigo-godoy' THEN 7
           ELSE 99
         END`
    )
    .all();
  res.json(rows);
});

app.get("/api/business-info", (_req, res) => {
  res.json({
    location: "Monumento 1750 Local C, Maipú",
    tne_rule: "TNE aplica 20% de descuento a servicios no-Bruno.",
  });
});

app.get("/api/courses", (_req, res) => {
  const rows = db
    .prepare("SELECT id, title, description, youtube_url, is_free FROM courses WHERE is_free = 1 ORDER BY id")
    .all()
    .map((c) => ({ ...c, embed_url: toYouTubeEmbed(c.youtube_url) }));
  res.json(rows);
});

app.get("/api/availability", (req, res) => {
  const barberId = Number(req.query.barberId);
  const date = String(req.query.date || "");

  if (!barberId || !date) {
    return res.status(400).json({ error: "barberId y date son requeridos" });
  }

  const configuredRows = db
    .prepare("SELECT slot, is_available FROM barber_availability WHERE barber_id = ? AND date = ?")
    .all(barberId, date);

  const configuredAvailable = new Set(
    configuredRows.filter((r) => Number(r.is_available) === 1).map((r) => String(r.slot))
  );

  const bookedRows = db
    .prepare("SELECT slot FROM bookings WHERE barber_id = ? AND date = ? AND status = 'confirmed'")
    .all(barberId, date)
    .map((r) => r.slot);

  const blockedRows = db
    .prepare("SELECT slot FROM blocked_slots WHERE barber_id = ? AND date = ?")
    .all(barberId, date)
    .map((r) => r.slot);

  const unavailable = new Set([...bookedRows, ...blockedRows]);
  const slots = BASE_SLOTS.map((slot) => ({
    slot,
    available: configuredAvailable.has(slot) && !unavailable.has(slot),
    configured: configuredAvailable.has(slot),
  }));

  return res.json({ date, barberId, slots });
});

app.post("/api/auth/access", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phoneInput = formatPhoneCl(req.body.phone || "");

  if (!name || !email || !phoneInput) {
    return res.status(400).json({ error: "name, email y phone son requeridos" });
  }
  if (!isValidPhoneCl(phoneInput)) {
    return res.status(400).json({ error: "Celular inválido. Usa formato +569 9999 9999" });
  }

  const existing = db.prepare("SELECT id, name, email, phone FROM users WHERE phone = ?").get(phoneInput);
  if (!existing) {
    const pseudoHash = bcrypt.hashSync(`client:${phoneInput}`, 10);
    const info = db
      .prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)")
      .run(name, email, phoneInput, pseudoHash);
    const user = { id: info.lastInsertRowid, name, email, phone: phoneInput, role: "client" };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user, mode: "created" });
  }

  db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, existing.id);
  const user = { id: existing.id, name, email, phone: phoneInput, role: "client" };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user, mode: "updated" });
});

app.post("/api/admin/barber-accounts", adminRequired, (req, res) => {
  const barberId = Number(req.body.barberId);
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const photoDataUrl = req.body.photoDataUrl ? String(req.body.photoDataUrl) : "";

  if (!barberId || !username || !password) {
    return res.status(400).json({ error: "barberId, username y password son requeridos" });
  }

  const barber = db.prepare("SELECT id, name FROM barbers WHERE id = ? AND active = 1").get(barberId);
  if (!barber) {
    return res.status(404).json({ error: "Barbero no encontrado" });
  }

  const hash = bcrypt.hashSync(password, 10);
  let photoPath = null;
  if (photoDataUrl) {
    try {
      photoPath = saveBarberPhotoDataUrl(photoDataUrl, barber.name);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  db.prepare(
    `INSERT INTO barber_accounts (barber_id, username, password_hash, active)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(barber_id) DO UPDATE SET
       username = excluded.username,
       password_hash = excluded.password_hash,
       active = 1`
  ).run(barberId, username, hash);
  if (photoPath) {
    db.prepare("UPDATE barbers SET photo_url = ? WHERE id = ?").run(photoPath, barberId);
  }

  return res.status(201).json({ ok: true, barber: { id: barber.id, name: barber.name }, username });
});

app.post("/api/admin/barbers", adminRequired, (req, res) => {
  const name = String(req.body.name || "").trim();
  const specialty = String(req.body.specialty || "").trim();
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const photoDataUrl = req.body.photoDataUrl ? String(req.body.photoDataUrl) : "";

  if (!name || !specialty || !username || !password) {
    return res.status(400).json({ error: "name, specialty, username y password son requeridos" });
  }

  const baseCode = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const finalCode = `${baseCode || "barber"}-${Date.now().toString().slice(-6)}`;

  let photoPath = null;
  if (photoDataUrl) {
    try {
      photoPath = saveBarberPhotoDataUrl(photoDataUrl, finalCode);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  const tx = db.transaction(() => {
    const barberInfo = db
      .prepare("INSERT INTO barbers (code, name, specialty, active, photo_url) VALUES (?, ?, ?, 1, ?)")
      .run(finalCode, name, specialty, photoPath || null);
    const barberId = Number(barberInfo.lastInsertRowid);
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO barber_accounts (barber_id, username, password_hash, active) VALUES (?, ?, ?, 1)"
    ).run(barberId, username, hash);

    const services = db.prepare("SELECT id, only_bruno FROM services WHERE active = 1").all();
    const insertMap = db.prepare("INSERT OR IGNORE INTO service_barbers (service_id, barber_id) VALUES (?, ?)");
    for (const s of services) {
      if (!Number(s.only_bruno)) {
        insertMap.run(s.id, barberId);
      }
    }

    return barberId;
  });

  try {
    const barberId = tx();
    return res.status(201).json({ ok: true, barber: { id: barberId, name, specialty, code: finalCode }, username });
  } catch (error) {
    return res.status(400).json({ error: "No se pudo crear el barbero. Verifica que el usuario no exista." });
  }
});

app.post("/api/barber-auth/login", (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!username || !password) {
    return res.status(400).json({ error: "username y password son requeridos" });
  }

  const account = db
    .prepare(
      `SELECT ba.id, ba.username, ba.password_hash, ba.active,
              b.id AS barber_id, b.name AS barber_name, b.active AS barber_active
       FROM barber_accounts ba
       JOIN barbers b ON b.id = ba.barber_id
       WHERE ba.username = ?`
    )
    .get(username);

  if (!account || !account.active || !account.barber_active) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const ok = bcrypt.compareSync(password, account.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const payload = {
    role: "barber",
    barber_id: account.barber_id,
    barber_name: account.barber_name,
    username: account.username,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, barber: payload });
});

app.get("/api/barber-availability/me", barberAuthRequired, (req, res) => {
  const date = String(req.query.date || "");
  if (!date) {
    return res.status(400).json({ error: "date es requerido" });
  }

  const rows = db
    .prepare(
      "SELECT slot FROM barber_availability WHERE barber_id = ? AND date = ? AND is_available = 1 ORDER BY slot"
    )
    .all(req.barberAuth.barber_id, date)
    .map((r) => r.slot);

  return res.json({ barberId: req.barberAuth.barber_id, date, slots: rows });
});

app.post("/api/barber-availability/me", barberAuthRequired, (req, res) => {
  const date = String(req.body.date || "");
  const slots = Array.isArray(req.body.slots) ? req.body.slots.map((s) => String(s)) : [];

  if (!date) {
    return res.status(400).json({ error: "date es requerido" });
  }
  if (!slots.length) {
    return res.status(400).json({ error: "Debes seleccionar al menos un bloque" });
  }
  if (slots.some((slot) => !BASE_SLOTS.includes(slot))) {
    return res.status(400).json({ error: "Bloques inválidos" });
  }

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM barber_availability WHERE barber_id = ? AND date = ?").run(req.barberAuth.barber_id, date);
    const insert = db.prepare(
      "INSERT INTO barber_availability (barber_id, date, slot, is_available) VALUES (?, ?, ?, 1)"
    );
    for (const slot of new Set(slots)) {
      insert.run(req.barberAuth.barber_id, date, slot);
    }
  });
  tx();

  return res.json({ ok: true, barberId: req.barberAuth.barber_id, date, slots: [...new Set(slots)] });
});

app.get("/api/bookings/me", authRequired, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.id, b.date, b.slot, b.status,
              br.name AS barber_name,
              s.name AS service_name,
              s.price_clp AS service_price,
              s.duration_minutes AS service_duration
       FROM bookings b
       JOIN barbers br ON br.id = b.barber_id
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = ?
       ORDER BY b.date DESC, b.slot DESC`
    )
    .all(req.user.id);

  return res.json(rows);
});

app.get("/api/bookings/by-user", adminRequired, (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "email es requerido" });
  }

  const user = db.prepare("SELECT id, name, email FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const rows = db
    .prepare(
      `SELECT b.id, b.date, b.slot, b.status,
              br.name AS barber_name,
              s.name AS service_name,
              s.price_clp AS service_price,
              s.duration_minutes AS service_duration
       FROM bookings b
       JOIN barbers br ON br.id = b.barber_id
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = ?
       ORDER BY b.date, b.slot`
    )
    .all(user.id);

  return res.json({ user, bookings: rows });
});

app.post("/api/bookings", authRequired, (req, res) => {
  if (req.user.role && req.user.role !== "client") {
    return res.status(403).json({ error: "Solo clientes pueden agendar reservas" });
  }

  const barberId = Number(req.body.barberId);
  const serviceId = Number(req.body.serviceId);
  const date = String(req.body.date || "");
  const slot = String(req.body.slot || "");

  if (!barberId || !serviceId || !date || !slot) {
    return res.status(400).json({ error: "barberId, serviceId, date y slot son requeridos" });
  }

  if (!BASE_SLOTS.includes(slot)) {
    return res.status(400).json({ error: "Bloque horario invalido" });
  }

  const mapping = db
    .prepare("SELECT id FROM service_barbers WHERE service_id = ? AND barber_id = ?")
    .get(serviceId, barberId);
  if (!mapping) {
    return res.status(400).json({ error: "El servicio seleccionado no está disponible para ese barbero" });
  }

  const availability = db
    .prepare("SELECT id FROM barber_availability WHERE barber_id = ? AND date = ? AND slot = ? AND is_available = 1")
    .get(barberId, date, slot);
  if (!availability) {
    return res.status(409).json({ error: "El barbero no tiene disponible ese bloque" });
  }

  const blocked = db
    .prepare("SELECT id FROM blocked_slots WHERE barber_id = ? AND date = ? AND slot = ?")
    .get(barberId, date, slot);
  if (blocked) {
    return res.status(409).json({ error: "Bloque no disponible" });
  }

  const exists = db
    .prepare("SELECT id FROM bookings WHERE barber_id = ? AND date = ? AND slot = ? AND status = 'confirmed'")
    .get(barberId, date, slot);

  if (exists) {
    return res.status(409).json({ error: "Bloque ya reservado" });
  }

  const info = db
    .prepare(
      "INSERT INTO bookings (user_id, barber_id, service_id, date, slot, status) VALUES (?, ?, ?, ?, ?, 'confirmed')"
    )
    .run(req.user.id, barberId, serviceId, date, slot);

  return res.status(201).json({ id: info.lastInsertRowid, ok: true });
});

app.get("/api/blocked-slots", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT bs.id, bs.date, bs.slot, bs.reason,
              b.id AS barber_id, b.name AS barber_name
       FROM blocked_slots bs
       JOIN barbers b ON b.id = bs.barber_id
       ORDER BY bs.date, bs.slot`
    )
    .all();
  res.json(rows);
});

app.post("/api/blocked-slots", adminRequired, (req, res) => {
  const barberId = Number(req.body.barberId);
  const date = String(req.body.date || "");
  const slot = String(req.body.slot || "");
  const reason = String(req.body.reason || "").trim();

  if (!barberId || !date || !slot) {
    return res.status(400).json({ error: "barberId, date y slot son requeridos" });
  }

  if (!BASE_SLOTS.includes(slot)) {
    return res.status(400).json({ error: "Bloque horario invalido" });
  }

  try {
    const info = db
      .prepare("INSERT INTO blocked_slots (barber_id, date, slot, reason) VALUES (?, ?, ?, ?)")
      .run(barberId, date, slot, reason || null);
    return res.status(201).json({ id: info.lastInsertRowid, ok: true });
  } catch {
    return res.status(409).json({ error: "Ese bloque ya esta bloqueado" });
  }
});

app.post("/api/newsletter", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "email es requerido" });
  }

  try {
    db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email);
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true, duplicate: true });
  }
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !phone || !message) {
    return res.status(400).json({ error: "name, phone y message son requeridos" });
  }

  db.prepare("INSERT INTO contact_messages (name, phone, message) VALUES (?, ?, ?)").run(name, phone, message);
  return res.status(201).json({ ok: true });
});

app.get("/api/client-profile/me", authRequired, (req, res) => {
  const row = db
    .prepare(
      `SELECT COALESCE(cp.phone, u.phone) AS phone, cp.note, cp.created_at, cp.updated_at
       FROM users u
       LEFT JOIN client_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`
    )
    .get(req.user.id);
  return res.json(row || null);
});

app.post("/api/client-profile/me", authRequired, (req, res) => {
  const phone = formatPhoneCl(req.body.phone || "");
  const note = String(req.body.note || "").trim();

  if (!phone) {
    return res.status(400).json({ error: "phone es requerido" });
  }
  if (!isValidPhoneCl(phone)) {
    return res.status(400).json({ error: "Celular inválido. Usa formato +569 9999 9999" });
  }

  db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone, req.user.id);

  const exists = db.prepare("SELECT id FROM client_profiles WHERE user_id = ?").get(req.user.id);
  if (!exists) {
    const info = db
      .prepare("INSERT INTO client_profiles (user_id, phone, note) VALUES (?, ?, ?)")
      .run(req.user.id, phone, note || null);
    return res.status(201).json({ id: info.lastInsertRowid, ok: true, mode: "created" });
  }

  db.prepare("UPDATE client_profiles SET phone = ?, note = ?, updated_at = datetime('now') WHERE user_id = ?").run(
    phone,
    note || null,
    req.user.id
  );
  return res.json({ ok: true, mode: "updated" });
});

app.get("/api/clients", adminRequired, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.created_at,
              COALESCE(cp.phone, u.phone) AS phone, cp.note,
              COUNT(b.id) AS bookings_count
       FROM users u
       LEFT JOIN client_profiles cp ON cp.user_id = u.id
       LEFT JOIN bookings b ON b.user_id = u.id
       GROUP BY u.id, u.name, u.email, u.created_at, cp.phone, cp.note
       ORDER BY u.created_at DESC`
    )
    .all();

  return res.json(rows);
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "web", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ELIJA backend activo en http://localhost:${PORT}`);
  });
}

module.exports = app;
