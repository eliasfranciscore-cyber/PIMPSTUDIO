const { put } = require("@vercel/blob");

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function putClientRecord(pathname, body) {
  const commonOptions = {
    addRandomSuffix: true,
    contentType: "application/json; charset=utf-8",
  };

  try {
    return await put(pathname, body, {
      ...commonOptions,
      access: "private",
    });
  } catch (privateError) {
    const detail = String(
      privateError && privateError.message ? privateError.message : privateError
    );

    if (!/must be "public"/i.test(detail)) {
      throw privateError;
    }

    return put(pathname, body, {
      ...commonOptions,
      access: "public",
    });
  }
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
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

    const record = {
      name,
      email,
      phone,
      source: "pimpstudio-web",
      updatedAt: new Date().toISOString(),
    };

    const pathname = `clientes/${phone}-${Date.now()}.json`;

    const blob = await putClientRecord(
      pathname,
      JSON.stringify(record, null, 2)
    );

    sendJson(res, 200, {
      ok: true,
      saved: true,
      pathname: blob.pathname,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Failed to save client",
      detail: String(error && error.message ? error.message : error),
    });
  }
};
