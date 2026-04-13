import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  customColorInquiryText as defaultCustomColorInquiryText,
  getServiceCatalogMeta,
  standardServicePriceNote,
} from "@/lib/serviceCatalog";

type ServiceDetails = {
  slug: string;
  title: string;
  desc?: string;
  shortDescription?: string;
  longDescription?: string;
  bullets?: string[];
  bulletPoints?: string[];
  priceLabel?: string;
  customColorInquiryText?: string;
};

const fallbackServiceDetailsBySlug: Record<string, ServiceDetails> = {
  "pacifier-clips": {
    slug: "pacifier-clips",
    title: "Клипсове за биберон с име",
    longDescription:
      "Персонализирани клипсове от хранителен силикон и натурално дърво. Избери комбинация по цветове, елемент и вид щипка за момичета или момчета.",
    bullets: [
      "Безопасни материали за ежедневна употреба",
      "Персонализация с име на бебето",
      "Избор между различни форми на дървената щипка",
      "Варианти с цвете или панделка при избрани модели",
    ],
  },
  "photo-frame": {
    slug: "photo-frame",
    title: "Рамка за снимка",
    longDescription:
      "Нежна рамка за снимка с име по желание. Идеален спомен за детската стая или подарък за повод.",
  },
  platform: {
    slug: "platform",
    title: "Полуовална платформа",
    longDescription:
      "Декоративна полуовална платформа за фотосесии, украса и специални поводи.",
  },
  "round-platform": {
    slug: "round-platform",
    title: "Кръгла платформа",
    longDescription:
      "Кръгла декоративна платформа с изчистен стил за фотосесии и празнични декорации.",
  },
  "letter-blocks": {
    slug: "letter-blocks",
    title: "Кубчета",
    longDescription:
      "Декоративни кубчета с букви за изписване на името на бебето.",
  },
};

type ClipAudience = "girl" | "boy";
type ClipDecoration = "flower" | "bow";
type ClipShape = "heart" | "bear" | "star" | "cat" | "round";
type DeliveryCourier = "econt" | "speedy";
type DeliveryType = "address" | "office";

type DeliveryOfficeSuggestion = {
  id: string;
  officeId?: string;
  code?: string;
  name?: string;
  city?: string;
  address?: string;
  courier?: DeliveryCourier;
  type?: string;
  label: string;
};

type ClipOption = {
  id: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
  decorations?: ClipDecoration[];
};

type BlockOption = {
  id: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
};

type FrameOption = {
  id: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
};

type FrameBaseStyle = "solid" | "splatter";

type RoundPlatformOption = {
  id: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
};

type PlatformOption = {
  id: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
};

type ClipShapeOption = {
  id: ClipShape;
  label: string;
};

type PlatformColorPreset = {
  key: string;
  audience: ClipAudience;
  title: string;
  subtitle: string;
  colors: string[];
};

const clipOptions: ClipOption[] = [
  {
    id: "girl-pink-white",
    audience: "girl",
    title: "1) Розово + бяло",
    subtitle: "Избор: цвете или панделка",
    colors: ["#F48FB1", "#FFFFFF", "#F48FB1", "#FFFFFF", "#FADADD"],
    decorations: ["flower", "bow"],
  },
  {
    id: "girl-beige-white-flower",
    audience: "girl",
    title: "2) Бежово + бяло",
    subtitle: "Декорация: цвете",
    colors: ["#D7BFA7", "#FFFFFF", "#D7BFA7", "#FFFFFF", "#EBDCC9"],
    decorations: ["flower"],
  },
  {
    id: "girl-purple-white",
    audience: "girl",
    title: "3) Лилаво + бяло",
    subtitle: "Избор: панделка или цвете",
    colors: ["#B9A0E6", "#FFFFFF", "#B9A0E6", "#FFFFFF", "#D8C7F2"],
    decorations: ["bow", "flower"],
  },
  {
    id: "girl-yellow-beige",
    audience: "girl",
    title: "4) Жълто + бежово/бяло",
    subtitle: "Нежна топла комбинация",
    colors: ["#F2D974", "#D7BFA7", "#FFFFFF", "#F2D974", "#EFDCA6"],
  },
  {
    id: "boy-blue-white-beige",
    audience: "boy",
    title: "1) Синьо + бяло/бежово",
    subtitle: "Класическа синя комбинация",
    colors: ["#4A90E2", "#FFFFFF", "#D7BFA7", "#4A90E2", "#B7D2F3"],
  },
  {
    id: "boy-mint-white",
    audience: "boy",
    title: "2) Ментово зелено + бяло",
    subtitle: "Свеж пастелен вариант",
    colors: ["#8CD9C8", "#FFFFFF", "#8CD9C8", "#FFFFFF", "#BEE9DF"],
  },
  {
    id: "boy-brown-beige",
    audience: "boy",
    title: "3) Кафяво + бежово/бяло",
    subtitle: "Земни и натурални тонове",
    colors: ["#9F7A5A", "#D7BFA7", "#FFFFFF", "#9F7A5A", "#C9A88C"],
  },
  {
    id: "boy-darkgreen-beige",
    audience: "boy",
    title: "4) Тъмно зелено + бежово",
    subtitle: "Елегантна наситена комбинация",
    colors: ["#3E6B56", "#D7BFA7", "#3E6B56", "#D7BFA7", "#A5BCA8"],
  },
  {
    id: "boy-babyblue-darkblue",
    audience: "boy",
    title: "5) Бебешко синьо + тъмно синьо",
    subtitle: "Контрастен двуцветен стил",
    colors: ["#8BBBF4", "#245A9C", "#8BBBF4", "#245A9C", "#A8CCF0"],
  },
];

const clipShapeOptions: ClipShapeOption[] = [
  { id: "heart", label: "Сърце" },
  { id: "bear", label: "Мече" },
  { id: "star", label: "Звезда" },
  { id: "cat", label: "Коте" },
  { id: "round", label: "Кръгла" },
];

const blockOptions: BlockOption[] = [
  {
    id: "block-girl-pink-white",
    audience: "girl",
    title: "1) Розово + бяло",
    subtitle: "Нежна класическа комбинация",
    colors: ["#F48FB1", "#FFFFFF"],
  },
  {
    id: "block-girl-yellow-white",
    audience: "girl",
    title: "2) Жълто + бяло",
    subtitle: "Слънчев и светъл вариант",
    colors: ["#F2D974", "#FFFFFF"],
  },
  {
    id: "block-girl-purple-white",
    audience: "girl",
    title: "3) Лилаво + бяло",
    subtitle: "Мек пастелен контраст",
    colors: ["#B9A0E6", "#FFFFFF"],
  },
  {
    id: "block-girl-beige-white",
    audience: "girl",
    title: "4) Бежово + бяло",
    subtitle: "Топли натурални тонове",
    colors: ["#D7BFA7", "#FFFFFF"],
  },
  {
    id: "block-girl-pink-beige",
    audience: "girl",
    title: "5) Розово + бежово",
    subtitle: "Романтична комбинация",
    colors: ["#F48FB1", "#D7BFA7"],
  },
  {
    id: "block-girl-baby-pink-cyclamen",
    audience: "girl",
    title: "6) Бебешко розово + цикламено розово",
    subtitle: "По-наситен розов стил",
    colors: ["#F7B8C8", "#E5458C"],
  },
  {
    id: "block-girl-baby-pink-pastel-yellow",
    audience: "girl",
    title: "7) Бебешко розово + пастелено жълто",
    subtitle: "Сладка пастелна визия",
    colors: ["#F7B8C8", "#F7E58B"],
  },
  {
    id: "block-boy-baby-blue-white",
    audience: "boy",
    title: "1) Бебешко синьо + бяло",
    subtitle: "Свеж и изчистен вариант",
    colors: ["#9DCBFF", "#FFFFFF"],
  },
  {
    id: "block-boy-baby-blue-dark-blue-white",
    audience: "boy",
    title: "2) Бебешко синьо + тъмно синьо + бяло",
    subtitle: "Трицветна класическа комбинация",
    colors: ["#9DCBFF", "#1C4F9A", "#FFFFFF"],
  },
  {
    id: "block-boy-dark-blue-white",
    audience: "boy",
    title: "3) Тъмно синьо + бяло",
    subtitle: "Силен контраст",
    colors: ["#1C4F9A", "#FFFFFF"],
  },
  {
    id: "block-boy-lime-white",
    audience: "boy",
    title: "4) Лайм + бяло",
    subtitle: "Жив и модерен акцент",
    colors: ["#A4D65E", "#FFFFFF"],
  },
  {
    id: "block-boy-light-blue-brown",
    audience: "boy",
    title: "5) Светло синьо + кафяво",
    subtitle: "Натурална комбинация",
    colors: ["#7CC9F5", "#9F7A5A"],
  },
  {
    id: "block-boy-green-yellow",
    audience: "boy",
    title: "6) Зелено + жълто",
    subtitle: "Игрива цветна палитра",
    colors: ["#4C9A59", "#F2D974"],
  },
  {
    id: "block-boy-beige-white",
    audience: "boy",
    title: "7) Бежово + бяло",
    subtitle: "Неутрален мек стил",
    colors: ["#D7BFA7", "#FFFFFF"],
  },
  {
    id: "block-boy-gray-white",
    audience: "boy",
    title: "8) Сиво + бяло",
    subtitle: "Минималистична визия",
    colors: ["#B4B8C0", "#FFFFFF"],
  },
];

