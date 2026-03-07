require("dotenv").config();

const http = require("http");
const { MongoClient } = require("mongodb");

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const mongoUri = process.env.MONGODB_URI || "";
const mongoDbName = process.env.MONGODB_DB || "littlewondersgifts";
const servicesCollectionName = process.env.SERVICES_COLLECTION || "services";

const defaultServices = [
  {
    slug: "ceramic-figures",
    icon: "palette",
    title: "Керамични фигури по поръчка",
    desc: "Ръчно рисувани керамични фигурки с любим герой, животинче или дизайн по ваш избор. Всяка фигура е уникат.",
    cta: "Научи повече",
    order: 1,
    isActive: true,
  },
  {
    slug: "pacifier-clips",
    icon: "baby",
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
    order: 2,
    isActive: true,
  },
];

let mongoClient = null;
const mongoState = {
  connected: false,
  message: mongoUri ? "Connecting..." : "MONGODB_URI is not configured",
  lastCheckedAt: null,
};

function normalizeBasePath(path) {
  if (!path) {
    return "";
  }

  let normalized = path.trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/+$/, "");
  return normalized === "/" ? "" : normalized;
}

const configuredBasePath = normalizeBasePath(process.env.BASE_PATH || "");

function resolveRoute(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const candidates = [];

  if (configuredBasePath) {
    candidates.push(configuredBasePath);
  }

  if (!candidates.includes("/backend")) {
    candidates.push("/backend");
  }

  for (const basePath of candidates) {
    if (
      normalizedPath === basePath ||
      normalizedPath.startsWith(`${basePath}/`)
    ) {
      return {
        routePath: normalizedPath.slice(basePath.length) || "/",
        publicBasePath: basePath,
      };
    }
  }

  return {
    routePath: normalizedPath,
    publicBasePath: configuredBasePath,
  };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getMongoDb() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
  }

  await mongoClient.connect();
  return mongoClient.db(mongoDbName);
}

async function ensureServicesSeed(db) {
  const collection = db.collection(servicesCollectionName);
  const existing = await collection.countDocuments();

  if (existing > 0) {
    return;
  }

  const now = new Date().toISOString();
  const docs = defaultServices.map((service) => ({
    ...service,
    createdAt: now,
    updatedAt: now,
  }));

  await collection.insertMany(docs);
}

async function fetchActiveServices(db) {
  const collection = db.collection(servicesCollectionName);
  const services = await collection
    .find({ isActive: { $ne: false } }, { projection: { _id: 0 } })
    .sort({ order: 1, title: 1 })
    .toArray();

  return services;
}

async function fetchActiveServiceBySlug(db, slug) {
  const collection = db.collection(servicesCollectionName);
  return collection.findOne(
    { slug, isActive: { $ne: false } },
    { projection: { _id: 0 } },
  );
}

async function refreshMongoState() {
  mongoState.lastCheckedAt = new Date().toISOString();

  if (!mongoUri) {
    mongoState.connected = false;
    mongoState.message = "MONGODB_URI is not configured";
    return;
  }

  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
    await ensureServicesSeed(db);

    mongoState.connected = true;
    mongoState.message = "Connected";
  } catch (error) {
    mongoState.connected = false;
    mongoState.message =
      error instanceof Error ? error.message : "Unknown MongoDB error";

    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch {
        // Ignore close errors and recreate the client on next check.
      }
      mongoClient = null;
    }
  }
}

refreshMongoState().catch(() => {
  mongoState.connected = false;
  mongoState.message = "Initial MongoDB check failed";
});

setInterval(() => {
  refreshMongoState().catch(() => {
    mongoState.connected = false;
    mongoState.message = "Periodic MongoDB check failed";
  });
}, 60_000).unref();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const { routePath, publicBasePath } = resolveRoute(url.pathname);

  if (routePath === "/") {
    const now = new Date().toISOString();
    const healthHref = `${publicBasePath}/health`;
    const mongoStatusLabel = mongoState.connected
      ? "MongoDB Atlas: Connected"
      : "MongoDB Atlas: Not connected";
    const mongoStatusClass = mongoState.connected ? "ok" : "warn";
    const mongoMessage = escapeHtml(mongoState.message);
    const mongoCheckedAt = escapeHtml(
      mongoState.lastCheckedAt || "not checked yet",
    );
    const html = `<!doctype html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Little Wonders Backend</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      width: min(560px, 100%);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    h1 { margin: 0 0 10px; font-size: 1.4rem; }
    p { margin: 0 0 12px; line-height: 1.5; }
    code {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 2px 8px;
      font-size: 0.92rem;
    }
    .ok {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      border-radius: 999px;
      padding: 6px 10px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .warn {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border-radius: 999px;
      padding: 6px 10px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="ok">Connected</div>
    <h1>Node.js backend is running</h1>
    <p>Backend status: <strong>OK</strong></p>
    <p>Current server time: <code>${now}</code></p>
    <p><span class="${mongoStatusClass}">${mongoStatusLabel}</span></p>
    <p>Mongo message: <code>${mongoMessage}</code></p>
    <p>Mongo last check: <code>${mongoCheckedAt}</code></p>
    <p>Health endpoint: <a href="${healthHref}">${healthHref}</a></p>
  </main>
</body>
</html>`;

    sendHtml(res, 200, html);
    return;
  }

  if (routePath === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "little-wonders-backend",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      mongoConnected: mongoState.connected,
      mongoMessage: mongoState.message,
      mongoLastCheckedAt: mongoState.lastCheckedAt,
    });
    return;
  }

  if (routePath === "/services") {
    try {
      const db = await getMongoDb();
      await ensureServicesSeed(db);
      const services = await fetchActiveServices(db);

      sendJson(res, 200, {
        status: "ok",
        source: "mongodb",
        count: services.length,
        services,
      });
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown MongoDB error";
      sendJson(res, 500, {
        status: "error",
        source: "fallback",
        message,
        count: defaultServices.length,
        services: defaultServices,
      });
      return;
    }
  }

  if (routePath.startsWith("/services/")) {
    const slug = decodeURIComponent(routePath.slice("/services/".length));

    if (!slug) {
      sendJson(res, 400, {
        status: "error",
        message: "Service slug is required",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const service = await fetchActiveServiceBySlug(db, slug);

      if (!service) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Service not found",
        });
        return;
      }

      sendJson(res, 200, {
        status: "ok",
        source: "mongodb",
        service,
      });
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown MongoDB error";
      sendJson(res, 500, {
        status: "error",
        message,
      });
      return;
    }
  }

  sendJson(res, 404, {
    status: "not_found",
    message: "Route not found",
  });
});

server.listen(port, host, () => {
  // cPanel injects PORT, so this works both locally and in production.
  console.log(`Backend listening on http://${host}:${port}`);
});
