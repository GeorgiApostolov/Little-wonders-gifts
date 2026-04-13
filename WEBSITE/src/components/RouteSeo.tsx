import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  getServiceCatalogMeta,
  normalizeServiceSlug,
} from "@/lib/serviceCatalog";

const siteName = "Little Wonders Gifts";
const siteUrl = "https://littlewondersgifts.com";
const siteLogoUrl = `${siteUrl}/logo.webp`;

type RouteSeoConfig = {
  pageName: string;
  description: string;
};

type ServiceSeoConfig = {
  description: string;
  imagePath: string;
  priceEur?: string;
};

type ResolvedSeo = {
  pageName: string;
  title: string;
  description: string;
  canonicalPath: string;
  serviceSlug?: string;
  serviceTitle?: string;
};

const routeSeoByPath: Record<string, RouteSeoConfig> = {
  "/": {
    pageName: "Начална страница",
    description:
      "Ръчно изработени подаръци за бебета и деца, създадени с любов и внимание към всеки детайл.",
  },
  "/galeriya": {
    pageName: "Галерия",
    description:
      "Разгледай реални снимки на ръчно изработени подаръци, персонализирани за специални поводи.",
  },
  "/za-nas": {
    pageName: "За нас",
    description:
      "Научи повече за Little Wonders Gifts и начина, по който създаваме персонализирани подаръци.",
  },
  "/uslugi": {
    pageName: "Услуги",
    description:
      "Разгледай всички услуги и стандартни варианти за ръчно изработени подаръци.",
  },
  "/kontakti": {
    pageName: "Контакти",
    description:
      "Свържи се с Little Wonders Gifts за поръчки, въпроси и персонализирани запитвания.",
  },
  "/vhod": {
    pageName: "Вход",
    description: "Влез в профила си в Little Wonders Gifts.",
  },
  "/registracia": {
    pageName: "Регистрация",
    description:
      "Създай профил в Little Wonders Gifts и управлявай поръчките си.",
  },
  "/profil": {
    pageName: "Профил",
    description:
      "Прегледай профила и данните за поръчки в Little Wonders Gifts.",
  },
  "/admin": {
    pageName: "Админ панел",
    description: "Административен панел за управление на съдържание и поръчки.",
  },
  "/obshti-usloviya": {
    pageName: "Общи условия",
    description: "Прегледай общите условия на Little Wonders Gifts.",
  },
  "/poveritelnost": {
    pageName: "Поверителност",
    description:
      "Запознай се с политиката за поверителност на Little Wonders Gifts.",
  },
  "/biskvitki": {
    pageName: "Политика за бисквитки",
    description:
      "Информация за използването на бисквитки в Little Wonders Gifts.",
  },
  "/gdpr-prava": {
    pageName: "GDPR права",
    description:
      "Информация за правата ти по GDPR и заявките към Little Wonders Gifts.",
  },
};

const serviceSeoBySlug: Record<string, ServiceSeoConfig> = {
  "pacifier-clips": {
    description:
      "Клипсове за биберон с име от Little Wonders Gifts. Избери цветове, форма на щипка и персонализация.",
    imagePath: "/images/services/klipsove.jpg",
    priceEur: "20",
  },
  "photo-frame": {
    description:
      "Рамка за снимка с име и персонализация от Little Wonders Gifts. Подходяща за подарък и декорация.",
    imagePath: "/images/services/ramki.jpg",
    priceEur: "25",
  },
  platform: {
    description:
      "Полуовална платформа за декорация и фотосесии от Little Wonders Gifts.",
    imagePath: "/images/services/platforma.jpg",
    priceEur: "30",
  },
  "round-platform": {
    description:
      "Кръгла платформа за празнични декорации и фотосесии от Little Wonders Gifts.",
    imagePath: "/images/services/krugla%20platforma.jpg",
    priceEur: "35",
  },
  "letter-blocks": {
    description: "Кубчета с букви за изписване на име от Little Wonders Gifts.",
    imagePath: "/images/services/kubcheta.jpg",
    priceEur: "5",
  },
};

const fallbackSeo: RouteSeoConfig = {
  pageName: "Страницата не е намерена",
  description: "Търсената страница не е налична в Little Wonders Gifts.",
};

const buildTitle = (pageName: string) => `${pageName} | ${siteName}`;

