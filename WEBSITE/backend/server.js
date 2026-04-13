require("dotenv").config();

const fs = require("fs");
const http = require("http");
const path = require("path");
const { randomUUID } = require("crypto");
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const mongoUri = process.env.MONGODB_URI || "";
const mongoDbName = process.env.MONGODB_DB || "littlewondersgifts";
const servicesCollectionName = process.env.SERVICES_COLLECTION || "services";
const ordersCollectionName = process.env.ORDERS_COLLECTION || "orders";
const usersCollectionName = process.env.USERS_COLLECTION || "users";
const galleryPhotosCollectionName =
  process.env.GALLERY_PHOTOS_COLLECTION || "galleryPhotos";
const authJwtSecret = process.env.AUTH_JWT_SECRET || "change-me-in-production";
const authJwtExpiresIn = process.env.AUTH_JWT_EXPIRES_IN || "7d";
const adminPassword = process.env.ADMIN_PASSWORD || "1bg2bg3bg";
const adminJwtSecret =
  process.env.ADMIN_JWT_SECRET || `${authJwtSecret}-admin`;
const notificationEmail =
  process.env.ORDER_NOTIFICATION_EMAIL || "maria_magdalena2003@abv.bg";
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = String(process.env.SMTP_SECURE || "false") === "true";
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "";
const emailTimeoutMs = Number(process.env.EMAIL_TIMEOUT_MS) || 8000;
const deliveryRequestTimeoutMs =
  Number(process.env.DELIVERY_REQUEST_TIMEOUT_MS) || 8000;
const deliveryOfficesCacheTtlMs =
  Number(process.env.DELIVERY_OFFICES_CACHE_TTL_MS) || 6 * 60 * 60 * 1000;
const econtOfficesEndpoint =
  process.env.ECONT_OFFICES_ENDPOINT ||
  "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json";
const speedyOfficesMapEndpoint =
  process.env.SPEEDY_OFFICES_MAP_ENDPOINT ||
  "https://services.speedy.bg/officesmap_v2/?src=sws";
const maxPhotoUploadBytes =
  Number(process.env.MAX_PHOTO_UPLOAD_BYTES) || 8 * 1024 * 1024;
const sofiaTimeZone = "Europe/Sofia";
const photosDirectory = path.resolve(__dirname, "photos");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const defaultServices = [
  {
    slug: "pacifier-clips",
    icon: "baby",
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
    priceLabel: "20€",
    customColorInquiryText:
      "За различна комбинация от цветове се прави запитване.",
    order: 1,
    isActive: true,
  },
  {
    slug: "photo-frame",
    icon: "image",
    title: "Рамка за снимка",
    desc: "Нежна рамка за снимка с име по желание на бебето. Специален спомен, който остава красив акцент в детската стая.",
    cta: "Поръчай рамка",
    priceLabel: "25€",
    customColorInquiryText:
      "За различна комбинация от цветове се прави запитване.",
    order: 3,
    isActive: true,
  },
  {
    slug: "platform",
    icon: "palette",
    title: "Полуовална платформа",
    desc: "Декоративна полуовална платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Виж варианти",
    priceLabel: "30€",
    customColorInquiryText:
      "За различна комбинация от цветове се прави запитване.",
    order: 4,
    isActive: true,
  },
  {
    slug: "round-platform",
    icon: "circle",
    title: "Кръгла платформа",
    desc: "Кръгла декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Избери модел",
    priceLabel: "35€",
    customColorInquiryText:
      "За различна комбинация от цветове се прави запитване.",
    order: 5,
    isActive: true,
  },
  {
    slug: "blocks",
    icon: "box",
    title: "Кубчета",
    desc: "Декоративни кубчета само с букви за изписване на името на бебето. Идеални за фотосесия, украса или специален повод.",
    cta: "Направи запитване",
    priceLabel: "5€ / бр.",
    customColorInquiryText:
      "За различна комбинация от цветове се прави запитване.",
    order: 6,
    isActive: true,
  },
];

function normalizeServiceSlug(slug) {
  if (!slug) {
    return "";
  }

  return slug === "blocks" ? "letter-blocks" : slug;
}

function resolveDatabaseServiceSlug(slug) {
  if (!slug) {
    return "";
  }

  return slug === "letter-blocks" ? "blocks" : slug;
}

const defaultServiceBySlug = Object.fromEntries(
  defaultServices.map((service) => {
    const normalizedSlug = normalizeServiceSlug(service.slug);
    return [
      normalizedSlug,
      {
        ...service,
        slug: normalizedSlug,
      },
    ];
  }),
);

function enrichService(service) {
  const normalizedSlug = normalizeServiceSlug(service?.slug);
  const defaults = defaultServiceBySlug[normalizedSlug];

  return {
    ...service,
    slug: normalizedSlug || service?.slug || "",
    title: defaults?.title || service?.title || "",
    desc: service?.desc || defaults?.desc || "",
    icon: service?.icon || defaults?.icon,
    order: service?.order ?? defaults?.order,
    priceLabel: service?.priceLabel || defaults?.priceLabel,
    customColorInquiryText:
      service?.customColorInquiryText || defaults?.customColorInquiryText,
  };
}

