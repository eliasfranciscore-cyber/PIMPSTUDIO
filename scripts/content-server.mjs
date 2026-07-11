// =============================================================================
// Servidor de guardado del EDITOR DE TEXTOS (solo local, solo desarrollo).
// -----------------------------------------------------------------------------
// Recibe cambios desde el modo "Editar" del navegador y los escribe a los JSON
// de src/data/content/. Cero dependencias: solo node:http / node:fs.
//
// Se lanza automáticamente con `npm run edit`. Escucha en http://localhost:4100.
// =============================================================================

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

// Puerto distinto al de otros proyectos con el mismo editor (p. ej. 4100) para
// poder correr varios a la vez sin choques de puerto.
const PORT = 4101;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "src", "data", "content");

// Solo nombres de archivo simples: evita path traversal (../, rutas absolutas…).
const SAFE_FILE = /^[a-z0-9-]+$/;

// Cabeceras CORS: el navegador sirve la web desde :5173 (Vite) y guarda contra :4100.
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

// Cola de escritura por archivo: dos guardados casi simultáneos al MISMO json
// hacían read→modify→write en paralelo, pisándose entre sí y a veces
// corrompiendo el archivo. Encolar por ruta de archivo serializa esas
// escrituras sin frenar guardados de archivos distintos.
const fileQueues = new Map();
function withFileLock(filePath, task) {
  const run = (fileQueues.get(filePath) || Promise.resolve()).then(task, task);
  fileQueues.set(filePath, run.catch(() => {}));
  return run;
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  // Sonda de disponibilidad usada por el botón "Editar".
  if (req.method === "GET" && req.url === "/ping") {
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && req.url === "/save") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      try {
        const { file, path, value } = JSON.parse(raw || "{}");
        if (!file || !SAFE_FILE.test(file)) throw new Error("file inválido");
        if (typeof value !== "string") throw new Error("value debe ser texto");

        const filePath = join(CONTENT_DIR, `${file}.json`);
        if (!existsSync(filePath)) throw new Error(`no existe ${file}.json`);

        await withFileLock(filePath, async () => {
          const data = JSON.parse(await readFile(filePath, "utf8"));
          setDeep(data, path, value);
          await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
        });

        console.log(`  ✓ ${file}.json  ·  ${path}`);
        json(res, 200, { ok: true });
      } catch (err) {
        console.error(`  ✗ guardado falló: ${err.message}`);
        json(res, 400, { ok: false, error: err.message });
      }
    });
    return;
  }

  json(res, 404, { ok: false, error: "not found" });
});

server.listen(PORT, () => {
  console.log(`\n  📝 Editor de textos escuchando en http://localhost:${PORT}`);
  console.log(`     Guardando en ${CONTENT_DIR}\n`);
});