const frameOptions: FrameOption[] = blockOptions.map((option) => ({
  id: option.id.replace("block-", "frame-"),
  audience: option.audience,
  title: option.title,
  subtitle: option.subtitle,
  colors: option.colors,
}));

const platformColorPresets: PlatformColorPreset[] = [
  {
    key: "girl-pink-white",
    audience: "girl",
    title: "1) Розово + бяло",
    subtitle: "Нежна класическа комбинация",
    colors: ["#F48FB1", "#FFFFFF"],
  },
  {
    key: "girl-cyclamen-white",
    audience: "girl",
    title: "2) Цикламено розово + бяло",
    subtitle: "По-наситен и ярък акцент",
    colors: ["#E83E8C", "#FFFFFF"],
  },
  {
    key: "girl-yellow-white",
    audience: "girl",
    title: "3) Жълто + бяло",
    subtitle: "Слънчева свежа визия",
    colors: ["#F2D974", "#FFFFFF"],
  },
  {
    key: "girl-purple-white",
    audience: "girl",
    title: "4) Лилаво + бяло",
    subtitle: "Мека романтична палитра",
    colors: ["#B9A0E6", "#FFFFFF"],
  },
  {
    key: "girl-beige-white",
    audience: "girl",
    title: "5) Бежово + бяло",
    subtitle: "Топъл неутрален стил",
    colors: ["#D7BFA7", "#FFFFFF"],
  },
  {
    key: "girl-orange-white",
    audience: "girl",
    title: "6) Оранжево + бяло",
    subtitle: "Топла игрива комбинация",
    colors: ["#F4A261", "#FFFFFF"],
  },
  {
    key: "boy-babyblue-white",
    audience: "boy",
    title: "1) Бебешко синьо + бяло",
    subtitle: "Класическа мека комбинация",
    colors: ["#8BBBF4", "#FFFFFF"],
  },
  {
    key: "boy-darkblue-lightblue-white",
    audience: "boy",
    title: "2) Тъмно синьо + светло синьо + бяло",
    subtitle: "По-изразена тройна палитра",
    colors: ["#245A9C", "#8BBBF4", "#FFFFFF"],
  },
  {
    key: "boy-olive-white",
    audience: "boy",
    title: "3) Маслено зелено + бяло",
    subtitle: "Натурална земна комбинация",
    colors: ["#8A9A5B", "#FFFFFF"],
  },
  {
    key: "boy-lime-white",
    audience: "boy",
    title: "4) Цвят лайм + бяло",
    subtitle: "Свеж ярък акцент",
    colors: ["#A4D65E", "#FFFFFF"],
  },
  {
    key: "boy-beige-white",
    audience: "boy",
    title: "5) Бежово + бяло",
    subtitle: "Изчистена неутрална визия",
    colors: ["#D7BFA7", "#FFFFFF"],
  },
  {
    key: "boy-gray-white",
    audience: "boy",
    title: "6) Сиво + бяло",
    subtitle: "Модерен минималистичен стил",
    colors: ["#B4B8C0", "#FFFFFF"],
  },
];

const roundPlatformOptions: RoundPlatformOption[] = platformColorPresets.map(
  ({ key, audience, title, subtitle, colors }) => ({
    id: `round-platform-${key}`,
    audience,
    title,
    subtitle,
    colors,
  }),
);

const platformOptions: PlatformOption[] = platformColorPresets.map(
  ({ key, audience, title, subtitle, colors }) => ({
    id: `platform-${key}`,
    audience,
    title,
    subtitle,
    colors,
  }),
);

const getPreviewLetters = (value: string, maxLetters = 5) => {
  const cleaned = value.toLocaleUpperCase("bg-BG").replace(/[^A-ZА-Я0-9]/g, "");
  const fallback = "ИМЕ";
  if (!cleaned) {
    return fallback.slice(0, maxLetters);
  }

  return cleaned.slice(0, maxLetters);
};