let mongoClient = null;
let emailTransporter = null;
const mongoState = {
  connected: false,
  message: mongoUri ? "Connecting..." : "MONGODB_URI is not configured",
  lastCheckedAt: null,
};
const deliveryOfficesCache = {
  econt: {
    savedAt: 0,
    offices: [],
  },
  speedy: {
    savedAt: 0,
    offices: [],
  },
};
const deliveryOfficesLoadState = {
  econt: null,
  speedy: null,
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

function normalizePhoneNumber(value) {
  const rawValue = sanitizeText(value, 32);
  if (!rawValue) {
    return "";
  }

  const compactValue = rawValue.replace(/[^\d+]/g, "");
  const normalized =
    compactValue.startsWith("+")
      ? `+${compactValue.slice(1).replace(/\+/g, "")}`
      : compactValue.replace(/\+/g, "");

  return normalized.slice(0, 20);
}

function isValidPhoneNumber(value) {
  return /^\+?\d{8,15}$/.test(value);
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLocaleLowerCase("bg-BG")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

function toDeliveryCourierLabel(value) {
  if (value === "econt") {
    return "Еконт";
  }

  if (value === "speedy") {
    return "Спиди";
  }

  return "-";
}

function toDeliveryTypeLabel(value) {
  if (value === "office") {
    return "До офис";
  }

  if (value === "address") {
    return "До адрес";
  }

  return "-";
}

function toPaymentMethodLabel(value) {
  if (value === "cod") {
    return "Наложен платеж";
  }

  return "-";
}

function scoreOfficeSearchMatch(office, normalizedQuery) {
  const normalizedName = normalizeSearchValue(office.name || "");
  const normalizedCity = normalizeSearchValue(office.city || "");
  const normalizedAddress = normalizeSearchValue(office.address || "");
  const searchIndex = office.searchIndex || "";

  let score = 0;
  if (normalizedName.startsWith(normalizedQuery)) {
    score += 120;
  }
  if (normalizedCity.startsWith(normalizedQuery)) {
    score += 90;
  }
  if (normalizedAddress.startsWith(normalizedQuery)) {
    score += 60;
  }
  if (normalizedName.includes(normalizedQuery)) {
    score += 50;
  }
  if (normalizedCity.includes(normalizedQuery)) {
    score += 30;
  }
  if (searchIndex.includes(normalizedQuery)) {
    score += 20;
  }

  return score;
}

function stripOfficeSearchIndex(office) {
  const { searchIndex, ...publicOffice } = office;
  return publicOffice;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = deliveryRequestTimeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchEcontOffices() {
  const response = await fetchWithTimeout(econtOfficesEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      countryCode: "BGR",
    }),
  });

  if (!response.ok) {
    throw new Error(`Econt offices request failed (${response.status})`);
  }

  const payload = await response.json();
  const offices = Array.isArray(payload?.offices) ? payload.offices : [];

  return offices
    .map((office) => {
      const officeId = sanitizeText(String(office?.id || ""), 40);
      const officeCode = sanitizeText(office?.code, 40);
      const officeName = sanitizeText(office?.name, 140);
      const city = sanitizeText(
        office?.address?.city?.name || office?.address?.siteName || "",
        80,
      );
      const address = sanitizeText(
        office?.address?.fullAddress ||
          office?.address?.fullAddressString ||
          office?.address?.localAddressString ||
          "",
        220,
      );

      if (!officeName) {
        return null;
      }

      const labelParts = [officeName];
      if (city) {
        labelParts.push(city);
      }

      return {
        id: `econt-${officeId || officeCode || officeName}`,
        officeId,
        code: officeCode,
        name: officeName,
        city,
        address,
        courier: "econt",
        type: office?.isAPS ? "automat" : "office",
        label: labelParts.join(" • "),
        searchIndex: normalizeSearchValue(
          [officeName, city, address, officeCode].filter(Boolean).join(" "),
        ),
      };
    })
    .filter(Boolean);
}

function inferSpeedyOfficeCity(officeName) {
  const normalizedOfficeName = officeName.replace(/\s+\(АВТОМАТ\)$/i, "").trim();
  const dashIndex = normalizedOfficeName.indexOf(" - ");
  if (dashIndex > 0) {
    return normalizedOfficeName.slice(0, dashIndex).trim();
  }

  const parenthesisIndex = normalizedOfficeName.indexOf(" (");
  if (parenthesisIndex > 0) {
    return normalizedOfficeName.slice(0, parenthesisIndex).trim();
  }

  return normalizedOfficeName;
}

