const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const WEB_ROOT = path.join(__dirname, "web");

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

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
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
