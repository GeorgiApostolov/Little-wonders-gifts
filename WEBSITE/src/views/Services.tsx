"use client";

import { Box, Baby, Circle, Image, Palette, Clock3, PartyPopper, Gift } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type ServiceItem = {
  slug: string;
  icon?: string;
  title: string;
  desc: string;
  cta?: string;
  order?: number;
};

const fallbackServiceCards: ServiceItem[] = [
  {
    slug: "ceramic-figures",
    icon: "palette",
    title: "Керамични фигури по поръчка",
    desc: "Ръчно рисувани керамични фигурки с любим герой, животинче или дизайн по ваш избор. Всяка фигура е уникат.",
    cta: "Научи повече",
    order: 1,
  },
  {
    slug: "pacifier-clips",
    icon: "baby",
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
    order: 2,
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
    title: "Платформа",
    desc: "Декоративна платформа, идеална за фотосесия, украса или специален повод.",
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
    slug: "blocks",
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

const Services = () => {
  const [serviceCards, setServiceCards] = useState<ServiceItem[]>([]);
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
          throw new Error(`Services request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const services = Array.isArray(payload?.services) ? payload.services : [];

        if (isMounted) {
          setServiceCards(services.length > 0 ? services : fallbackServiceCards);
          setFetchError(null);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Неуспешно зареждане на услугите";
          setFetchError(message);
          setServiceCards(fallbackServiceCards);
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
              <p className="text-xs text-muted-foreground mt-2">Зареждане на услуги...</p>
            ) : null}
            {fetchError ? (
              <p className="text-xs text-amber-700 mt-2">Показваме стандартните услуги. Причина: {fetchError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {serviceCards.map((s) => {
              const Icon = iconMap[(s.icon as keyof typeof iconMap) || "gift"] || Gift;

              return (
                <div
                  key={s.slug || s.title}
                  className="bg-card rounded-3xl border border-border/50 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="w-14 h-14 mb-5 rounded-2xl bg-pastel-lilac flex items-center justify-center">
                    <Icon className="w-7 h-7 text-foreground" />
                  </div>
                  <h2 className="font-heading font-bold text-xl mb-3">{s.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{s.desc}</p>
                  <Link
                    to={s.slug ? `/uslugi/usluga?slug=${encodeURIComponent(s.slug)}` : "/uslugi"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-rose-dark transition-all hover:scale-105 self-start"
                  >
                    {s.cta || "Свържи се с нас"} →
                  </Link>
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
              <h3 className="font-heading font-bold text-lg mb-2">Срок на изработка</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Изработката на продуктите е обикновено между 5 и 7 работни дни,
                според сложността на поръчката.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                <Palette className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Цветове и представяне</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Цветовете ще бъдат представени предварително, за да изберете
                най-подходящата комбинация за вашия подарък.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Подаръци за гости</h3>
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
