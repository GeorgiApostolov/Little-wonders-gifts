import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Baby,
  Box,
  Circle,
  Clock3,
  Gift,
  Image,
  Palette,
  PartyPopper,
} from "lucide-react";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";
import {
  customColorInquiryText,
  getServiceCatalogMeta,
  normalizeServiceSlug,
} from "@/lib/serviceCatalog";

type ServiceItem = {
  slug?: string;
  icon?: string;
  image?: string;
  title: string;
  desc: string;
  cta?: string;
  order?: number;
  priceLabel?: string;
  customColorInquiryText?: string;
};

type ServicesApiPayload = {
  status?: string;
  message?: string;
  services?: ServiceItem[];
};

type ServicesCacheEntry = {
  savedAt: number;
  services: ServiceItem[];
};

const fallbackServiceCards: ServiceItem[] = [
  {
    slug: "pacifier-clips",
    icon: "baby",
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
    order: 1,
  },
  {
    slug: "photo-frame",
    icon: "image",
    title: "Рамка за снимка",
    desc: "Нежна рамка за снимка с име по желание на бебето. Специален спомен, който остава красив акцент в детската стая.",
    cta: "Поръчай рамка",
    order: 3,
  },
  {
    slug: "platform",
    icon: "palette",
    title: "Полуовална платформа",
    desc: "Декоративна полуовална платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Виж варианти",
    order: 4,
  },
  {
    slug: "round-platform",
    icon: "circle",
    title: "Кръгла платформа",
    desc: "Кръгла декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Избери модел",
    order: 5,
  },
  {
    slug: "letter-blocks",
    icon: "box",
    title: "Кубчета",
    desc: "Декоративни кубчета само с букви за изписване на името на бебето. Идеални за фотосесия, украса или специален повод.",
    cta: "Направи запитване",
    order: 6,
  },
];

const iconMap = {
  palette: Palette,
  baby: Baby,
  image: Image,
  circle: Circle,
  box: Box,
  party: PartyPopper,
  gift: Gift,
} as const;

const normalizeServiceItem = (service: ServiceItem): ServiceItem => ({
  ...service,
  slug: normalizeServiceSlug(service.slug),
});

const servicesCacheStorageKey = "lw_services_cache_v1";
const servicesCacheTtlMs = 5 * 60 * 1000;

let inMemoryServicesCache: ServicesCacheEntry | null = null;

const isCacheFresh = (cacheEntry: ServicesCacheEntry) =>
  Date.now() - cacheEntry.savedAt <= servicesCacheTtlMs;

const sanitizeServices = (services: ServiceItem[]) =>
  services
    .filter(
      (service): service is ServiceItem =>
        Boolean(service) && typeof service === "object",
    )
    .map((service) => normalizeServiceItem(service))
    .filter(
      (service) =>
        typeof service.title === "string" &&
        service.title.trim().length > 0 &&
        typeof service.desc === "string" &&
        service.desc.trim().length > 0,
    );

const readCachedServices = (): ServiceItem[] | null => {
  if (
    inMemoryServicesCache &&
    isCacheFresh(inMemoryServicesCache) &&
    inMemoryServicesCache.services.length > 0
  ) {
    return inMemoryServicesCache.services;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(servicesCacheStorageKey);
    if (!rawCache) {
      return null;
    }

    const parsedCache = JSON.parse(rawCache) as Partial<ServicesCacheEntry>;
    if (
      typeof parsedCache.savedAt !== "number" ||
      !Array.isArray(parsedCache.services)
    ) {
      window.localStorage.removeItem(servicesCacheStorageKey);
      return null;
    }

    const cacheEntry: ServicesCacheEntry = {
      savedAt: parsedCache.savedAt,
      services: sanitizeServices(parsedCache.services as ServiceItem[]),
    };

    if (!isCacheFresh(cacheEntry) || cacheEntry.services.length === 0) {
      window.localStorage.removeItem(servicesCacheStorageKey);
      return null;
    }

    inMemoryServicesCache = cacheEntry;
    return cacheEntry.services;
  } catch {
    return null;
  }
};

const persistServicesCache = (services: ServiceItem[]) => {
  const sanitizedServices = sanitizeServices(services);
  if (sanitizedServices.length === 0) {
    return;
  }

  const cacheEntry: ServicesCacheEntry = {
    savedAt: Date.now(),
    services: sanitizedServices,
  };

  inMemoryServicesCache = cacheEntry;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      servicesCacheStorageKey,
      JSON.stringify(cacheEntry),
    );
  } catch {
    // Ignore storage quota errors and keep in-memory cache only.
  }
};

const plannedImageBySlug: Record<string, string> = {
  "pacifier-clips": "/images/services/klipsove.jpg",
  "photo-frame": "/images/services/ramki.jpg",
  platform: "/images/services/platforma.jpg",
  "round-platform": "/images/services/krugla%20platforma.jpg",
  "letter-blocks": "/images/services/kubcheta.jpg",
};

const placeholderPaletteBySlug: Record<string, { from: string; to: string }> = {
  "pacifier-clips": { from: "#FFE4F1", to: "#DDEEFF" },
  "photo-frame": { from: "#FFF3D9", to: "#F5E8FF" },
  platform: { from: "#E3F7EE", to: "#DCEBFF" },
  "round-platform": { from: "#FDE9E9", to: "#E4F4FF" },
  "letter-blocks": { from: "#F4F0FF", to: "#FFEEDB" },
};