const upsertMeta = ({
  name,
  property,
  content,
}: {
  name?: string;
  property?: string;
  content: string;
}) => {
  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;

  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    if (name) {
      tag.setAttribute("name", name);
    }
    if (property) {
      tag.setAttribute("property", property);
    }
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector(
    "link[rel='canonical']",
  ) as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

const upsertJsonLd = (
  structuredData: Record<string, unknown> | Record<string, unknown>[],
) => {
  let scriptTag = document.head.querySelector(
    "script[data-route-seo-jsonld='true']",
  ) as HTMLScriptElement | null;

  if (!scriptTag) {
    scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "application/ld+json");
    scriptTag.setAttribute("data-route-seo-jsonld", "true");
    document.head.appendChild(scriptTag);
  }

  scriptTag.textContent = JSON.stringify(structuredData);
};

const buildWebPageJsonLd = (
  seo: ResolvedSeo,
  canonicalUrl: string,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: seo.pageName,
  description: seo.description,
  url: canonicalUrl,
  inLanguage: "bg-BG",
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: siteLogoUrl,
    },
  },
});

const buildServiceJsonLd = (
  seo: ResolvedSeo,
  canonicalUrl: string,
): Record<string, unknown> | null => {
  if (!seo.serviceSlug || !seo.serviceTitle) {
    return null;
  }

  const serviceSeo = serviceSeoBySlug[seo.serviceSlug];
  const serviceData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.serviceTitle,
    serviceType: seo.serviceTitle,
    description: seo.description,
    url: canonicalUrl,
    areaServed: {
      "@type": "Country",
      name: "Bulgaria",
    },
    availableLanguage: ["bg"],
    provider: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: siteLogoUrl,
      },
    },
    category: "Ръчно изработени подаръци за бебета и деца",
  };

  if (serviceSeo?.imagePath) {
    serviceData.image = `${siteUrl}${serviceSeo.imagePath}`;
  }

  if (serviceSeo?.priceEur) {
    serviceData.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "EUR",
      price: serviceSeo.priceEur,
      availability: "https://schema.org/InStock",
    };
  }

  return serviceData;
};

const resolveSeoForRoute = (pathname: string, search: string): ResolvedSeo => {
  if (pathname === "/uslugi/usluga") {
    const searchParams = new URLSearchParams(search);
    const rawSlug = searchParams.get("slug") || undefined;
    const normalizedSlug = normalizeServiceSlug(rawSlug);
    const serviceTitle =
      getServiceCatalogMeta(normalizedSlug)?.title || "Услуга";
    const serviceConfig = normalizedSlug
      ? serviceSeoBySlug[normalizedSlug]
      : undefined;
    const serviceDescription =
      serviceConfig?.description ||
      `${serviceTitle} от ${siteName}. Разгледай варианти, цени и поръчай персонализиран подарък.`;

    return {
      pageName: serviceTitle,
      title: buildTitle(serviceTitle),
      description: serviceDescription,
      canonicalPath: normalizedSlug
        ? `${pathname}?slug=${encodeURIComponent(normalizedSlug)}`
        : pathname,
      serviceSlug: normalizedSlug,
      serviceTitle,
    };
  }

  const routeSeo = routeSeoByPath[pathname] || fallbackSeo;

  return {
    pageName: routeSeo.pageName,
    title: buildTitle(routeSeo.pageName),
    description: routeSeo.description,
    canonicalPath: pathname,
  };
};

const RouteSeo = () => {
  const { pathname, search } = useLocation();

  const seo = useMemo(
    () => resolveSeoForRoute(pathname, search),
    [pathname, search],
  );

  useEffect(() => {
    document.title = seo.title;

    const canonicalUrl = new URL(seo.canonicalPath, siteUrl).toString();

    upsertMeta({ name: "description", content: seo.description });
    upsertMeta({ name: "robots", content: "index, follow" });
    upsertMeta({ property: "og:type", content: "website" });
    upsertMeta({ property: "og:title", content: seo.title });
    upsertMeta({ property: "og:description", content: seo.description });
    upsertMeta({ property: "og:url", content: canonicalUrl });
    upsertMeta({ name: "twitter:card", content: "summary_large_image" });
    upsertMeta({ name: "twitter:title", content: seo.title });
    upsertMeta({ name: "twitter:description", content: seo.description });
    upsertCanonical(canonicalUrl);

    const webpageJsonLd = buildWebPageJsonLd(seo, canonicalUrl);
    const serviceJsonLd = buildServiceJsonLd(seo, canonicalUrl);

    upsertJsonLd(
      serviceJsonLd ? [webpageJsonLd, serviceJsonLd] : webpageJsonLd,
    );
  }, [seo]);

  return null;
};

export default RouteSeo;
