require("dotenv").config();

const http = require("http");
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const mongoUri = process.env.MONGODB_URI || "";
const mongoDbName = process.env.MONGODB_DB || "littlewondersgifts";
const servicesCollectionName = process.env.SERVICES_COLLECTION || "services";
const ordersCollectionName = process.env.ORDERS_COLLECTION || "orders";
const usersCollectionName = process.env.USERS_COLLECTION || "users";
const authJwtSecret = process.env.AUTH_JWT_SECRET || "change-me-in-production";
const authJwtExpiresIn = process.env.AUTH_JWT_EXPIRES_IN || "7d";
const notificationEmail =
  process.env.ORDER_NOTIFICATION_EMAIL || "info@littlewondersgifts.com";
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = String(process.env.SMTP_SECURE || "false") === "true";
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "";
const emailTimeoutMs = Number(process.env.EMAIL_TIMEOUT_MS) || 8000;
const sofiaTimeZone = "Europe/Sofia";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const defaultServices = [
  {
    slug: "pacifier-clips",
    icon: "baby",
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
    order: 1,
    isActive: true,
  },
  {
    slug: "photo-frame",
    icon: "image",
    title: "Рамка за снимка",
    desc: "Нежна рамка за снимка с име по желание на бебето. Специален спомен, който остава красив акцент в детската стая.",
    cta: "Поръчай рамка",
    order: 3,
    isActive: true,
  },
  {
    slug: "platform",
    icon: "palette",
    title: "Платформа",
    desc: "Декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Виж варианти",
    order: 4,
    isActive: true,
  },
  {
    slug: "round-platform",
    icon: "circle",
    title: "Кръгла платформа",
    desc: "Кръгла декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Избери модел",
    order: 5,
    isActive: true,
  },
  {
    slug: "blocks",
    icon: "box",
    title: "Кубчета",
    desc: "Декоративни кубчета само с букви за изписване на името на бебето. Идеални за фотосесия, украса или специален повод.",
    cta: "Направи запитване",
    order: 6,
    isActive: true,
  },
];

let mongoClient = null;
let emailTransporter = null;
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const rawBody = Buffer.concat(chunks).toString("utf8").trim();

      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function sanitizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function parseBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return "";
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return "";
  }

  return token.trim();
}

function buildAuthResponse(user, token) {
  return {
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
    },
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      fullName: user.fullName,
    },
    authJwtSecret,
    {
      expiresIn: authJwtExpiresIn,
    },
  );
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

function decodeAuthUserFromRequest(req) {
  const token = parseBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, authJwtSecret);
    const userId =
      typeof payload === "object" && payload && typeof payload.sub === "string"
        ? payload.sub
        : "";
    const email =
      typeof payload === "object" &&
      payload &&
      typeof payload.email === "string"
        ? payload.email
        : "";
    const fullName =
      typeof payload === "object" &&
      payload &&
      typeof payload.fullName === "string"
        ? payload.fullName
        : "";

    if (!userId) {
      return null;
    }

    return {
      userId,
      email,
      fullName,
    };
  } catch {
    return null;
  }
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}

function getSofiaTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: sofiaTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(date);

  const valueByType = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      valueByType[part.type] = part.value;
    }
  }

  const timeZoneName = valueByType.timeZoneName || "EET";
  return `${valueByType.year}-${valueByType.month}-${valueByType.day} ${valueByType.hour}:${valueByType.minute}:${valueByType.second} ${timeZoneName}`;
}

function getEmailTransporter() {
  if (emailTransporter) {
    return emailTransporter;
  }

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFromEmail) {
    return null;
  }

  emailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return emailTransporter;
}