const createServicePlaceholder = (slug?: string) => {
  const palette =
    (slug && placeholderPaletteBySlug[slug]) ||
    ({ from: "#EAF4FF", to: "#FFEAF2" } as const);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
      <defs>
        <linearGradient id="serviceGradient" x1="0" y1="0" x2="1200" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}" />
          <stop offset="1" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="42" fill="url(#serviceGradient)" />
      <circle cx="1010" cy="120" r="110" fill="white" fill-opacity="0.32" />
      <circle cx="200" cy="760" r="160" fill="white" fill-opacity="0.26" />
      <rect x="110" y="640" width="980" height="150" rx="30" fill="white" fill-opacity="0.72" />
      <text x="160" y="730" fill="#55606F" font-size="34" font-family="system-ui, -apple-system, sans-serif">Добави твоя снимка в /public/images/services</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const Services = () => {
  const cachedServices = useMemo(() => readCachedServices(), []);
  const [serviceCards, setServiceCards] = useState<ServiceItem[]>(
    () => cachedServices || fallbackServiceCards,
  );
  const [isLoading, setIsLoading] = useState(!cachedServices);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const backendBaseUrl = useMemo(() => getBackendBaseUrl(), []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadServices = async () => {
      if (!cachedServices) {
        setIsLoading(true);
      }

      setFetchError(null);

      try {
        const response = await fetch(`${backendBaseUrl}/services`, {
          signal: abortController.signal,
          headers: {
            Accept: "application/json",
          },
        });

        const payload = await readJsonResponse<ServicesApiPayload>(response);

        if (!response.ok) {
          throw new Error(
            parseApiErrorMessage(payload, "Неуспешно зареждане на услугите."),
          );
        }

        const services = Array.isArray(payload.services) ? payload.services : [];
        const normalizedServices = sanitizeServices(services);

        if (isMounted) {
          const resolvedServices =
            normalizedServices.length > 0
              ? normalizedServices
              : fallbackServiceCards;

          persistServicesCache(resolvedServices);
          setServiceCards(
            resolvedServices,
          );
          setFetchError(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Неуспешно зареждане на услугите";

          setServiceCards((currentCards) =>
            currentCards.length > 0 ? currentCards : fallbackServiceCards,
          );

          if (!cachedServices) {
            setFetchError(message);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [backendBaseUrl, cachedServices]);

  const orderedServiceCards = useMemo(
    () =>
      [...serviceCards].sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER),
      ),
    [serviceCards],
  );

  return (
    <main>
      {/* Services */}
      <section className="bg-baby-blue-light/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-heading text-3xl font-extrabold md:text-5xl">
              Нашите <span className="text-primary">услуги</span> 🎨
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Разгледай стандартните цени и готовите варианти. За различна
              комбинация от цветове се прави запитване.
            </p>
            {isLoading ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Зареждане на услуги...
              </p>
            ) : null}
            {fetchError ? (
              <p className="mt-2 text-xs text-amber-700">
                Показваме стандартните услуги. Причина: {fetchError}
              </p>
            ) : null}
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orderedServiceCards.map((service) => {
              const iconKey =
                typeof service.icon === "string"
                  ? service.icon.toLowerCase()
                  : "gift";
              const Icon = iconMap[iconKey as keyof typeof iconMap] || Gift;
              const slug = normalizeServiceSlug(service.slug);
              const serviceMeta = getServiceCatalogMeta(slug);
              const title = serviceMeta?.title || service.title;
              const priceLabel = service.priceLabel || serviceMeta?.priceLabel;
              const placeholderImage = createServicePlaceholder(slug);
              const imageSrc =
                (slug ? plannedImageBySlug[slug] || "" : "") ||
                (typeof service.image === "string" && service.image.trim()) ||
                placeholderImage;

              return (
                <div
                  key={slug || service.title}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                    <img
                      src={imageSrc}
                      alt={`Снимка за ${title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(event) => {
                        const img = event.currentTarget;
                        img.onerror = null;
                        img.src = placeholderImage;
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                    {priceLabel ? (
                      <div className="absolute left-4 top-4 rounded-2xl bg-primary px-3 py-2 text-primary-foreground shadow-sm">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
                          Цена
                        </span>
                        <span className="font-heading text-sm font-extrabold">
                          {priceLabel}
                        </span>
                      </div>
                    ) : null}
                    <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 shadow-sm backdrop-blur">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                    <h2 className="font-heading text-xl font-bold leading-tight">
                      {title}
                    </h2>
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      {service.desc}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {service.customColorInquiryText || customColorInquiryText}
                    </p>
                    <Link
                      to={
                        slug
                          ? `/uslugi/usluga?slug=${encodeURIComponent(slug)}`
                          : "/uslugi"
                      }
                      className="inline-flex self-start rounded-full bg-primary px-5 py-2.5 font-heading text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-rose-dark"
                    >
                      {service.cta || "Свържи се с нас"} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Info */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center font-heading text-3xl font-extrabold md:text-4xl">
            Полезна <span className="text-primary">информация</span> ℹ️
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-baby-blue-light">
                <Clock3 className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold">
                Срок на изработка
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Изработката на продуктите е обикновено между 5 и 7 работни дни,
                според сложността на поръчката.
              </p>
            </div>

            <div className="rounded-3xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-baby-blue-light">
                <Palette className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold">
                Цени и цветове
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Цените са за показаните стандартни варианти. За различна
                цветова комбинация се прави запитване.
              </p>
            </div>

            <div className="rounded-3xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-baby-blue-light">
                <PartyPopper className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold">
                Подаръци за гости
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Приемам поръчки и за подаръци за гости за кръщене, погача и
                рожден ден.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