async function fetchSpeedyOffices() {
  const response = await fetchWithTimeout(speedyOfficesMapEndpoint, {
    method: "GET",
    headers: {
      Referer: "https://www.speedy.bg/public/bg/speedy-offices-automats",
    },
  });

  if (!response.ok) {
    throw new Error(`Speedy offices request failed (${response.status})`);
  }

  const html = await response.text();
  const officeRegex =
    /(\d+)\s*:\s*\{[^{}]*?officeName:\s*'((?:\\'|[^'])*)'[^{}]*?officeType:\s*'((?:\\'|[^'])*)'[^{}]*?\}/g;
  const offices = [];
  let match = officeRegex.exec(html);

  while (match) {
    const officeId = sanitizeText(match[1], 40);
    const officeName = sanitizeText(match[2].replace(/\\'/g, "'"), 180);
    const officeTypeRaw = sanitizeText(match[3], 20).toUpperCase();
    const officeType = officeTypeRaw === "APT" ? "automat" : "office";
    const city = sanitizeText(inferSpeedyOfficeCity(officeName), 80);

    if (officeId && officeName) {
      offices.push({
        id: `speedy-${officeId}`,
        officeId,
        code: officeId,
        name: officeName,
        city,
        address: "",
        courier: "speedy",
        type: officeType,
        label:
          officeType === "automat"
            ? `${officeName} • Автомат`
            : `${officeName} • Офис`,
        searchIndex: normalizeSearchValue([officeName, city].join(" ")),
      });
    }

    match = officeRegex.exec(html);
  }

  if (offices.length === 0) {
    throw new Error("No Speedy offices found");
  }

  return offices;
}

async function loadDeliveryOffices(courier) {
  const cacheEntry = deliveryOfficesCache[courier];
  const now = Date.now();
  const isCacheValid =
    cacheEntry &&
    cacheEntry.offices.length > 0 &&
    now - cacheEntry.savedAt <= deliveryOfficesCacheTtlMs;

  if (isCacheValid) {
    return cacheEntry.offices;
  }

  if (deliveryOfficesLoadState[courier]) {
    return deliveryOfficesLoadState[courier];
  }

  const loader = courier === "econt" ? fetchEcontOffices : fetchSpeedyOffices;
  const loadingPromise = loader()
    .then((offices) => {
      deliveryOfficesCache[courier] = {
        savedAt: Date.now(),
        offices,
      };
      return offices;
    })
    .finally(() => {
      deliveryOfficesLoadState[courier] = null;
    });

  deliveryOfficesLoadState[courier] = loadingPromise;
  return loadingPromise;
}

async function searchDeliveryOffices(courier, query, limit = 20) {
  const offices = await loadDeliveryOffices(courier);
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedWords = normalizedQuery.split(/\s+/).filter(Boolean);

  if (normalizedWords.length === 0) {
    return offices.slice(0, limit).map(stripOfficeSearchIndex);
  }

  return offices
    .map((office) => {
      const searchIndex = office.searchIndex || "";
      const matchesAllWords = normalizedWords.every((word) =>
        searchIndex.includes(word),
      );
      if (!matchesAllWords) {
        return null;
      }

      return {
        office,
        score: scoreOfficeSearchMatch(office, normalizedQuery),
      };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.office.label.localeCompare(right.office.label, "bg"),
    )
    .slice(0, limit)
    .map((item) => stripOfficeSearchIndex(item.office));
}

const galleryCategories = [
  "Керамични фигури",
  "Клипсове за биберон",
  "Подаръчни комплекти",
];

const photoExtensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const photoMimeTypeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

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

function signAdminToken() {
  return jwt.sign(
    {
      role: "admin",
    },
    adminJwtSecret,
    {
      expiresIn: "12h",
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

function decodeAdminSessionFromRequest(req) {
  const token = parseBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, adminJwtSecret);
    if (
      typeof payload === "object" &&
      payload &&
      payload.role === "admin"
    ) {
      return {
        role: "admin",
      };
    }

    return null;
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

function normalizeGalleryCategory(value) {
  const category = sanitizeText(value, 80);
  if (!category) {
    return galleryCategories[0];
  }

  return galleryCategories.includes(category) ? category : galleryCategories[0];
}

async function ensurePhotosDirectory() {
  await fs.promises.mkdir(photosDirectory, { recursive: true });
}

function resolvePhotoExtension(fileName, mimeType) {
  const normalizedMimeType =
    typeof mimeType === "string" ? mimeType.trim().toLowerCase() : "";
  const fromMime = photoExtensionByMimeType[normalizedMimeType] || "";
  const fromFileName = path.extname(
    typeof fileName === "string" ? fileName.trim().toLowerCase() : "",
  );

  if (photoMimeTypeByExtension[fromFileName]) {
    return fromFileName === ".jpeg" ? ".jpg" : fromFileName;
  }

  return fromMime;
}

function getPhotoMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  return photoMimeTypeByExtension[extension] || "application/octet-stream";
}

function buildPhotoUrl(publicBasePath, fileName) {
  const resolvedBasePath = publicBasePath || "/backend";
  return `${resolvedBasePath}/photos/${encodeURIComponent(fileName)}`;
}

function buildDeliverySummary(order) {
  const courierLabel = toDeliveryCourierLabel(order.deliveryCourier);
  const deliveryTypeLabel = toDeliveryTypeLabel(order.deliveryType);
  const locationLabel =
    order.deliveryType === "office"
      ? [
          order.deliveryOfficeLabel || "",
          order.deliveryOfficeAddress || "",
          order.deliveryOfficeId ? `ID: ${order.deliveryOfficeId}` : "",
        ]
          .filter(Boolean)
          .join(" | ") || "-"
      : order.deliveryAddress || "-";

  return {
    courierLabel,
    deliveryTypeLabel,
    locationLabel,
  };
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
  const deliverySummary = buildDeliverySummary(order);
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
    `Телефон на клиент: ${order.customerPhone || "-"}`,
    `Имейл на клиент: ${order.customerEmail || "-"}`,
    `Куриер: ${deliverySummary.courierLabel}`,
    `Тип доставка: ${deliverySummary.deliveryTypeLabel}`,
    `Данни за доставка: ${deliverySummary.locationLabel}`,
    `Плащане: ${toPaymentMethodLabel(order.paymentMethod)}`,
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
    const customerDeliverySummary = buildDeliverySummary(order);
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
      `Телефон: ${order.customerPhone || "-"}`,
      `Куриер: ${customerDeliverySummary.courierLabel}`,
      `Тип доставка: ${customerDeliverySummary.deliveryTypeLabel}`,
      `Данни за доставка: ${customerDeliverySummary.locationLabel}`,
      `Плащане: ${toPaymentMethodLabel(order.paymentMethod)}`,
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

async function sendOrderStatusEmail(order, nextStatus) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      sentCustomer: false,
      skipped: true,
      reason: "SMTP is not configured",
    };
  }

  if (!order.customerEmail) {
    return {
      sentCustomer: false,
      skipped: true,
      reason: "Customer email is missing",
    };
  }

  const isConfirmed = nextStatus === "confirmed";
  const subject = isConfirmed
    ? "Поръчката ти е потвърдена - Little Wonders Gifts"
    : "Поръчката ти пътува към вас - Little Wonders Gifts";
  const deliverySummary = buildDeliverySummary(order);
  const customerText = [
    `Здравей, ${order.customerName || "приятелю"}!`,
    "",
    isConfirmed
      ? `Поръчката ти за ${order.serviceTitle || "персонализиран продукт"} е потвърдена и вече се изработва.`
      : `Поръчката ти за ${order.serviceTitle || "персонализиран продукт"} е изпратена и пътува към вас.`,
    `Поръчка ID: ${order.orderId}`,
    `Комбинация: ${order.selectedOptionLabel || "-"}`,
    ...(order.selectedClipLabel
      ? [`Вид щипка: ${order.selectedClipLabel}`]
      : []),
    ...(order.selectedDecorationLabel
      ? [`Елемент: ${order.selectedDecorationLabel}`]
      : []),
    `Име на бебето: ${order.babyName || "-"}`,
    `Куриер: ${deliverySummary.courierLabel}`,
    `Тип доставка: ${deliverySummary.deliveryTypeLabel}`,
    `Данни за доставка: ${deliverySummary.locationLabel}`,
    "",
    isConfirmed
      ? "Ще ти пишем отново, когато поръчката е готова за изпращане."
      : "Очаквай я съвсем скоро. Благодарим ти, че избра Little Wonders Gifts.",
    "Little Wonders Gifts",
  ].join("\n");

  try {
    await transporter.sendMail({
      from: smtpFromEmail,
      to: order.customerEmail,
      subject,
      text: customerText,
      replyTo: notificationEmail,
    });

    return {
      sentCustomer: true,
      skipped: false,
    };
  } catch (error) {
    return {
      sentCustomer: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

async function sendContactInquiryEmail(inquiry) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      sentAdmin: false,
      skipped: true,
      reason: "SMTP is not configured",
    };
  }

  const subject = `Ново запитване: ${inquiry.name || inquiry.email || "Клиент"}`;
  const text = [
    "Ново запитване в littlewondersgifts.com",
    `Получено на: ${inquiry.createdAt}`,
    `Име: ${inquiry.name || "-"}`,
    `Имейл: ${inquiry.email || "-"}`,
    "",
    "Съобщение:",
    inquiry.message || "-",
  ].join("\n");

  try {
    await transporter.sendMail({
      from: smtpFromEmail,
      to: notificationEmail,
      subject,
      text,
      replyTo: inquiry.email || notificationEmail,
    });

    return {
      sentAdmin: true,
      skipped: false,
    };
  } catch (error) {
    return {
      sentAdmin: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

function createPublicGalleryPhoto(photo, publicBasePath) {
  return {
    photoId: photo.photoId,
    title: photo.title,
    category: photo.category,
    fileName: photo.fileName,
    imageUrl: buildPhotoUrl(publicBasePath, photo.fileName),
    createdAt: photo.createdAt,
    alt:
      photo.alt ||
      `${photo.title || "Снимка"} — ${(photo.category || "").toLowerCase()}`,
  };
}

async function fetchGalleryPhotos(db, publicBasePath) {
  const photos = await db
    .collection(galleryPhotosCollectionName)
    .find(
      { isActive: { $ne: false } },
      { projection: { _id: 0 } },
    )
    .sort({ createdAt: -1, photoId: -1 })
    .toArray();

  return photos.map((photo) => createPublicGalleryPhoto(photo, publicBasePath));
}

async function fetchGalleryPhotosFromDirectory(publicBasePath) {
  await ensurePhotosDirectory();
  const entries = await fs.promises.readdir(photosDirectory, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => {
      const extension = path.extname(fileName).toLowerCase();
      return Boolean(photoMimeTypeByExtension[extension]);
    })
    .sort((left, right) => right.localeCompare(left))
    .map((fileName) => {
      const title = path
        .basename(fileName, path.extname(fileName))
        .replace(/[-_]+/g, " ")
        .trim();

      return {
        photoId: `FILE-${fileName}`,
        title: title || "Снимка от галерията",
        category: galleryCategories[0],
        fileName,
        imageUrl: buildPhotoUrl(publicBasePath, fileName),
        createdAt: null,
        alt: `${title || "Снимка от галерията"} — галерия`,
      };
    });
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

  return services.map((service) => enrichService(service));
}

async function fetchActiveServiceBySlug(db, slug) {
  if (slug === "ceramic-figures") {
    return null;
  }

  const collection = db.collection(servicesCollectionName);
  const service = await collection.findOne(
    { slug: resolveDatabaseServiceSlug(slug), isActive: { $ne: false } },
    { projection: { _id: 0 } },
  );

  return service ? enrichService(service) : null;
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

function sendFile(res, filePath, contentType) {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
  });

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      sendJson(res, 500, {
        status: "error",
        message: "Неуспешно зареждане на файла",
      });
      return;
    }

    res.destroy();
  });
  stream.pipe(res);
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

  if (routePath.startsWith("/photos/") && req.method === "GET") {
    const requestedFileName = decodeURIComponent(
      routePath.slice("/photos/".length),
    );
    const safeFileName = path.basename(requestedFileName);

    if (!safeFileName || safeFileName !== requestedFileName) {
      sendJson(res, 400, {
        status: "error",
        message: "Невалидно име на файл",
      });
      return;
    }

    const filePath = path.join(photosDirectory, safeFileName);

    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Файлът не е намерен",
        });
        return;
      }

      sendFile(res, filePath, getPhotoMimeType(safeFileName));
      return;
    } catch {
      sendJson(res, 404, {
        status: "not_found",
        message: "Файлът не е намерен",
      });
      return;
    }
  }

  if (routePath === "/gallery/photos" && req.method === "GET") {
    try {
      const db = await getMongoDb();
      const photos = await fetchGalleryPhotos(db, publicBasePath);

      sendJson(res, 200, {
        status: "ok",
        source: "mongodb",
        categories: galleryCategories,
        count: photos.length,
        photos,
      });
      return;
    } catch (error) {
      try {
        const photos = await fetchGalleryPhotosFromDirectory(publicBasePath);
        sendJson(res, 200, {
          status: "ok",
          source: "directory",
          message:
            error instanceof Error ? error.message : "Unknown MongoDB error",
          categories: galleryCategories,
          count: photos.length,
          photos,
        });
        return;
      } catch (directoryError) {
        sendJson(res, 500, {
          status: "error",
          message:
            directoryError instanceof Error
              ? directoryError.message
              : "Неуспешно зареждане на галерията",
          categories: galleryCategories,
          count: 0,
          photos: [],
        });
        return;
      }
    }
  }

  if (routePath === "/admin/session" && req.method === "POST") {
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

    const password =
      typeof payload.password === "string" ? payload.password : "";

    if (password !== adminPassword) {
      sendJson(res, 401, {
        status: "error",
        message: "Грешна админ парола",
      });
      return;
    }

    sendJson(res, 200, {
      status: "ok",
      token: signAdminToken(),
    });
    return;
  }

  if (routePath === "/admin/orders" && req.method === "GET") {
    const adminSession = decodeAdminSessionFromRequest(req);
    if (!adminSession) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужна е админ парола",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const orders = await db
        .collection(ordersCollectionName)
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1, orderId: -1 })
        .toArray();

      sendJson(res, 200, {
        status: "ok",
        count: orders.length,
        orders,
      });
      return;
    } catch (error) {
      sendJson(res, 500, {
        status: "error",
        message:
          error instanceof Error ? error.message : "Неуспешно зареждане",
      });
      return;
    }
  }

  if (
    routePath.startsWith("/admin/orders/") &&
    routePath.endsWith("/status") &&
    req.method === "POST"
  ) {
    const adminSession = decodeAdminSessionFromRequest(req);
    if (!adminSession) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужна е админ парола",
      });
      return;
    }

    const orderId = decodeURIComponent(
      routePath.slice(
        "/admin/orders/".length,
        routePath.length - "/status".length,
      ),
    );

    if (!orderId) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсва ID на поръчката",
      });
      return;
    }

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

    const nextStatus = sanitizeText(payload.status, 40);
    if (nextStatus !== "confirmed" && nextStatus !== "shipped") {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден статус",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const ordersCollection = db.collection(ordersCollectionName);
      const existingOrder = await ordersCollection.findOne(
        { orderId },
        { projection: { _id: 0 } },
      );

      if (!existingOrder) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Поръчката не е намерена",
        });
        return;
      }

      if (existingOrder.status === nextStatus) {
        sendJson(res, 200, {
          status: "ok",
          message: "Статусът вече е зададен",
          order: existingOrder,
          email: {
            sentCustomer: false,
            skipped: true,
            reason: "Status already set",
          },
        });
        return;
      }

      if (existingOrder.status === "shipped" && nextStatus === "confirmed") {
        sendJson(res, 409, {
          status: "error",
          message: "Изпратена поръчка не може да се върне назад",
        });
        return;
      }

      const updatedAt = getSofiaTimestamp();
      const statusUpdates =
        nextStatus === "confirmed"
          ? { confirmedAt: updatedAt }
          : { shippedAt: updatedAt };

      const updateResult = await ordersCollection.findOneAndUpdate(
        { orderId },
        {
          $set: {
            status: nextStatus,
            updatedAt,
            ...statusUpdates,
          },
        },
        {
          returnDocument: "after",
          projection: { _id: 0 },
        },
      );

      const updatedOrder = updateResult;
      if (!updatedOrder) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Поръчката не е намерена след обновяване",
        });
        return;
      }

      let emailResult = null;
      try {
        emailResult = await withTimeout(
          sendOrderStatusEmail(updatedOrder, nextStatus),
          emailTimeoutMs,
          "Email sending timeout",
        );
      } catch (emailError) {
        emailResult = {
          sentCustomer: false,
          skipped: false,
          reason:
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error",
        };
      }

      sendJson(res, 200, {
        status: "ok",
        message:
          nextStatus === "confirmed"
            ? "Поръчката е потвърдена"
            : "Поръчката е маркирана като изпратена",
        order: updatedOrder,
        email: emailResult,
      });
      return;
    } catch (error) {
      sendJson(res, 500, {
        status: "error",
        message:
          error instanceof Error ? error.message : "Неуспешна промяна на статус",
      });
      return;
    }
  }

  if (
    routePath.startsWith("/admin/orders/") &&
    !routePath.endsWith("/status") &&
    req.method === "PUT"
  ) {
    const adminSession = decodeAdminSessionFromRequest(req);
    if (!adminSession) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужна е админ парола",
      });
      return;
    }

    const orderId = decodeURIComponent(
      routePath.slice("/admin/orders/".length),
    );

    if (!orderId) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсва ID на поръчката",
      });
      return;
    }

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

    try {
      const db = await getMongoDb();
      const ordersCollection = db.collection(ordersCollectionName);
      const existingOrder = await ordersCollection.findOne(
        { orderId },
        { projection: { _id: 0 } },
      );

      if (!existingOrder) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Поръчката не е намерена",
        });
        return;
      }

      const serviceTitle = sanitizeText(payload.serviceTitle, 140);
      const selectedOptionLabel = sanitizeText(payload.selectedOptionLabel, 160);
      const selectedClipLabel = sanitizeText(payload.selectedClipLabel, 80);
      const selectedDecorationLabel = sanitizeText(
        payload.selectedDecorationLabel,
        80,
      );
      const babyName = sanitizeText(payload.babyName, 60);
      const customerName = sanitizeText(payload.customerName, 80);
      const customerPhone = normalizePhoneNumber(payload.customerPhone);
      const customerEmailRaw = sanitizeText(
        payload.customerEmail,
        160,
      ).toLowerCase();
      const deliveryCourier = sanitizeText(
        payload.deliveryCourier,
        20,
      ).toLowerCase();
      const deliveryType = sanitizeText(payload.deliveryType, 20).toLowerCase();
      const deliveryAddress = sanitizeText(payload.deliveryAddress, 220);
      const deliveryOfficeId = sanitizeText(payload.deliveryOfficeId, 80);
      const deliveryOfficeLabel = sanitizeText(payload.deliveryOfficeLabel, 220);
      const deliveryOfficeAddress =
        typeof payload.deliveryOfficeAddress === "undefined"
          ? sanitizeText(existingOrder.deliveryOfficeAddress, 240)
          : sanitizeText(payload.deliveryOfficeAddress, 240);
      const paymentMethod = "cod";
      const customerEmail =
        customerEmailRaw && !isValidEmail(customerEmailRaw)
          ? null
          : customerEmailRaw;
      const requiresBabyName = [
        "pacifier-clips",
        "letter-blocks",
        "photo-frame",
      ].includes(existingOrder.serviceSlug);

      if (customerEmail === null) {
        sendJson(res, 400, {
          status: "error",
          message: "Имейлът не е валиден",
        });
        return;
      }

      if (customerPhone && !isValidPhoneNumber(customerPhone)) {
        sendJson(res, 400, {
          status: "error",
          message: "Телефонът не е валиден",
        });
        return;
      }

      if (deliveryCourier && deliveryCourier !== "econt" && deliveryCourier !== "speedy") {
        sendJson(res, 400, {
          status: "error",
          message: "Куриерът трябва да е Еконт или Спиди",
        });
        return;
      }

      if (deliveryType && deliveryType !== "address" && deliveryType !== "office") {
        sendJson(res, 400, {
          status: "error",
          message: "Типът доставка трябва да е до адрес или до офис",
        });
        return;
      }

      if (deliveryType === "address" && !deliveryAddress) {
        sendJson(res, 400, {
          status: "error",
          message: "Липсва адрес за доставка",
        });
        return;
      }

      if (deliveryType === "office" && !deliveryOfficeLabel) {
        sendJson(res, 400, {
          status: "error",
          message: "Липсва офис за доставка",
        });
        return;
      }

      if (!serviceTitle || !selectedOptionLabel || (requiresBabyName && !babyName)) {
        sendJson(res, 400, {
          status: "error",
          message:
            "Услугата и комбинацията са задължителни, а за този продукт е нужно и име на бебето.",
        });
        return;
      }

      const updatedAt = getSofiaTimestamp();
      const updatedOrder = await ordersCollection.findOneAndUpdate(
        { orderId },
        {
          $set: {
            serviceTitle,
            selectedOptionLabel,
            selectedClipLabel,
            selectedDecorationLabel,
            babyName,
            customerName,
            customerPhone,
            customerEmail: customerEmail || "",
            deliveryCourier,
            deliveryType,
            deliveryAddress: deliveryType === "address" ? deliveryAddress : "",
            deliveryOfficeId: deliveryType === "office" ? deliveryOfficeId : "",
            deliveryOfficeLabel: deliveryType === "office" ? deliveryOfficeLabel : "",
            deliveryOfficeAddress:
              deliveryType === "office" ? deliveryOfficeAddress : "",
            paymentMethod,
            updatedAt,
          },
        },
        {
          returnDocument: "after",
          projection: { _id: 0 },
        },
      );

      if (!updatedOrder) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Поръчката не е намерена след редакция",
        });
        return;
      }

      sendJson(res, 200, {
        status: "ok",
        message: "Поръчката е редактирана",
        order: updatedOrder,
      });
      return;
    } catch (error) {
      sendJson(res, 500, {
        status: "error",
        message:
          error instanceof Error ? error.message : "Неуспешна редакция на поръчката",
      });
      return;
    }
  }

  if (
    routePath.startsWith("/admin/orders/") &&
    !routePath.endsWith("/status") &&
    req.method === "DELETE"
  ) {
    const adminSession = decodeAdminSessionFromRequest(req);
    if (!adminSession) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужна е админ парола",
      });
      return;
    }

    const orderId = decodeURIComponent(
      routePath.slice("/admin/orders/".length),
    );

    if (!orderId) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсва ID на поръчката",
      });
      return;
    }

    try {
      const db = await getMongoDb();
      const ordersCollection = db.collection(ordersCollectionName);
      const existingOrder = await ordersCollection.findOne(
        { orderId },
        { projection: { _id: 0 } },
      );

      if (!existingOrder) {
        sendJson(res, 404, {
          status: "not_found",
          message: "Поръчката не е намерена",
        });
        return;
      }

      await ordersCollection.deleteOne({ orderId });

      sendJson(res, 200, {
        status: "ok",
        message: "Поръчката е изтрита",
        order: existingOrder,
      });
      return;
    } catch (error) {
      sendJson(res, 500, {
        status: "error",
        message:
          error instanceof Error ? error.message : "Неуспешно изтриване на поръчката",
      });
      return;
    }
  }

  if (routePath === "/admin/gallery/photos" && req.method === "POST") {
    const adminSession = decodeAdminSessionFromRequest(req);
    if (!adminSession) {
      sendJson(res, 401, {
        status: "error",
        message: "Нужна е админ парола",
      });
      return;
    }

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

    const title = sanitizeText(payload.title, 140);
    const category = normalizeGalleryCategory(payload.category);
    const fileName = sanitizeText(payload.fileName, 160);
    const mimeType = sanitizeText(payload.mimeType, 80).toLowerCase();
    const base64Data =
      typeof payload.base64Data === "string" ? payload.base64Data.trim() : "";

    if (!title || !fileName || !mimeType || !base64Data) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсват данни за снимката",
      });
      return;
    }

    const resolvedExtension = resolvePhotoExtension(fileName, mimeType);
    if (!resolvedExtension) {
      sendJson(res, 400, {
        status: "error",
        message: "Позволени са само JPG, PNG, WEBP и GIF снимки",
      });
      return;
    }

    const normalizedBase64 = base64Data.replace(
      /^data:[^;]+;base64,/i,
      "",
    );

    let fileBuffer = null;
    try {
      fileBuffer = Buffer.from(normalizedBase64, "base64");
    } catch {
      sendJson(res, 400, {
        status: "error",
        message: "Невалидна base64 снимка",
      });
      return;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      sendJson(res, 400, {
        status: "error",
        message: "Каченият файл е празен",
      });
      return;
    }

    if (fileBuffer.length > maxPhotoUploadBytes) {
      sendJson(res, 400, {
        status: "error",
        message: `Снимката е твърде голяма. Максимумът е ${Math.round(maxPhotoUploadBytes / (1024 * 1024))} MB.`,
      });
      return;
    }

    const now = getSofiaTimestamp();
    const storedFileName = `${Date.now()}-${randomUUID()}${resolvedExtension}`;
    const photoDoc = {
      photoId: `PHOTO-${Date.now()}`,
      title,
      category,
      fileName: storedFileName,
      alt: `${title} — ${category.toLowerCase()}`,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };
    const storedFilePath = path.join(photosDirectory, storedFileName);

    try {
      await ensurePhotosDirectory();
      await fs.promises.writeFile(storedFilePath, fileBuffer);

      const db = await getMongoDb();
      await db.collection(galleryPhotosCollectionName).insertOne(photoDoc);

      sendJson(res, 201, {
        status: "ok",
        message: "Снимката е качена успешно",
        photo: createPublicGalleryPhoto(photoDoc, publicBasePath),
      });
      return;
    } catch (error) {
      try {
        await fs.promises.unlink(storedFilePath);
      } catch {
        // Ignore cleanup errors.
      }

      sendJson(res, 500, {
        status: "error",
        message:
          error instanceof Error ? error.message : "Неуспешно качване на снимката",
      });
      return;
    }
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
        services: defaultServices.map((service) => enrichService(service)),
      });
      return;
    }
  }

  if (routePath === "/delivery/offices" && req.method === "GET") {
    const courier = sanitizeText(url.searchParams.get("courier"), 20).toLowerCase();
    const query = sanitizeText(url.searchParams.get("q"), 120);
    const requestedLimit = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.round(requestedLimit), 1), 50)
      : 20;

    if (courier !== "econt" && courier !== "speedy") {
      sendJson(res, 400, {
        status: "error",
        message: "Невалиден куриер. Позволени: econt, speedy.",
      });
      return;
    }

    try {
      const offices = await searchDeliveryOffices(courier, query, limit);

      sendJson(res, 200, {
        status: "ok",
        courier,
        query,
        count: offices.length,
        offices,
      });
      return;
    } catch (error) {
      sendJson(res, 502, {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Неуспешно зареждане на офисите",
      });
      return;
    }
  }

  if (routePath === "/contact" && req.method === "POST") {
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

    const name = sanitizeText(payload.name, 80);
    const email = sanitizeText(payload.email, 160).toLowerCase();
    const message = sanitizeText(payload.message, 3000);

    if (!name) {
      sendJson(res, 400, {
        status: "error",
        message: "Името е задължително",
      });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, въведете валиден имейл",
      });
      return;
    }

    if (!message || message.length < 3) {
      sendJson(res, 400, {
        status: "error",
        message: "Съобщението е твърде кратко",
      });
      return;
    }

    let emailResult = null;
    try {
      emailResult = await withTimeout(
        sendContactInquiryEmail({
          name,
          email,
          message,
          createdAt: getSofiaTimestamp(),
        }),
        emailTimeoutMs,
        "Email sending timeout",
      );
    } catch (emailError) {
      emailResult = {
        sentAdmin: false,
        skipped: false,
        reason:
          emailError instanceof Error
            ? emailError.message
            : "Unknown email error",
      };
    }

    if (!emailResult?.sentAdmin) {
      const isMissingConfiguration = emailResult?.skipped;
      sendJson(res, isMissingConfiguration ? 503 : 502, {
        status: "error",
        message: isMissingConfiguration
          ? "SMTP не е конфигуриран. Запитването не може да бъде изпратено."
          : "Неуспешно изпращане на запитването. Моля, опитайте отново.",
        email: emailResult,
      });
      return;
    }

    sendJson(res, 201, {
      status: "ok",
      message: "Запитването е изпратено успешно",
    });
    return;
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
    const customerPhone = normalizePhoneNumber(payload.customerPhone);
    const customerEmailRaw = sanitizeText(
      payload.customerEmail,
      160,
    ).toLowerCase();
    const deliveryCourier = sanitizeText(
      payload.deliveryCourier,
      20,
    ).toLowerCase();
    const deliveryType = sanitizeText(payload.deliveryType, 20).toLowerCase();
    const deliveryAddress = sanitizeText(payload.deliveryAddress, 220);
    const deliveryOfficeId = sanitizeText(payload.deliveryOfficeId, 80);
    const deliveryOfficeLabel = sanitizeText(payload.deliveryOfficeLabel, 220);
    const deliveryOfficeAddress = sanitizeText(
      payload.deliveryOfficeAddress,
      240,
    );
    const paymentMethod = "cod";
    const customerEmail =
      customerEmailRaw && isValidEmail(customerEmailRaw)
        ? customerEmailRaw
        : "";
    const authUser = decodeAuthUserFromRequest(req);
    const resolvedCustomerName = customerName || authUser?.fullName || "";
    const resolvedCustomerEmail = customerEmail || authUser?.email || "";
    const requiresBabyName = [
      "pacifier-clips",
      "letter-blocks",
      "photo-frame",
    ].includes(serviceSlug);

    if (!serviceSlug || !serviceTitle || !selectedOptionId) {
      sendJson(res, 400, {
        status: "error",
        message: "Липсват задължителни данни за поръчката",
      });
      return;
    }

    if (requiresBabyName && !babyName) {
      sendJson(res, 400, {
        status: "error",
        message: "Името на бебето е задължително за този продукт",
      });
      return;
    }

    if (!resolvedCustomerName) {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, въведете име за доставка",
      });
      return;
    }

    if (!customerPhone || !isValidPhoneNumber(customerPhone)) {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, въведете валиден телефон за доставка",
      });
      return;
    }

    if (deliveryCourier !== "econt" && deliveryCourier !== "speedy") {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, изберете валиден куриер (Еконт или Спиди)",
      });
      return;
    }

    if (deliveryType !== "address" && deliveryType !== "office") {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, изберете валиден тип доставка",
      });
      return;
    }

    if (deliveryType === "address" && !deliveryAddress) {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, въведете адрес за доставка",
      });
      return;
    }

    if (deliveryType === "office" && !deliveryOfficeLabel) {
      sendJson(res, 400, {
        status: "error",
        message: "Моля, изберете офис за доставка",
      });
      return;
    }

    const createdAt = getSofiaTimestamp();
    const orderId = `LWG-${Date.now()}`;

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
      customerPhone,
      customerEmail: resolvedCustomerEmail,
      deliveryCourier,
      deliveryType,
      deliveryAddress: deliveryType === "address" ? deliveryAddress : "",
      deliveryOfficeId: deliveryType === "office" ? deliveryOfficeId : "",
      deliveryOfficeLabel: deliveryType === "office" ? deliveryOfficeLabel : "",
      deliveryOfficeAddress: deliveryType === "office" ? deliveryOfficeAddress : "",
      paymentMethod,
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
