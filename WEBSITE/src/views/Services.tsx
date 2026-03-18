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

type ServiceItem = {
  slug?: string;
  icon?: string;
  image?: string;
  title: string;
  desc: string;
  cta?: string;
  order?: number;
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
    order: 2,
  },
  {
    slug: "platform",
    icon: "palette",
    title: "Платформа",
    desc: "Декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Виж варианти",
    order: 3,
  },
  {
    slug: "round-platform",
    icon: "circle",
    title: "Кръгла платформа",
    desc: "Кръгла декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Избери модел",
    order: 4,
  },
  {
    slug: "letter-blocks",
    icon: "box",
    title: "Кубчета",
    desc: "Декоративни кубчета само с букви за изписване на името на бебето. Идеални за фотосесия, украса или специален повод.",
    cta: "Направи запитване",
    order: 5,
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

const plannedImageBySlug: Record<string, string> = {
  "pacifier-clips": "/images/services/pacifier-clips.jpg",
  "photo-frame": "/images/services/photo-frame.jpg",
  platform: "/images/services/platform.jpg",
  "round-platform": "/images/services/round-platform.jpg",
  "letter-blocks": "/images/services/letter-blocks.jpg",
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
  const [serviceCards, setServiceCards] =
    useState<ServiceItem[]>(fallbackServiceCards);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const backendBaseUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_BASE_URL;
    if (!configured) {
      return "/backend";
    }

    return configured.replace(/\/+$/, "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/services`);
        if (!response.ok) {
          throw new Error(
            `Services request failed with status ${response.status}`,
          );
        }

        const payload = await response.json();
        const services = Array.isArray(payload?.services)
          ? payload.services
          : [];

        if (isMounted && services.length > 0) {
          setServiceCards(services);
          setFetchError(null);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Неуспешно зареждане на услугите";
          setFetchError(message);
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
    };
  }, [backendBaseUrl]);

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
      <section className="py-16 md:py-24 bg-baby-blue-light/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-4">
              Нашите <span className="text-primary">услуги</span> 🎨
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Открий как можем да създадем перфектния подарък за теб.
            </p>
            {isLoading ? (
              <p className="text-xs text-muted-foreground mt-2">
                Зареждане на услуги...
              </p>
            ) : null}
            {fetchError ? (
              <p className="text-xs text-amber-700 mt-2">
                Показваме стандартните услуги. Причина: {fetchError}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {orderedServiceCards.map((s) => {
              const iconKey =
                typeof s.icon === "string" ? s.icon.toLowerCase() : "gift";
              const Icon = iconMap[iconKey as keyof typeof iconMap] || Gift;
              const placeholderImage = createServicePlaceholder(s.slug);
              const imageSrc =
                (typeof s.image === "string" && s.image.trim()) ||
                (s.slug ? plannedImageBySlug[s.slug] || "" : "") ||
                placeholderImage;

              return (
                <div
                  key={s.slug || s.title}
                  className="group bg-card rounded-3xl border border-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                    <img
                      src={imageSrc}
                      alt={`Снимка за ${s.title}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(event) => {
                        const img = event.currentTarget;
                        img.onerror = null;
                        img.src = placeholderImage;
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute right-4 top-4 w-11 h-11 rounded-2xl bg-white/85 backdrop-blur flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                  </div>

                  <div className="p-6 md:p-7 flex flex-col gap-4 flex-1">
                    <h2 className="font-heading font-bold text-xl leading-tight">
                      {s.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {s.desc}
                    </p>
                    <Link
                      to={
                        s.slug
                          ? `/uslugi/usluga?slug=${encodeURIComponent(s.slug)}`
                          : "/uslugi"
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-rose-dark transition-all hover:scale-105 self-start"
                    >
                      {s.cta || "Свържи се с нас"} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Info */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-center mb-10">
            Полезна <span className="text-primary">информация</span> ℹ️
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Срок на изработка
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Изработката на продуктите е обикновено между 5 и 7 работни дни,
                според сложността на поръчката.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                <Palette className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Цветове и представяне
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Цветовете ще бъдат представени предварително, за да изберете
                най-подходящата комбинация за вашия подарък.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Подаръци за гости
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
