const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const WEB_ROOT = path.join(__dirname, "web");
const LOCAL_CLIENTS_FILE = path.join(__dirname, "data", "registered-clients-local.json");

const ROUTE_FILES = {
  "/": "index.html",
  "/login": "login.html",
  "/booking": "booking.html",
  "/dashboard": "dashboard.html",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function normalizePath(urlPath) {
  const decoded = decodeURIComponent(String(urlPath || "/").split("?")[0]);
  const noHash = decoded.split("#")[0];
  if (noHash === "/") return "/";
  return noHash.replace(/\/+$/, "");
}

function resolveWebPath(urlPath) {
  const normalized = normalizePath(urlPath);

  if (ROUTE_FILES[normalized]) {
    return path.join(WEB_ROOT, ROUTE_FILES[normalized]);
  }

  const cleanPath = normalized.replace(/^\/+/, "");
  if (!cleanPath) {
    return path.join(WEB_ROOT, ROUTE_FILES["/"]);
  }

  const fullPath = path.normalize(path.join(WEB_ROOT, cleanPath));
  if (!fullPath.startsWith(WEB_ROOT)) {
    return null;
  }

  return fullPath;
}

function serveFile(filePath, req, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": type });
    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(data);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleLocalRegisterClient(req, res) {
  if (req.method === "GET") {
    try {
      const raw = fs.existsSync(LOCAL_CLIENTS_FILE)
        ? fs.readFileSync(LOCAL_CLIENTS_FILE, "utf8")
        : "{}";
      const byPhone = JSON.parse(raw || "{}");
      const clients = Object.values(byPhone);
      sendJson(res, 200, { ok: true, count: clients.length, clients });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: "Failed to read local clients" });
    }
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (!name || !email || phone.length < 8) {
      sendJson(res, 400, { ok: false, error: "Invalid payload" });
      return;
    }

    const byPhone = fs.existsSync(LOCAL_CLIENTS_FILE)
      ? JSON.parse(fs.readFileSync(LOCAL_CLIENTS_FILE, "utf8") || "{}")
      : {};

    byPhone[phone] = {
      name,
      email,
      phone,
      source: "local-dev-server",
      updatedAt: new Date().toISOString(),
    };

    fs.mkdirSync(path.dirname(LOCAL_CLIENTS_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_CLIENTS_FILE, JSON.stringify(byPhone, null, 2), "utf8");

    sendJson(res, 200, { ok: true, saved: true, phone });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Failed to save local client",
      detail: String(error && error.message ? error.message : error),
    });
  }
}

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
  const normalizedPath = normalizePath(req.url || "/");

  if (normalizedPath === "/api/register-client") {
    handleLocalRegisterClient(req, res);
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const resolved = resolveWebPath(req.url || "/");
  if (!resolved) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  fs.stat(resolved, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(resolved, req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`PIMP STUDIO local: http://localhost:${PORT}`);
  });
}

module.exports = server;
