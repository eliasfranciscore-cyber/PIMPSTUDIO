// =============================================================================
// Servidor de guardado del EDITOR VISUAL (solo local, solo desarrollo).
// -----------------------------------------------------------------------------
// Recibe cambios desde el modo "Editar" del navegador. Maneja tres cosas:
//   1. TEXTO      → escribe strings a los JSON de src/data/content/ (POST /save)
//   2. OVERRIDES  → posición/tamaño/fuente/src de cada elemento, keyed por editId,
//                   a los JSON de src/data/overrides/       (POST /save-override)
//   3. IMÁGENES   → sube archivos a public/assets/uploads/   (POST /upload-image)
//                   y lista los assets existentes            (GET  /list-assets)
//
// Cero dependencias: solo node:http / node:fs. Se lanza con `npm run edit`.
// Escucha en http://localhost:4101.
// =============================================================================

import { createServer } from "node:http";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, extname, basename } from "node:path";

const PORT = 4101;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "src", "data", "content");
const OVERRIDES_DIR = join(ROOT, "src", "data", "overrides");
const ASSETS_DIR = join(ROOT, "public", "assets");
const UPLOADS_DIR = join(ASSETS_DIR, "uploads");

// Solo nombres de archivo simples: evita path traversal (../, rutas absolutas…).
const SAFE_FILE = /^[a-z0-9-]+$/;
// Extensiones de imagen permitidas para subida.
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"]);
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Asigna `value` en `obj` siguiendo `path` ("pillars.0.body"). */
function setDeep(obj, path, value) {
  const keys = String(path).split(".").filter(Boolean);
  if (!keys.length) throw new Error("path vacío");
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (node[key] == null || typeof node[key] !== "object") {
      throw new Error(`ruta inexistente en '${key}'`);
    }
    node = node[key];
  }
  const last = keys[keys.length - 1];
  if (!(last in node)) throw new Error(`clave inexistente: '${last}'`);
  node[last] = value;
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(body));
}