const getHexToRgb = (hexColor: string) => {
  const hex = hexColor.replace("#", "").trim();
  if (hex.length !== 6) {
    return null;
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { r, g, b };
};

const getAccessibleTextColor = (hexColor: string) => {
  const rgb = getHexToRgb(hexColor);
  if (!rgb) {
    return {
      fill: "#2B2B2B",
      stroke: "none",
    };
  }

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const useDarkText = luminance > 0.72;

  return useDarkText
    ? {
        fill: "#374151",
        stroke: "#FFFFFF",
      }
    : {
        fill: "#FFFFFF",
        stroke: "none",
      };
};

const getReadableColorOnBackground = (
  preferredHexColor: string,
  backgroundHexColor: string,
) => {
  const preferred = getHexToRgb(preferredHexColor);
  const background = getHexToRgb(backgroundHexColor);

  if (!preferred || !background) {
    return {
      fill: "#1F2937",
      stroke: "#FFF7ED",
    };
  }

  const preferredLuminance =
    (0.299 * preferred.r + 0.587 * preferred.g + 0.114 * preferred.b) / 255;
  const backgroundLuminance =
    (0.299 * background.r + 0.587 * background.g + 0.114 * background.b) / 255;
  const contrastDelta = Math.abs(preferredLuminance - backgroundLuminance);

  const resolvedFill =
    contrastDelta >= 0.35
      ? preferredHexColor
      : backgroundLuminance > 0.7
        ? "#1F2937"
        : "#FFFFFF";

  const fillRgb = getHexToRgb(resolvedFill);
  const fillLuminance = fillRgb
    ? (0.299 * fillRgb.r + 0.587 * fillRgb.g + 0.114 * fillRgb.b) / 255
    : 0.5;

  return {
    fill: resolvedFill,
    stroke: fillLuminance > 0.65 ? "#334155" : "#FFF7ED",
  };
};

const buildSvgGradientStops = (colors: string[]) => {
  const palette = colors.length > 0 ? colors : ["#E5E7EB"];
  const maxIndex = Math.max(palette.length - 1, 1);

  return palette
    .map((color, index) => {
      const offset =
        palette.length === 1 ? "0%" : `${(index / maxIndex) * 100}%`;
      return `<stop offset="${offset}" stop-color="${color}" />`;
    })
    .join("");
};

const renderDecoration = (decoration?: ClipDecoration) => {
  if (decoration === "flower") {
    return `
      <g>
        <circle cx="390" cy="105" r="13" fill="#FFD8E7"/>
        <circle cx="402" cy="112" r="13" fill="#FFD8E7"/>
        <circle cx="390" cy="119" r="13" fill="#FFD8E7"/>
        <circle cx="378" cy="112" r="13" fill="#FFD8E7"/>
        <circle cx="390" cy="112" r="9" fill="#FFE58E"/>
      </g>
    `;
  }

  if (decoration === "bow") {
    return `
      <g>
        <path d="M374 112c0-10 14-18 26-9c5 4 7 9 8 9c-1 0-3 5-8 9c-12 9-26 1-26-9z" fill="#F7B6C2"/>
        <path d="M406 112c0-10 14-18 26-9c5 4 7 9 8 9c-1 0-3 5-8 9c-12 9-26 1-26-9z" fill="#F7B6C2"/>
        <ellipse cx="406" cy="112" rx="8" ry="10" fill="#E88FA2"/>
      </g>
    `;
  }

  return "";
};

const renderClipShape = (shape: ClipShape) => {
  const woodFill = "#C89A66";
  const woodStroke = "#A97841";

  if (shape === "heart") {
    return `
      <path d="M500 82c9-12 28-11 36 2c7 11 3 25-8 34l-28 22l-28-22c-11-9-15-23-8-34c8-13 27-14 36-2z" fill="${woodFill}" stroke="${woodStroke}" stroke-width="2"/>
    `;
  }

  if (shape === "bear") {
    return `
      <circle cx="470" cy="92" r="16" fill="#7A5D49"/>
      <circle cx="530" cy="92" r="16" fill="#7A5D49"/>
      <rect x="446" y="94" width="108" height="92" rx="44" fill="#7A5D49"/>
      <ellipse cx="500" cy="146" rx="20" ry="14" fill="#E9DDCC"/>
    `;
  }

  if (shape === "star") {
    return `
      <path d="M500 76l13 27l30 4l-22 21l5 30l-26-14l-26 14l5-30l-22-21l30-4l13-27z" fill="${woodFill}" stroke="${woodStroke}" stroke-width="2" stroke-linejoin="round"/>
    `;
  }

  if (shape === "cat") {
    return `
      <path d="M476 87l15 9c6-3 13-4 20-4c7 0 14 1 20 4l15-9l-3 22c8 8 12 19 12 31c0 24-20 43-44 43s-44-19-44-43c0-12 4-23 12-31l-3-22z" fill="${woodFill}" stroke="${woodStroke}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="493" cy="133" r="3" fill="#7A5D49"/>
      <circle cx="527" cy="133" r="3" fill="#7A5D49"/>
      <path d="M507 143l4 4l4-4" stroke="#7A5D49" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M487 146h-12m12 4h-12m48-4h12m-12 4h12" stroke="#7A5D49" stroke-width="1.8" stroke-linecap="round"/>
    `;
  }

  return `
    <circle cx="500" cy="118" r="38" fill="${woodFill}" stroke="${woodStroke}" stroke-width="2"/>
  `;
};

const getClipPreviewDataUri = (
  option: ClipOption,
  selectedDecoration?: ClipDecoration,
  selectedClipShape: ClipShape = "heart",
) => {
  const circles = option.colors
    .map(
      (color, index) =>
        `<circle cx="${120 + index * 56}" cy="112" r="22" fill="${color}" stroke="#E8E8E8" stroke-width="2"/>`,
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="280" viewBox="0 0 640 280" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="640" y2="280" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFF7FB"/>
          <stop offset="1" stop-color="#F2F8FF"/>
        </linearGradient>
      </defs>
      <rect width="640" height="280" rx="28" fill="url(#bg)"/>
      <rect x="54" y="80" width="412" height="64" rx="32" fill="#FFFFFF" stroke="#EDEDED" stroke-width="2"/>
      ${circles}
      ${renderClipShape(selectedClipShape)}
      <rect x="486" y="162" width="28" height="12" rx="4" fill="#C6CCD3" stroke="#9FA7B2" stroke-width="2"/>
      <path d="M492 173v21c0 9 16 9 16 0v-21" fill="none" stroke="#9FA7B2" stroke-width="3" stroke-linecap="round"/>
      <path d="M490 190c0 7 20 7 20 0" fill="none" stroke="#7E8793" stroke-width="2.4" stroke-linecap="round"/>
      ${renderDecoration(selectedDecoration)}
      <text x="54" y="205" fill="#666666" font-size="22" font-family="Arial, sans-serif">${option.title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getBlocksPreviewDataUri = (option: BlockOption, babyName: string) => {
  const letters = getPreviewLetters(babyName).split("");
  const cubeWidth = 102;
  const cubeGap = 26;
  const cubesCount = letters.length;
  const totalCubesWidth =
    cubesCount > 0
      ? cubesCount * cubeWidth + (cubesCount - 1) * cubeGap
      : cubeWidth;
  const startX = (860 - totalCubesWidth) / 2;

  const cubes = letters
    .map((letter, index) => {
      const x = startX + index * (cubeWidth + cubeGap);
      const color = option.colors[index % option.colors.length];
      const textStyle = getAccessibleTextColor(color);
      return `
        <g>
          <rect x="${x}" y="136" width="102" height="102" rx="12" fill="${color}" stroke="#E2E2E2" stroke-width="2"/>
          <text x="${x + 51}" y="202" text-anchor="middle" fill="${textStyle.fill}" stroke="${textStyle.stroke}" stroke-width="1.5" paint-order="stroke" font-size="46" font-weight="700" font-family="Arial, sans-serif">${letter}</text>
          <circle cx="${x + 51}" cy="112" r="26" fill="#7A5D49"/>
          <ellipse cx="${x + 41}" cy="108" rx="4" ry="5" fill="#231B16"/>
          <ellipse cx="${x + 61}" cy="108" rx="4" ry="5" fill="#231B16"/>
          <ellipse cx="${x + 51}" cy="120" rx="10" ry="7" fill="#F6E7D8"/>
        </g>
      `;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="860" height="330" viewBox="0 0 860 330" fill="none">
      <defs>
        <linearGradient id="blocksBg" x1="0" y1="0" x2="860" y2="330" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F8FBFF"/>
          <stop offset="1" stop-color="#FFF8FA"/>
        </linearGradient>
      </defs>
      <rect width="860" height="330" rx="28" fill="url(#blocksBg)"/>
      <rect x="72" y="252" width="716" height="18" rx="9" fill="#E9E9E9"/>
      ${cubes}
      <text x="72" y="44" fill="#666666" font-size="25" font-family="Arial, sans-serif">${option.title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getFramePreviewDataUri = (
  option: FrameOption,
  baseStyle: FrameBaseStyle,
  babyName: string,
) => {
  const letters = getPreviewLetters(babyName, 7).split("");
  const lettersCount = letters.length;
  const letterSpacing = 66;
  const startX = 400 - ((lettersCount - 1) * letterSpacing) / 2;
  const baseFill = option.colors[0] || "#F4F4F4";
  const secondaryColor = option.colors[1] || "#D7BFA7";

  const lettersSvg = letters
    .map((letter, index) => {
      const x = startX + index * letterSpacing;
      const preferredColor =
        option.colors[(index + 1) % option.colors.length] || "#1F2937";
      const textStyle = getReadableColorOnBackground(
        preferredColor,
        baseStyle === "solid" ? baseFill : "#FFFFFF",
      );

      return `
        <text x="${x}" y="120" text-anchor="middle" fill="${textStyle.fill}" stroke="${textStyle.stroke}" stroke-width="2.6" paint-order="stroke" font-size="56" font-weight="800" font-family="Arial, sans-serif">${letter}</text>
      `;
    })
    .join("");

  const splatters = Array.from({ length: 46 })
    .map((_, index) => {
      const color = option.colors[index % option.colors.length] || "#A9A9A9";
      const x = 108 + ((index * 137) % 578);
      const y = 52 + ((index * 89) % 438);
      const radius = 1.8 + (index % 3);
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" fill-opacity="0.85"/>`;
    })
    .join("");

  const frameSurface =
    baseStyle === "solid"
      ? `<rect x="90" y="40" width="620" height="460" rx="16" fill="${baseFill}"/>`
      : `
        <rect x="90" y="40" width="620" height="460" rx="16" fill="#FFFFFF"/>
        ${splatters}
      `;

  const bearOutfitLeft = baseStyle === "solid" ? secondaryColor : baseFill;
  const bearOutfitRight = baseStyle === "solid" ? baseFill : secondaryColor;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" fill="none">
      <defs>
        <linearGradient id="frameBg" x1="0" y1="0" x2="800" y2="560" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F7FBFF"/>
          <stop offset="1" stop-color="#FFF7F9"/>
        </linearGradient>
      </defs>
      <rect width="800" height="560" rx="24" fill="url(#frameBg)"/>
      ${frameSurface}
      <rect x="220" y="170" width="360" height="250" rx="10" fill="#FFFFFF" stroke="#E6E6E6" stroke-width="3"/>
      ${lettersSvg}

      <g>
        <circle cx="190" cy="458" r="44" fill="#7A5D49"/>
        <circle cx="160" cy="428" r="15" fill="#7A5D49"/>
        <circle cx="220" cy="428" r="15" fill="#7A5D49"/>
        <ellipse cx="190" cy="468" rx="16" ry="12" fill="#F6E7D8"/>
        <rect x="158" y="486" width="64" height="34" rx="10" fill="${bearOutfitLeft}"/>
      </g>

      <g>
        <circle cx="610" cy="458" r="44" fill="#7A5D49"/>
        <circle cx="580" cy="428" r="15" fill="#7A5D49"/>
        <circle cx="640" cy="428" r="15" fill="#7A5D49"/>
        <ellipse cx="610" cy="468" rx="16" ry="12" fill="#F6E7D8"/>
        <rect x="578" y="486" width="64" height="34" rx="10" fill="${bearOutfitRight}"/>
      </g>

      <text x="92" y="534" fill="#6B7280" font-size="20" font-family="Arial, sans-serif">${option.title} | Основа: ${
        baseStyle === "solid" ? "Едноцветна" : "Пръскана"
      }</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getRoundPlatformPreviewDataUri = (
  option: RoundPlatformOption,
  babyName: string,
) => {
  const baseColor = option.colors[0] || "#E5E7EB";
  const secondaryColor = option.colors[1] || "#FFFFFF";
  const accentColor = option.colors[2] || secondaryColor;
  const gradientStops = buildSvgGradientStops(option.colors);
  const letters = getPreviewLetters(babyName, 8);
  const textStyle = getReadableColorOnBackground("#F5E6D8", baseColor);

  const curvedTextSvg = `
    <defs>
      <path id="roundPlatformTextArc" d="M 215 292 A 185 185 0 0 1 585 292" />
    </defs>
    <text fill="${textStyle.fill}" stroke="${textStyle.stroke}" stroke-width="2.2" paint-order="stroke" font-size="52" font-weight="800" font-family="Arial, sans-serif" letter-spacing="5">
      <textPath href="#roundPlatformTextArc" startOffset="50%" text-anchor="middle" dy="14">${letters}</textPath>
    </text>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" fill="none">
      <defs>
        <linearGradient id="roundBg" x1="0" y1="0" x2="800" y2="560" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F8FBFF"/>
          <stop offset="1" stop-color="#FFF7FA"/>
        </linearGradient>
        <linearGradient id="roundPlatformPalette" x1="186" y1="112" x2="614" y2="448" gradientUnits="userSpaceOnUse">
          ${gradientStops}
        </linearGradient>
      </defs>
      <rect width="800" height="560" rx="24" fill="url(#roundBg)"/>
      <circle cx="400" cy="280" r="214" fill="url(#roundPlatformPalette)"/>
      <circle cx="400" cy="280" r="156" fill="${secondaryColor}" stroke="${accentColor}" stroke-width="8"/>
      <rect x="160" y="302" width="480" height="20" rx="10" fill="${accentColor}"/>
      <path d="M312 432h176l40 52H272l40-52z" fill="${baseColor}"/>

      <g>
        <circle cx="285" cy="286" r="34" fill="#7A5D49"/>
        <circle cx="262" cy="263" r="11" fill="#7A5D49"/>
        <circle cx="308" cy="263" r="11" fill="#7A5D49"/>
        <ellipse cx="285" cy="294" rx="12" ry="9" fill="#F6E7D8"/>
      </g>
      <g>
        <circle cx="400" cy="286" r="34" fill="#7A5D49"/>
        <circle cx="377" cy="263" r="11" fill="#7A5D49"/>
        <circle cx="423" cy="263" r="11" fill="#7A5D49"/>
        <ellipse cx="400" cy="294" rx="12" ry="9" fill="#F6E7D8"/>
      </g>
      <g>
        <circle cx="515" cy="286" r="34" fill="#7A5D49"/>
        <circle cx="492" cy="263" r="11" fill="#7A5D49"/>
        <circle cx="538" cy="263" r="11" fill="#7A5D49"/>
        <ellipse cx="515" cy="294" rx="12" ry="9" fill="#F6E7D8"/>
      </g>

      ${curvedTextSvg}
      <text x="82" y="530" fill="#6B7280" font-size="20" font-family="Arial, sans-serif">Комбинация: ${option.title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getPlatformPreviewDataUri = (
  option: PlatformOption,
  babyName: string,
) => {
  const baseColor = option.colors[0] || "#E5E7EB";
  const secondaryColor = option.colors[1] || "#FFFFFF";
  const accentColor = option.colors[2] || secondaryColor;
  const gradientStops = buildSvgGradientStops(option.colors);
  const letters = getPreviewLetters(babyName, 6).split("");
  const lettersCount = letters.length;
  const letterSpacing = 70;
  const startX = 400 - ((lettersCount - 1) * letterSpacing) / 2;
  const textStyle = getReadableColorOnBackground("#F5E6D8", baseColor);

  const lettersSvg = letters
    .map((letter, index) => {
      const x = startX + index * letterSpacing;
      return `<text x="${x}" y="408" text-anchor="middle" fill="${textStyle.fill}" stroke="${textStyle.stroke}" stroke-width="2" paint-order="stroke" font-size="56" font-weight="800" font-family="Arial, sans-serif">${letter}</text>`;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" fill="none">
      <defs>
        <linearGradient id="platformBg" x1="0" y1="0" x2="800" y2="560" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F8FBFF"/>
          <stop offset="1" stop-color="#FFF7FA"/>
        </linearGradient>
        <linearGradient id="platformPalette" x1="120" y1="278" x2="680" y2="442" gradientUnits="userSpaceOnUse">
          ${gradientStops}
        </linearGradient>
      </defs>
      <rect width="800" height="560" rx="24" fill="url(#platformBg)"/>

      <ellipse cx="150" cy="360" rx="52" ry="44" fill="${baseColor}"/>
      <ellipse cx="650" cy="360" rx="52" ry="44" fill="${accentColor}"/>
      <ellipse cx="188" cy="334" rx="35" ry="30" fill="${secondaryColor}" stroke="${baseColor}" stroke-width="2"/>
      <ellipse cx="612" cy="334" rx="35" ry="30" fill="${secondaryColor}" stroke="${accentColor}" stroke-width="2"/>

      <rect x="120" y="278" width="560" height="164" rx="22" fill="url(#platformPalette)"/>
      <rect x="120" y="278" width="560" height="164" rx="22" stroke="#D8D8D8" stroke-width="2"/>

      <g>
        <circle cx="250" cy="246" r="42" fill="#7A5D49"/>
        <circle cx="222" cy="217" r="13" fill="#7A5D49"/>
        <circle cx="278" cy="217" r="13" fill="#7A5D49"/>
        <ellipse cx="250" cy="255" rx="14" ry="10" fill="#F6E7D8"/>
      </g>
      <g>
        <circle cx="400" cy="246" r="42" fill="#7A5D49"/>
        <circle cx="372" cy="217" r="13" fill="#7A5D49"/>
        <circle cx="428" cy="217" r="13" fill="#7A5D49"/>
        <ellipse cx="400" cy="255" rx="14" ry="10" fill="#F6E7D8"/>
      </g>
      <g>
        <circle cx="550" cy="246" r="42" fill="#7A5D49"/>
        <circle cx="522" cy="217" r="13" fill="#7A5D49"/>
        <circle cx="578" cy="217" r="13" fill="#7A5D49"/>
        <ellipse cx="550" cy="255" rx="14" ry="10" fill="#F6E7D8"/>
      </g>

      ${lettersSvg}
      <text x="82" y="530" fill="#6B7280" font-size="20" font-family="Arial, sans-serif">Комбинация: ${option.title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const CustomColorInquiryNote = () => (
  <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-900">
    За различна комбинация от цветове се прави запитване. Пиши ни на{" "}
    <a
      href="mailto:maria_magdalena2003@abv.bg"
      className="font-semibold underline decoration-amber-500/70 underline-offset-2"
    >
      maria_magdalena2003@abv.bg
    </a>{" "}
    или през{" "}
    <Link
      to="/kontakti"
      className="font-semibold underline decoration-amber-500/70 underline-offset-2"
    >
      страницата за контакт
    </Link>
    . Разполагаме и с други нюанси и можем да обсъдим напълно персонална цветова
    комбинация.
  </div>
);

export default function ServiceDetails() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<number | null>(null);
  const [slug, setSlug] = useState("");
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] =
    useState<ClipAudience>("girl");
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    clipOptions[0].id,
  );
  const [selectedDecoration, setSelectedDecoration] = useState<
    ClipDecoration | undefined
  >(clipOptions[0].decorations?.[0]);
  const [selectedClipShape, setSelectedClipShape] = useState<ClipShape>(
    clipShapeOptions[0].id,
  );
  const [selectedBlocksAudience, setSelectedBlocksAudience] =
    useState<ClipAudience>("girl");
  const [selectedBlockOptionId, setSelectedBlockOptionId] = useState<string>(
    blockOptions[0].id,
  );
  const [selectedFrameAudience, setSelectedFrameAudience] =
    useState<ClipAudience>("girl");
  const [selectedFrameOptionId, setSelectedFrameOptionId] = useState<string>(
    frameOptions[0].id,
  );
  const [selectedFrameBaseStyle, setSelectedFrameBaseStyle] =
    useState<FrameBaseStyle>("solid");
  const [selectedRoundPlatformAudience, setSelectedRoundPlatformAudience] =
    useState<ClipAudience>("girl");
  const [selectedRoundPlatformOptionId, setSelectedRoundPlatformOptionId] =
    useState<string>(roundPlatformOptions[0].id);
  const [selectedPlatformAudience, setSelectedPlatformAudience] =
    useState<ClipAudience>("girl");
  const [selectedPlatformOptionId, setSelectedPlatformOptionId] =
    useState<string>(platformOptions[0].id);
  const [babyName, setBabyName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryCourier, setDeliveryCourier] =
    useState<DeliveryCourier>("econt");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("address");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [officeQuery, setOfficeQuery] = useState("");
  const [selectedOffice, setSelectedOffice] =
    useState<DeliveryOfficeSuggestion | null>(null);
  const [officeSuggestions, setOfficeSuggestions] = useState<
    DeliveryOfficeSuggestion[]
  >([]);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [officeSearchError, setOfficeSearchError] = useState<string | null>(
    null,
  );
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [acceptedLegalTerms, setAcceptedLegalTerms] = useState(false);

  const backendBaseUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_BASE_URL;
    if (!configured) {
      return "/backend";
    }

    return configured.replace(/\/+$/, "");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug") || "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadService = async () => {
      if (!slug) {
        if (isMounted) {
          setError("Липсва slug за услугата.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${backendBaseUrl}/services/${encodeURIComponent(slug)}`,
        );

        const responseContentType = response.headers.get("content-type") || "";
        const payload = responseContentType.includes("application/json")
          ? await response.json()
          : null;

        if (!response.ok) {
          const fallback = fallbackServiceDetailsBySlug[slug];
          if (fallback && isMounted) {
            setService(fallback);
            setError(null);
            return;
          }

          throw new Error(
            payload?.message ||
              `Service request failed with status ${response.status}`,
          );
        }

        const item = payload?.service;

        if (!item || typeof item !== "object") {
          throw new Error("Invalid service payload");
        }

        if (isMounted) {
          setService(item as ServiceDetails);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          const fallback = fallbackServiceDetailsBySlug[slug];
          if (fallback) {
            setService(fallback);
            setError(null);
          } else {
            setService(null);
            setError(
              fetchError instanceof Error
                ? fetchError.message
                : "Неуспешно зареждане на услугата",
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadService();

    return () => {
      isMounted = false;
    };
  }, [backendBaseUrl, slug]);

  const optionsForAudience = useMemo(
    () => clipOptions.filter((option) => option.audience === selectedAudience),
    [selectedAudience],
  );

  useEffect(() => {
    const firstOption = optionsForAudience[0];
    if (!firstOption) {
      return;
    }

    const stillVisible = optionsForAudience.some(
      (option) => option.id === selectedOptionId,
    );

    if (!stillVisible) {
      setSelectedOptionId(firstOption.id);
    }
  }, [optionsForAudience, selectedOptionId]);

  const selectedClipOption = useMemo(
    () => clipOptions.find((option) => option.id === selectedOptionId) || null,
    [selectedOptionId],
  );

  const selectedClipShapeOption = useMemo(
    () =>
      clipShapeOptions.find((option) => option.id === selectedClipShape) ||
      null,
    [selectedClipShape],
  );

  const blockOptionsForAudience = useMemo(
    () =>
      blockOptions.filter(
        (option) => option.audience === selectedBlocksAudience,
      ),
    [selectedBlocksAudience],
  );

  const selectedBlockOption = useMemo(
    () =>
      blockOptions.find((option) => option.id === selectedBlockOptionId) ||
      null,
    [selectedBlockOptionId],
  );

  const frameOptionsForAudience = useMemo(
    () =>
      frameOptions.filter(
        (option) => option.audience === selectedFrameAudience,
      ),
    [selectedFrameAudience],
  );

  const selectedFrameOption = useMemo(
    () =>
      frameOptions.find((option) => option.id === selectedFrameOptionId) ||
      null,
    [selectedFrameOptionId],
  );

  const roundPlatformOptionsForAudience = useMemo(
    () =>
      roundPlatformOptions.filter(
        (option) => option.audience === selectedRoundPlatformAudience,
      ),
    [selectedRoundPlatformAudience],
  );

  const selectedRoundPlatformOption = useMemo(
    () =>
      roundPlatformOptions.find(
        (option) => option.id === selectedRoundPlatformOptionId,
      ) || null,
    [selectedRoundPlatformOptionId],
  );

  const platformOptionsForAudience = useMemo(
    () =>
      platformOptions.filter(
        (option) => option.audience === selectedPlatformAudience,
      ),
    [selectedPlatformAudience],
  );

  const selectedPlatformOption = useMemo(
    () =>
      platformOptions.find(
        (option) => option.id === selectedPlatformOptionId,
      ) || null,
    [selectedPlatformOptionId],
  );

  const previewImage = useMemo(() => {
    if (!selectedClipOption) {
      return "";
    }

    return getClipPreviewDataUri(
      selectedClipOption,
      selectedDecoration,
      selectedClipShape,
    );
  }, [selectedClipOption, selectedDecoration, selectedClipShape]);

  const blocksPreviewImage = useMemo(() => {
    if (!selectedBlockOption) {
      return "";
    }

    return getBlocksPreviewDataUri(selectedBlockOption, babyName);
  }, [selectedBlockOption, babyName]);

  const framePreviewImage = useMemo(() => {
    if (!selectedFrameOption) {
      return "";
    }

    return getFramePreviewDataUri(
      selectedFrameOption,
      selectedFrameBaseStyle,
      babyName,
    );
  }, [selectedFrameOption, selectedFrameBaseStyle, babyName]);

  const roundPlatformPreviewImage = useMemo(() => {
    if (!selectedRoundPlatformOption) {
      return "";
    }

    return getRoundPlatformPreviewDataUri(
      selectedRoundPlatformOption,
      babyName,
    );
  }, [selectedRoundPlatformOption, babyName]);

  const platformPreviewImage = useMemo(() => {
    if (!selectedPlatformOption) {
      return "";
    }

    return getPlatformPreviewDataUri(selectedPlatformOption, babyName);
  }, [selectedPlatformOption, babyName]);

  useEffect(() => {
    if (!selectedClipOption) {
      setSelectedDecoration(undefined);
      return;
    }

    const allowedDecorations = selectedClipOption.decorations || [];
    if (allowedDecorations.length === 0) {
      setSelectedDecoration(undefined);
      return;
    }

    if (
      !selectedDecoration ||
      !allowedDecorations.includes(selectedDecoration)
    ) {
      setSelectedDecoration(allowedDecorations[0]);
    }
  }, [selectedClipOption, selectedDecoration]);

  useEffect(() => {
    const firstOption = blockOptionsForAudience[0];
    if (!firstOption) {
      return;
    }

    const stillVisible = blockOptionsForAudience.some(
      (option) => option.id === selectedBlockOptionId,
    );

    if (!stillVisible) {
      setSelectedBlockOptionId(firstOption.id);
    }
  }, [blockOptionsForAudience, selectedBlockOptionId]);

  useEffect(() => {
    const firstOption = frameOptionsForAudience[0];
    if (!firstOption) {
      return;
    }

    const stillVisible = frameOptionsForAudience.some(
      (option) => option.id === selectedFrameOptionId,
    );

    if (!stillVisible) {
      setSelectedFrameOptionId(firstOption.id);
    }
  }, [frameOptionsForAudience, selectedFrameOptionId]);

  useEffect(() => {
    const firstOption = roundPlatformOptionsForAudience[0];
    if (!firstOption) {
      return;
    }

    const stillVisible = roundPlatformOptionsForAudience.some(
      (option) => option.id === selectedRoundPlatformOptionId,
    );

    if (!stillVisible) {
      setSelectedRoundPlatformOptionId(firstOption.id);
    }
  }, [roundPlatformOptionsForAudience, selectedRoundPlatformOptionId]);

  useEffect(() => {
    const firstOption = platformOptionsForAudience[0];
    if (!firstOption) {
      return;
    }

    const stillVisible = platformOptionsForAudience.some(
      (option) => option.id === selectedPlatformOptionId,
    );

    if (!stillVisible) {
      setSelectedPlatformOptionId(firstOption.id);
    }
  }, [platformOptionsForAudience, selectedPlatformOptionId]);

  const bullets = service?.bullets || service?.bulletPoints || [];
  const serviceMeta = getServiceCatalogMeta(slug);
  const heading = serviceMeta?.title || service?.title || "Детайли за услуга";
  const priceLabel = service?.priceLabel || serviceMeta?.priceLabel;
  const customColorInquiryText =
    service?.customColorInquiryText || defaultCustomColorInquiryText;
  const longDescription =
    service?.longDescription ||
    service?.desc ||
    service?.shortDescription ||
    "Няма налично подробно описание за тази услуга.";

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomerName((current) => current || user.fullName || "");
    setCustomerEmail((current) => current || user.email || "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedOffice(null);
    setOfficeSuggestions([]);
    setOfficeSearchError(null);
    setOfficeQuery("");
  }, [deliveryCourier]);

  useEffect(() => {
    if (deliveryType !== "office") {
      setOfficeSuggestions([]);
      setOfficeSearchError(null);
      return;
    }

    const trimmedQuery = officeQuery.trim();
    if (trimmedQuery.length < 2) {
      setOfficeSuggestions([]);
      setOfficeSearchError(null);
      return;
    }

    if (selectedOffice && trimmedQuery === selectedOffice.label) {
      setOfficeSuggestions([]);
      setOfficeSearchError(null);
      return;
    }

    let isCancelled = false;
    setIsLoadingOffices(true);
    setOfficeSearchError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${backendBaseUrl}/delivery/offices?courier=${deliveryCourier}&q=${encodeURIComponent(trimmedQuery)}&limit=14`,
        );
        const payload = (await response.json()) as {
          status?: string;
          message?: string;
          offices?: DeliveryOfficeSuggestion[];
        };

        if (!response.ok || payload.status !== "ok") {
          throw new Error(
            payload.message || "Неуспешно зареждане на офиси за доставка.",
          );
        }

        if (isCancelled) {
          return;
        }

        setOfficeSuggestions(
          Array.isArray(payload.offices) ? payload.offices : [],
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setOfficeSuggestions([]);
        setOfficeSearchError(
          error instanceof Error ? error.message : "Неуспешно търсене на офис.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingOffices(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      setIsLoadingOffices(false);
    };
  }, [
    backendBaseUrl,
    deliveryCourier,
    deliveryType,
    officeQuery,
    selectedOffice,
  ]);

  const submitOrder = async () => {
    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    if (
      !service ||
      (slug !== "pacifier-clips" &&
        slug !== "letter-blocks" &&
        slug !== "photo-frame" &&
        slug !== "round-platform" &&
        slug !== "platform")
    ) {
      return;
    }

    const trimmedBabyName = babyName.trim();
    const isNameRequired =
      slug === "pacifier-clips" ||
      slug === "letter-blocks" ||
      slug === "photo-frame";

    if (isNameRequired && !trimmedBabyName) {
      setOrderError("Моля, въведете име на бебето.");
      setOrderMessage(null);
      return;
    }

    const selectedOption =
      slug === "pacifier-clips"
        ? selectedClipOption
        : slug === "letter-blocks"
          ? selectedBlockOption
          : slug === "photo-frame"
            ? selectedFrameOption
            : slug === "round-platform"
              ? selectedRoundPlatformOption
              : selectedPlatformOption;

    if (!selectedOption) {
      setOrderError("Моля, изберете комбинация за продукта.");
      setOrderMessage(null);
      return;
    }

    const selectedAudienceForOrder =
      slug === "pacifier-clips"
        ? selectedAudience
        : slug === "letter-blocks"
          ? selectedBlocksAudience
          : slug === "photo-frame"
            ? selectedFrameAudience
            : slug === "round-platform"
              ? selectedRoundPlatformAudience
              : selectedPlatformAudience;
    const selectedDecorationForOrder =
      slug === "pacifier-clips" ? selectedDecoration : undefined;
    const selectedDecorationLabelForOrder =
      slug !== "pacifier-clips" || !selectedDecoration
        ? undefined
        : selectedDecoration === "flower"
          ? "Цвете"
          : "Панделка";
    const selectedClipLabelForOrder =
      slug === "pacifier-clips" ? selectedClipShapeOption?.label : undefined;
    const trimmedCustomerName = customerName.trim();
    const trimmedCustomerPhone = customerPhone.trim();
    const trimmedCustomerEmail = customerEmail.trim();
    const trimmedDeliveryAddress = deliveryAddress.trim();
    const phoneDigits = trimmedCustomerPhone.replace(/[^\d]/g, "");
    const selectedOfficeLabel = selectedOffice?.label || "";

    if (!trimmedCustomerName) {
      setOrderError("Моля, въведете име за доставка.");
      setOrderMessage(null);
      return;
    }

    if (
      !trimmedCustomerPhone ||
      phoneDigits.length < 8 ||
      phoneDigits.length > 15
    ) {
      setOrderError("Моля, въведете валиден телефон за доставка.");
      setOrderMessage(null);
      return;
    }

    if (deliveryType === "address" && !trimmedDeliveryAddress) {
      setOrderError("Моля, въведете адрес за доставка.");
      setOrderMessage(null);
      return;
    }

    if (deliveryType === "office" && !selectedOfficeLabel) {
      setOrderError("Моля, изберете офис за доставка.");
      setOrderMessage(null);
      return;
    }

    if (!acceptedLegalTerms) {
      setOrderError(
        "Моля, потвърди, че си съгласен/съгласна с Общите условия и Политиката за поверителност.",
      );
      setOrderMessage(null);
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);
    setOrderMessage(null);

    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${backendBaseUrl}/orders`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          serviceSlug: slug,
          serviceTitle: heading,
          selectedAudience: selectedAudienceForOrder,
          selectedOptionId: selectedOption.id,
          selectedOptionLabel: selectedOption.title,
          selectedClipId:
            slug === "pacifier-clips" ? selectedClipShape : undefined,
          selectedClipLabel: selectedClipLabelForOrder,
          selectedDecoration: selectedDecorationForOrder,
          selectedDecorationLabel: selectedDecorationLabelForOrder,
          frameBaseStyle:
            slug === "photo-frame" ? selectedFrameBaseStyle : undefined,
          babyName: trimmedBabyName,
          customerName: trimmedCustomerName,
          customerPhone: trimmedCustomerPhone,
          customerEmail: trimmedCustomerEmail,
          deliveryCourier,
          deliveryType,
          deliveryAddress:
            deliveryType === "address" ? trimmedDeliveryAddress : "",
          deliveryOfficeId:
            deliveryType === "office"
              ? selectedOffice?.officeId || selectedOffice?.id || ""
              : "",
          deliveryOfficeLabel:
            deliveryType === "office"
              ? selectedOfficeLabel || officeQuery.trim()
              : "",
          deliveryOfficeAddress:
            deliveryType === "office" ? selectedOffice?.address || "" : "",
          paymentMethod: "cod",
        }),
      });

      const payload = (await response.json()) as {
        status?: string;
        message?: string;
        orderId?: string;
        email?: {
          sentAdmin?: boolean;
          sentCustomer?: boolean;
          skipped?: boolean;
          reason?: string;
        };
      };

      if (!response.ok || payload.status !== "ok") {
        throw new Error(payload.message || "Неуспешно изпращане на поръчката.");
      }

      const emailNotice = payload.email?.skipped
        ? ` Имейлът още не е активен (${payload.email.reason || "липсва SMTP конфигурация"}).`
        : payload.email?.sentCustomer === false && trimmedCustomerEmail
          ? ` Поръчката е приета, но не успяхме да пратим имейл към клиента (${payload.email.reason || "провери SMTP настройките"}).`
          : "";

      setOrderMessage(
        `Всичко е успешно! Благодарим за доверието. Поръчката е приета${payload.orderId ? ` (ID: ${payload.orderId})` : ""}.${emailNotice} Пренасочваме към началната страница...`,
      );
      setOrderError(null);
      setBabyName("");
      setDeliveryAddress("");
      setOfficeQuery("");
      setSelectedOffice(null);
      setOfficeSuggestions([]);
      setOfficeSearchError(null);
      setAcceptedLegalTerms(false);
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 1700);
    } catch (submitError) {
      setOrderError(
        submitError instanceof Error
          ? submitError.message
          : "Възникна проблем при изпращане на поръчката.",
      );
      setOrderMessage(null);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const renderCustomerFields = (nameFieldId: string, emailFieldId: string) => (
    <>
      <div className="grid gap-3 mb-5">
        <label htmlFor={nameFieldId} className="text-sm font-heading font-bold">
          Твоето име за доставка *
        </label>
        <input
          id={nameFieldId}
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Пример: Мария Петрова"
          maxLength={80}
          className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="grid gap-3 mb-5">
        <label
          htmlFor={emailFieldId}
          className="text-sm font-heading font-bold"
        >
          Имейл за потвърждение (по желание)
        </label>
        <input
          id={emailFieldId}
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          placeholder="example@email.com"
          maxLength={160}
          className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
    </>
  );

  const renderDeliveryFields = (prefix: string) => (
    <>
      <div className="grid gap-3 mb-5">
        <label
          htmlFor={`${prefix}-customer-phone`}
          className="text-sm font-heading font-bold"
        >
          Телефон за доставка *
        </label>
        <input
          id={`${prefix}-customer-phone`}
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          placeholder="Пример: 0888123456"
          maxLength={20}
          className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="grid gap-3 mb-5">
        <p className="text-sm font-heading font-bold">Куриер *</p>
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <button
            type="button"
            onClick={() => setDeliveryCourier("econt")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              deliveryCourier === "econt"
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/60 hover:bg-muted"
            }`}
          >
            Еконт
          </button>
          <button
            type="button"
            onClick={() => setDeliveryCourier("speedy")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              deliveryCourier === "speedy"
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/60 hover:bg-muted"
            }`}
          >
            Спиди
          </button>
        </div>
      </div>

      <div className="grid gap-3 mb-5">
        <p className="text-sm font-heading font-bold">Тип доставка *</p>
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <button
            type="button"
            onClick={() => setDeliveryType("address")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              deliveryType === "address"
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/60 hover:bg-muted"
            }`}
          >
            До адрес
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("office")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              deliveryType === "office"
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/60 hover:bg-muted"
            }`}
          >
            До офис
          </button>
        </div>
      </div>

      {deliveryType === "address" ? (
        <div className="grid gap-3 mb-5">
          <label
            htmlFor={`${prefix}-delivery-address`}
            className="text-sm font-heading font-bold"
          >
            Адрес за доставка *
          </label>
          <input
            id={`${prefix}-delivery-address`}
            type="text"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="Град, квартал, улица, номер"
            maxLength={220}
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      ) : (
        <div className="grid gap-3 mb-5">
          <label
            htmlFor={`${prefix}-delivery-office`}
            className="text-sm font-heading font-bold"
          >
            Избери офис *
          </label>
          <input
            id={`${prefix}-delivery-office`}
            type="text"
            value={officeQuery}
            onChange={(event) => {
              const nextValue = event.target.value;
              setOfficeQuery(nextValue);
              if (selectedOffice && nextValue !== selectedOffice.label) {
                setSelectedOffice(null);
              }
            }}
            placeholder={`Напиши офис на ${
              deliveryCourier === "econt" ? "Еконт" : "Спиди"
            }...`}
            maxLength={220}
            autoComplete="off"
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          {isLoadingOffices ? (
            <p className="text-xs text-muted-foreground">Търсим офиси...</p>
          ) : null}

          {officeSuggestions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-border/60 bg-background">
              {officeSuggestions.map((office) => (
                <button
                  key={office.id}
                  type="button"
                  onClick={() => {
                    setSelectedOffice(office);
                    setOfficeQuery(office.label);
                    setOfficeSuggestions([]);
                    setOfficeSearchError(null);
                  }}
                  className="w-full border-b border-border/40 px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted"
                >
                  {office.label}
                  {office.address ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {office.address}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {selectedOffice ? (
            <p className="text-xs text-emerald-700">
              Избран офис: {selectedOffice.label}
            </p>
          ) : null}

          {officeSearchError ? (
            <p className="text-xs text-red-600">{officeSearchError}</p>
          ) : null}
        </div>
      )}

      <div className="mb-5 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm">
        <p className="font-heading font-bold">Начин на плащане</p>
        <p className="text-muted-foreground">Наложен платеж</p>
      </div>
    </>
  );

  return (
    <main>
      <section className="bg-baby-blue-light/50 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-7 md:p-12">
            <p className="text-sm text-muted-foreground mb-4">Услуга</p>
            <h1 className="mb-4 font-heading text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {heading}
            </h1>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Зареждане...</p>
            ) : error ? (
              <p className="text-sm text-red-600">Грешка: {error}</p>
            ) : (
              <>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                  {longDescription}
                </p>

                {priceLabel ? (
                  <div className="mb-6 rounded-3xl border border-primary/15 bg-primary/5 p-5 md:p-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Цена
                    </p>
                    <p className="mb-2 font-heading text-2xl font-extrabold md:text-3xl">
                      {priceLabel}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {standardServicePriceNote} {customColorInquiryText}
                    </p>
                  </div>
                ) : null}

                {bullets.length > 0 ? (
                  <ul className="space-y-2 mb-8">
                    {bullets.map((item) => (
                      <li
                        key={item}
                        className="text-sm md:text-base text-foreground"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {slug === "pacifier-clips" ? (
                  <div className="rounded-3xl border border-border/60 bg-background p-5 md:p-6 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Меню за избор
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Клипсове за биберон с име
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Избери подкатегория и вариант. За всяка подкатегория се
                      показва отделна визуализация.
                    </p>

                    <CustomColorInquiryNote />

                    {selectedClipOption ? (
                      <img
                        src={previewImage}
                        alt={`Визуализация: ${selectedClipOption.title}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери подкатегория
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAudience("girl")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedAudience === "girl"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момичета
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAudience("boy")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedAudience === "boy"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момчета
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери вариант
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {optionsForAudience.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedOptionId(option.id)}
                            className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedOptionId === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            <span className="block font-semibold text-foreground">
                              {option.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedClipOption?.decorations?.length ? (
                      <div className="grid gap-3 mb-5">
                        <p className="text-sm font-heading font-bold">
                          3) Избери елемент
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedClipOption.decorations.map((decoration) => (
                            <button
                              key={decoration}
                              type="button"
                              onClick={() => setSelectedDecoration(decoration)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                selectedDecoration === decoration
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {decoration === "flower" ? "Цвете" : "Панделка"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        {selectedClipOption?.decorations?.length
                          ? "4) Избери щипка"
                          : "3) Избери щипка"}
                      </p>
                      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
                        {clipShapeOptions.map((clipShape) => (
                          <button
                            key={clipShape.id}
                            type="button"
                            onClick={() => setSelectedClipShape(clipShape.id)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                              selectedClipShape === clipShape.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            {clipShape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="baby-name"
                        className="text-sm font-heading font-bold"
                      >
                        {selectedClipOption?.decorations?.length
                          ? "5) Въведи име на бебето"
                          : "4) Въведи име на бебето"}
                      </label>
                      <input
                        id="baby-name"
                        type="text"
                        value={babyName}
                        onChange={(event) => setBabyName(event.target.value)}
                        placeholder="Пример: Алекс"
                        maxLength={20}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-name"
                        className="text-sm font-heading font-bold"
                      >
                        {selectedClipOption?.decorations?.length
                          ? "6) Твоето име за доставка *"
                          : "5) Твоето име за доставка *"}
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        placeholder="Пример: Мария"
                        maxLength={80}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-email"
                        className="text-sm font-heading font-bold"
                      >
                        {selectedClipOption?.decorations?.length
                          ? "7) Имейл за потвърждение (по желание)"
                          : "6) Имейл за потвърждение (по желание)"}
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(event) =>
                          setCustomerEmail(event.target.value)
                        }
                        placeholder="example@email.com"
                        maxLength={160}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {renderDeliveryFields("pacifier")}
                  </div>
                ) : null}

                {slug === "letter-blocks" ? (
                  <div className="rounded-3xl border border-border/60 bg-background p-5 md:p-6 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Меню за избор
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Кубчета с име
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Избери подкатегория и вариант. Визуализацията се обновява
                      за всяка комбинация.
                    </p>

                    {selectedBlockOption ? (
                      <img
                        src={blocksPreviewImage}
                        alt={`Визуализация: ${selectedBlockOption.title}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери подкатегория
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBlocksAudience("girl")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedBlocksAudience === "girl"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момичета
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBlocksAudience("boy")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedBlocksAudience === "boy"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момчета
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери вариант
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {blockOptionsForAudience.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedBlockOptionId(option.id)}
                            className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedBlockOptionId === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            <span className="block font-semibold text-foreground">
                              {option.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <CustomColorInquiryNote />

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="blocks-name"
                        className="text-sm font-heading font-bold"
                      >
                        3) Въведи име за кубчетата
                      </label>
                      <input
                        id="blocks-name"
                        type="text"
                        value={babyName}
                        onChange={(event) => setBabyName(event.target.value)}
                        placeholder="Пример: София"
                        maxLength={20}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-name-blocks"
                        className="text-sm font-heading font-bold"
                      >
                        4) Твоето име за доставка *
                      </label>
                      <input
                        id="customer-name-blocks"
                        type="text"
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        placeholder="Пример: Мария"
                        maxLength={80}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-email-blocks"
                        className="text-sm font-heading font-bold"
                      >
                        5) Имейл за потвърждение (по желание)
                      </label>
                      <input
                        id="customer-email-blocks"
                        type="email"
                        value={customerEmail}
                        onChange={(event) =>
                          setCustomerEmail(event.target.value)
                        }
                        placeholder="example@email.com"
                        maxLength={160}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {renderDeliveryFields("blocks")}
                  </div>
                ) : null}

                {slug === "photo-frame" ? (
                  <div className="rounded-3xl border border-border/60 bg-background p-5 md:p-6 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Меню за избор
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Рамка за снимка с име
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Цветовете са като при Кубчетата. Избери и тип основа:
                      едноцветна или пръскана.
                    </p>

                    {selectedFrameOption ? (
                      <img
                        src={framePreviewImage}
                        alt={`Визуализация: ${selectedFrameOption.title}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери подкатегория
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFrameAudience("girl")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedFrameAudience === "girl"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момичета
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFrameAudience("boy")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedFrameAudience === "boy"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момчета
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери цветова комбинация
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {frameOptionsForAudience.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedFrameOptionId(option.id)}
                            className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedFrameOptionId === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            <span className="block font-semibold text-foreground">
                              {option.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <CustomColorInquiryNote />

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        3) Избери основа
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFrameBaseStyle("solid")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedFrameBaseStyle === "solid"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Едноцветна основа
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFrameBaseStyle("splatter")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedFrameBaseStyle === "splatter"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Пръскана основа
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="frame-name"
                        className="text-sm font-heading font-bold"
                      >
                        4) Въведи име за рамката
                      </label>
                      <input
                        id="frame-name"
                        type="text"
                        value={babyName}
                        onChange={(event) => setBabyName(event.target.value)}
                        placeholder="Пример: Теодор"
                        maxLength={24}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-name-frame"
                        className="text-sm font-heading font-bold"
                      >
                        5) Твоето име за доставка *
                      </label>
                      <input
                        id="customer-name-frame"
                        type="text"
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        placeholder="Пример: Мария"
                        maxLength={80}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="customer-email-frame"
                        className="text-sm font-heading font-bold"
                      >
                        6) Имейл за потвърждение (по желание)
                      </label>
                      <input
                        id="customer-email-frame"
                        type="email"
                        value={customerEmail}
                        onChange={(event) =>
                          setCustomerEmail(event.target.value)
                        }
                        placeholder="example@email.com"
                        maxLength={160}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {renderDeliveryFields("frame")}
                  </div>
                ) : null}

                {slug === "round-platform" ? (
                  <div className="rounded-3xl border border-border/60 bg-background p-5 md:p-6 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Меню за избор
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Кръгла платформа
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Избери една от готовите цветови комбинации за момиче или
                      момче. Показваме визуализация, не снимка.
                    </p>

                    <CustomColorInquiryNote />

                    {selectedRoundPlatformOption ? (
                      <img
                        src={roundPlatformPreviewImage}
                        alt={`Визуализация: ${selectedRoundPlatformOption.title}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери подкатегория
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRoundPlatformAudience("girl")
                          }
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedRoundPlatformAudience === "girl"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момиче
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRoundPlatformAudience("boy")
                          }
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedRoundPlatformAudience === "boy"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момче
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери цветова комбинация
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {roundPlatformOptionsForAudience.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setSelectedRoundPlatformOptionId(option.id)
                            }
                            className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedRoundPlatformOptionId === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            <span className="block font-semibold text-foreground">
                              {option.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="round-platform-name"
                        className="text-sm font-heading font-bold"
                      >
                        3) Име за надпис (по желание)
                      </label>
                      <input
                        id="round-platform-name"
                        type="text"
                        value={babyName}
                        onChange={(event) => setBabyName(event.target.value)}
                        placeholder="Пример: Ивон"
                        maxLength={24}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {renderCustomerFields(
                      "customer-name-round-platform",
                      "customer-email-round-platform",
                    )}
                    {renderDeliveryFields("round-platform")}
                  </div>
                ) : null}

                {slug === "platform" ? (
                  <div className="rounded-3xl border border-border/60 bg-background p-5 md:p-6 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Меню за избор
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Полуовална платформа
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Избери една от готовите цветови комбинации за момиче или
                      момче. Показваме визуализация, не снимка.
                    </p>

                    <CustomColorInquiryNote />

                    {selectedPlatformOption ? (
                      <img
                        src={platformPreviewImage}
                        alt={`Визуализация: ${selectedPlatformOption.title}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери подкатегория
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlatformAudience("girl")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedPlatformAudience === "girl"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момиче
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPlatformAudience("boy")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            selectedPlatformAudience === "boy"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          Момче
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери цветова комбинация
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {platformOptionsForAudience.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setSelectedPlatformOptionId(option.id)
                            }
                            className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedPlatformOptionId === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border/60 hover:border-primary/60 hover:bg-muted"
                            }`}
                          >
                            <span className="block font-semibold text-foreground">
                              {option.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <label
                        htmlFor="platform-name"
                        className="text-sm font-heading font-bold"
                      >
                        3) Име за надпис (по желание)
                      </label>
                      <input
                        id="platform-name"
                        type="text"
                        value={babyName}
                        onChange={(event) => setBabyName(event.target.value)}
                        placeholder="Пример: Иван"
                        maxLength={24}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {renderCustomerFields(
                      "customer-name-platform",
                      "customer-email-platform",
                    )}
                    {renderDeliveryFields("platform")}
                  </div>
                ) : null}
              </>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="flex w-full items-start gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm text-foreground/90">
                <input
                  type="checkbox"
                  checked={acceptedLegalTerms}
                  onChange={(event) =>
                    setAcceptedLegalTerms(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  Прочетох и приемам{" "}
                  <Link
                    to="/obshti-usloviya"
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    Общите условия
                  </Link>{" "}
                  и{" "}
                  <Link
                    to="/poveritelnost"
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    Политиката за поверителност
                  </Link>
                  .
                </span>
              </label>
              <Link
                to="/uslugi"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-heading font-bold transition-all hover:bg-muted sm:w-auto"
              >
                ← Назад към услуги
              </Link>
              <button
                type="button"
                onClick={submitOrder}
                disabled={isSubmittingOrder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-heading font-bold text-primary-foreground transition-all hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isSubmittingOrder
                  ? "Изпращаме поръчката..."
                  : "Изпрати поръчка"}
              </button>
            </div>
            {orderMessage ? (
              <p className="mt-3 text-sm text-green-700">{orderMessage}</p>
            ) : null}
            {orderError ? (
              <p className="mt-3 text-sm text-red-600">{orderError}</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