async function sendOrderEmails(order) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      sentAdmin: false,
      sentCustomer: false,
      skipped: true,
      reason: "SMTP is not configured",
    };
  }

  const subjectAdmin = `Нова поръчка: ${order.serviceTitle}`;
  const adminText = [
    "Нова поръчка в littlewondersgifts.com",
    `Поръчка ID: ${order.orderId}`,
    `Услуга: ${order.serviceTitle} (${order.serviceSlug})`,
    `Тип: ${order.selectedAudience || "-"}`,
    `Комбинация: ${order.selectedOptionLabel || "-"}`,
    ...(order.selectedClipLabel
      ? [`Вид щипка: ${order.selectedClipLabel}`]
      : []),
    ...(order.selectedDecorationLabel
      ? [`Елемент: ${order.selectedDecorationLabel}`]
      : []),
    `Име на бебето: ${order.babyName || "-"}`,
    `Клиент: ${order.customerName || "-"}`,
    `Имейл на клиент: ${order.customerEmail || "-"}`,
    `Създадена на: ${order.createdAt}`,
  ].join("\n");

  let sentAdmin = false;
  let sentCustomer = false;
  const reasons = [];

  try {
    await transporter.sendMail({
      from: smtpFromEmail,
      to: notificationEmail,
      subject: subjectAdmin,
      text: adminText,
      replyTo: notificationEmail,
    });
    sentAdmin = true;
  } catch (adminError) {
    reasons.push(
      `Admin email failed: ${adminError instanceof Error ? adminError.message : "Unknown error"}`,
    );
  }

  if (order.customerEmail) {
    const customerText = [
      `Здравей, ${order.customerName || "приятелю"}!`,
      "",
      `Получихме твоята поръчка за ${order.serviceTitle || "персонализиран продукт"}.`,
      `Поръчка ID: ${order.orderId}`,
      `Комбинация: ${order.selectedOptionLabel || "-"}`,
      ...(order.selectedClipLabel
        ? [`Вид щипка: ${order.selectedClipLabel}`]
        : []),
      ...(order.selectedDecorationLabel
        ? [`Елемент: ${order.selectedDecorationLabel}`]
        : []),
      `Име на бебето: ${order.babyName || "-"}`,
      "",
      "Ще се свържем с теб възможно най-скоро.",
      "Little Wonders Gifts",
    ].join("\n");

    try {
      await transporter.sendMail({
        from: smtpFromEmail,
        to: order.customerEmail,
        subject: "Потвърждение за поръчка - Little Wonders Gifts",
        text: customerText,
        replyTo: notificationEmail,
      });
      sentCustomer = true;
    } catch (customerError) {
      reasons.push(
        `Customer email failed: ${customerError instanceof Error ? customerError.message : "Unknown error"}`,
      );
    }
  }

  return {
    sentAdmin,
    sentCustomer,
    skipped: false,
    reason: reasons.length > 0 ? reasons.join(" | ") : undefined,
  };
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
  const now = getSofiaTimestamp();
  const operations = defaultServices.map((service) => ({
    updateOne: {
      filter: { slug: service.slug },
      update: {
        $setOnInsert: {
          ...service,
          createdAt: now,
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }));

  await collection.bulkWrite(operations, { ordered: false });
}

async function fetchActiveServices(db) {
  const collection = db.collection(servicesCollectionName);
  const services = await collection
    .find(
      {
        isActive: { $ne: false },
        slug: { $ne: "ceramic-figures" },
      },
      { projection: { _id: 0 } },
    )
    .sort({ order: 1, title: 1 })
    .toArray();

  return services;
}

async function fetchActiveServiceBySlug(db, slug) {
  if (slug === "ceramic-figures") {
    return null;
  }

  const collection = db.collection(servicesCollectionName);
  return collection.findOne(
    { slug, isActive: { $ne: false } },
    { projection: { _id: 0 } },
  );
}

async function refreshMongoState() {
  mongoState.lastCheckedAt = getSofiaTimestamp();

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
    const now = getSofiaTimestamp();
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
      timestamp: getSofiaTimestamp(),
      timeZone: sofiaTimeZone,
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

  if (routePath === "/orders" && req.method === "POST") {
    let payload = null;

    try {
      payload = await readJsonBody(req);
    } catch {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден JSON във заявката",
      });
      return;
    }

    const serviceSlug = sanitizeText(payload.serviceSlug, 80);
    const serviceTitle = sanitizeText(payload.serviceTitle, 140);
    const selectedAudience = sanitizeText(payload.selectedAudience, 20);
    const selectedOptionId = sanitizeText(payload.selectedOptionId, 80);
    const selectedOptionLabel = sanitizeText(payload.selectedOptionLabel, 160);
    const selectedClipId = sanitizeText(payload.selectedClipId, 40);
    const selectedClipLabel = sanitizeText(payload.selectedClipLabel, 80);
    const selectedDecoration = sanitizeText(payload.selectedDecoration, 40);
    const selectedDecorationLabel = sanitizeText(
      payload.selectedDecorationLabel,
      80,
    );
    const frameBaseStyle = sanitizeText(payload.frameBaseStyle, 40);
    const babyName = sanitizeText(payload.babyName, 60);
    const customerName = sanitizeText(payload.customerName, 80);
    const customerEmailRaw = sanitizeText(
      payload.customerEmail,
      160,
    ).toLowerCase();
    const customerEmail =
      customerEmailRaw && isValidEmail(customerEmailRaw)
        ? customerEmailRaw
        : "";

    if (!serviceSlug || !serviceTitle || !babyName || !selectedOptionId) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсват задължителни данни за поръчката",
      });
      return;
    }

    const createdAt = getSofiaTimestamp();
    const orderId = `LWG-${Date.now()}`;
    const authUser = decodeAuthUserFromRequest(req);
    const resolvedCustomerName = customerName || authUser?.fullName || "";
    const resolvedCustomerEmail = customerEmail || authUser?.email || "";

    const orderDoc = {
      orderId,
      serviceSlug,
      serviceTitle,
      selectedAudience,
      selectedOptionId,
      selectedOptionLabel,
      selectedClipId,
      selectedClipLabel,
      selectedDecoration,
      selectedDecorationLabel,
      frameBaseStyle,
      babyName,
      customerName: resolvedCustomerName,
      customerEmail: resolvedCustomerEmail,
      createdAt,
      status: "new",
      userId: authUser?.userId || null,
      isFromAccount: Boolean(authUser?.userId),
    };

    try {
      const db = await getMongoDb();
      await db.collection(ordersCollectionName).insertOne(orderDoc);

      let emailResult = null;
      try {
        emailResult = await withTimeout(
          sendOrderEmails(orderDoc),
          emailTimeoutMs,
          "Email sending timeout",
        );
      } catch (emailError) {
        emailResult = {
          sentAdmin: false,
          sentCustomer: false,
          skipped: false,
          reason:
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error",
        };
      }

      sendJson(res, 201, {
        status: "ok",
        message: "Поръчката е приета успешно",
        orderId,
        email: emailResult,
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

  if (routePath === "/orders/my" && req.method === "GET") {
    const authUser = decodeAuthUserFromRequest(req);

    if (!authUser?.userId) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужен е вход в профил, за да видите поръчките.",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const orders = await db
        .collection(ordersCollectionName)
        .find({ userId: authUser.userId }, { projection: { _id: 0 } })
        .sort({ createdAt: -1, orderId: -1 })
        .toArray();

      sendJson(res, 200, {
        status: "ok",
        count: orders.length,
        orders,
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

  if (routePath === "/auth/register" && req.method === "POST") {
    let payload = null;

    try {
      payload = await readJsonBody(req);
    } catch {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден JSON във заявката",
      });
      return;
    }

    const fullName = sanitizeText(payload.fullName, 120);
    const email = sanitizeText(payload.email, 160).toLowerCase();
    const password =
      typeof payload.password === "string" ? payload.password : "";

    if (!fullName || !isValidEmail(email) || !isValidPassword(password)) {
      sendJson(res, 400, {
        status: "error",
        message:
          "Невалидни данни. Името е задължително, имейлът трябва да е валиден, а паролата да е поне 6 символа.",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const usersCollection = db.collection(usersCollectionName);
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        sendJson(res, 409, {
          status: "error",
          message: "Вече съществува потребител с този имейл",
        });
        return;
      }

      const createdAt = getSofiaTimestamp();
      const userId = `USR-${Date.now()}`;
      const passwordHash = await bcrypt.hash(password, 12);

      const userDoc = {
        userId,
        fullName,
        email,
        passwordHash,
        createdAt,
        updatedAt: createdAt,
        lastLoginAt: createdAt,
      };

      await usersCollection.insertOne(userDoc);

      const token = signUserToken(userDoc);
      sendJson(res, 201, {
        status: "ok",
        message: "Регистрацията е успешна",
        ...buildAuthResponse(userDoc, token),
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

  if (routePath === "/auth/login" && req.method === "POST") {
    let payload = null;

    try {
      payload = await readJsonBody(req);
    } catch {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден JSON във заявката",
      });
      return;
    }

    const email = sanitizeText(payload.email, 160).toLowerCase();
    const password =
      typeof payload.password === "string" ? payload.password : "";

    if (!isValidEmail(email) || !isValidPassword(password)) {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден имейл или парола",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const usersCollection = db.collection(usersCollectionName);
      const user = await usersCollection.findOne({ email });

      if (!user || !user.passwordHash) {
        sendJson(res, 401, {
          status: "error",
          message: "Невалиден имейл или парола",
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        sendJson(res, 401, {
          status: "error",
          message: "Невалиден имейл или парола",
        });
        return;
      }

      const lastLoginAt = getSofiaTimestamp();
      await usersCollection.updateOne(
        { userId: user.userId },
        {
          $set: {
            lastLoginAt,
            updatedAt: lastLoginAt,
          },
        },
      );

      const userWithUpdatedLogin = {
        ...user,
        lastLoginAt,
      };

      const token = signUserToken(userWithUpdatedLogin);
      sendJson(res, 200, {
        status: "ok",
        message: "Успешен вход",
        ...buildAuthResponse(userWithUpdatedLogin, token),
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

  if (routePath === "/auth/me" && req.method === "GET") {
    const token = parseBearerToken(req);

    if (!token) {
      sendJson(res, 401, {
        status: "error",
        message: "Липсва токен за достъп",
      });
      return;
    }

    try {
      const payload = jwt.verify(token, authJwtSecret);
      const userId =
        typeof payload === "object" &&
        payload &&
        typeof payload.sub === "string"
          ? payload.sub
          : "";

      if (!userId) {
        sendJson(res, 401, {
          status: "error",
          message: "Невалиден токен",
        });
        return;
      }

      const db = await getMongoDb();
      const user = await db
        .collection(usersCollectionName)
        .findOne({ userId }, { projection: { passwordHash: 0, _id: 0 } });

      if (!user) {
        sendJson(res, 404, {
          status: "error",
          message: "Потребителят не е намерен",
        });
        return;
      }

      sendJson(res, 200, {
        status: "ok",
        user,
      });
      return;
    } catch {
      sendJson(res, 401, {
        status: "error",
        message: "Невалиден или изтекъл токен",
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