/** Lee el cuerpo de la petición como texto (con tope de tamaño). */
function readBody(req, maxBytes = MAX_UPLOAD_BYTES + 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let bytes = 0;
    req.on("data", (c) => {
      bytes += c.length;
      if (bytes > maxBytes) {
        reject(new Error("cuerpo demasiado grande"));
        req.destroy();
        return;
      }
      raw += c;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

// Cola de escritura por archivo: serializa read→modify→write al MISMO json
// para no pisarse entre guardados concurrentes.
const fileQueues = new Map();
function withFileLock(filePath, task) {
  const run = (fileQueues.get(filePath) || Promise.resolve()).then(task, task);
  fileQueues.set(filePath, run.catch(() => {}));
  return run;
}

/** editId = "<file>:<rest>". Devuelve el nombre de archivo validado. */
function fileFromEditId(editId) {
  const file = String(editId).split(":")[0];
  if (!file || !SAFE_FILE.test(file)) throw new Error("editId inválido");
  return file;
}

/** Fusiona `patch` en la entrada `editId`; claves con valor null se borran. */
function mergeOverride(data, editId, patch) {
  const entry = { ...(data[editId] || {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined) delete entry[k];
    else entry[k] = v;
  }
  if (Object.keys(entry).length === 0) delete data[editId];
  else data[editId] = entry;
}

// --- Endpoints -------------------------------------------------------------

async function handleSave(req, res) {
  try {
    const { file, path, value } = JSON.parse((await readBody(req)) || "{}");
    if (!file || !SAFE_FILE.test(file)) throw new Error("file inválido");
    if (typeof value !== "string") throw new Error("value debe ser texto");

    const filePath = join(CONTENT_DIR, `${file}.json`);
    if (!existsSync(filePath)) throw new Error(`no existe ${file}.json`);

    await withFileLock(filePath, async () => {
      const data = JSON.parse(await readFile(filePath, "utf8"));
      setDeep(data, path, value);
      await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
    });

    console.log(`  ✓ texto  ${file}.json · ${path}`);
    json(res, 200, { ok: true });
  } catch (err) {
    console.error(`  ✗ /save falló: ${err.message}`);
    json(res, 400, { ok: false, error: err.message });
  }
}

async function handleSaveOverride(req, res) {
  try {
    const { editId, patch } = JSON.parse((await readBody(req)) || "{}");
    if (!editId || typeof editId !== "string") throw new Error("editId requerido");
    if (!patch || typeof patch !== "object") throw new Error("patch debe ser objeto");

    const file = fileFromEditId(editId);
    const filePath = join(OVERRIDES_DIR, `${file}.json`);

    await mkdir(OVERRIDES_DIR, { recursive: true });
    await withFileLock(filePath, async () => {
      const data = existsSync(filePath)
        ? JSON.parse(await readFile(filePath, "utf8"))
        : {};
      mergeOverride(data, editId, patch);
      await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
    });

    console.log(`  ✓ override  ${file}.json · ${editId} · ${Object.keys(patch).join(",")}`);
    json(res, 200, { ok: true });
  } catch (err) {
    console.error(`  ✗ /save-override falló: ${err.message}`);
    json(res, 400, { ok: false, error: err.message });
  }
}

async function handleUploadImage(req, res) {
  try {
    const { name, dataBase64 } = JSON.parse((await readBody(req)) || "{}");
    if (!name || typeof name !== "string") throw new Error("name requerido");
    if (!dataBase64 || typeof dataBase64 !== "string") throw new Error("dataBase64 requerido");

    const ext = extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) throw new Error(`extensión no permitida: ${ext || "(ninguna)"}`);

    // Acepta data URL ("data:image/…;base64,XXXX") o base64 crudo.
    const b64 = dataBase64.includes(",") ? dataBase64.split(",").pop() : dataBase64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length === 0) throw new Error("imagen vacía");
    if (buf.length > MAX_UPLOAD_BYTES) throw new Error("imagen supera 12 MB");

    // Nombre seguro: slug del nombre base + timestamp para evitar colisiones.
    const stem = basename(name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "img";
    const safeName = `${stem}-${Date.now().toString(36)}${ext}`;

    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(join(UPLOADS_DIR, safeName), buf);

    const url = `/assets/uploads/${safeName}`;
    console.log(`  ✓ imagen subida  ${url}  (${(buf.length / 1024).toFixed(0)} KB)`);
    json(res, 200, { ok: true, url });
  } catch (err) {
    console.error(`  ✗ /upload-image falló: ${err.message}`);
    json(res, 400, { ok: false, error: err.message });
  }
}

async function handleListAssets(res) {
  try {
    const collect = async (dir, prefix) => {
      if (!existsSync(dir)) return [];
      const names = await readdir(dir);
      return names
        .filter((n) => IMAGE_EXT.has(extname(n).toLowerCase()))
        .map((n) => `${prefix}/${n}`);
    };
    const root = await collect(ASSETS_DIR, "/assets");
    const uploads = await collect(UPLOADS_DIR, "/assets/uploads");
    const all = [...root, ...uploads].sort();
    json(res, 200, { ok: true, assets: all });
  } catch (err) {
    json(res, 400, { ok: false, error: err.message });
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/ping") {
    return json(res, 200, { ok: true });
  }
  if (req.method === "GET" && req.url === "/list-assets") {
    return handleListAssets(res);
  }
  if (req.method === "POST" && req.url === "/save") {
    return handleSave(req, res);
  }
  if (req.method === "POST" && req.url === "/save-override") {
    return handleSaveOverride(req, res);
  }
  if (req.method === "POST" && req.url === "/upload-image") {
    return handleUploadImage(req, res);
  }
  json(res, 404, { ok: false, error: "not found" });
});

server.listen(PORT, () => {
  console.log(`\n  📝 Editor visual escuchando en http://localhost:${PORT}`);
  console.log(`     Texto     → ${CONTENT_DIR}`);
  console.log(`     Overrides → ${OVERRIDES_DIR}`);
  console.log(`     Uploads   → ${UPLOADS_DIR}\n`);
});
