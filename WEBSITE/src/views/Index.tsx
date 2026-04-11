import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Star,
  Baby,
  Heart,
  Sparkles,
  MessageCircle,
  Palette,
} from "lucide-react";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";

const badges = [
  "✨ Ръчна изработка",
  "🎨 Персонализация",
  "👶 Подходящо за бебета",
];

const services = [
  {
    icon: Gift,
    title: "Подаръци за специални поводи",
    desc: "Уникални подаръци за рожден ден, кръщене, бебешко парти и всеки специален момент.",
  },
  {
    icon: Palette,
    title: "Керамични фигури",
    desc: "Ръчно рисувани керамични фигурки — сладки спомени, които остават завинаги.",
  },
  {
    icon: Baby,
    title: "Клипсове за биберон",
    desc: "Персонализирани клипсове за биберон с името на бебчето — практични и красиви.",
  },
];

const whyUs = [
  {
    icon: Heart,
    title: "Внимание към всеки детайл",
    desc: "Всеки подарък е изработен с грижа и прецизност.",
  },
  {
    icon: Baby,
    title: "Персонализирано за твоето бебче",
    desc: "С името на твоето съкровище, всеки продукт става още по-личен и специален.",
  },
  {
    icon: MessageCircle,
    title: "Бърза комуникация",
    desc: "Винаги на линия — отговаряме бързо и с усмивка.",
  },
];

const reviews = [
  {
    name: "Мария К.",
    text: "Прекрасен подарък за кръщенето на дъщеря ми! Всички бяха впечатлени.",
    stars: 5,
  },
  {
    name: "Иван П.",
    text: "Клипсът за биберон е толкова сладък и качествен. Препоръчвам!",
    stars: 5,
  },
  {
    name: "Елена Д.",
    text: "Поръчах комплект за бебешко парти — красива опаковка и бърза доставка.",
    stars: 5,
  },
];

type GalleryPhoto = {
  photoId: string;
  title: string;
  category: string;
  imageUrl: string;
  alt: string;
};

type GalleryPayload = {
  status: string;
  message?: string;
  photos?: GalleryPhoto[];
};

const Index = () => {
  const backendBaseUrl = useMemo(() => getBackendBaseUrl(), []);
  const [popularPhotos, setPopularPhotos] = useState<GalleryPhoto[]>([]);
  const [isPopularPhotosLoading, setIsPopularPhotosLoading] = useState(true);
  const [popularPhotosError, setPopularPhotosError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadPopularPhotos = async () => {
      setIsPopularPhotosLoading(true);
      setPopularPhotosError(null);

      try {
        const response = await fetch(`${backendBaseUrl}/gallery/photos`);
        const payload = await readJsonResponse<GalleryPayload>(response);

        if (!response.ok) {
          throw new Error(
            parseApiErrorMessage(payload, "Неуспешно зареждане на галерията."),
          );
        }

        if (!isMounted) {
          return;
        }

        const nextPhotos = Array.isArray(payload.photos) ? payload.photos : [];
        setPopularPhotos(nextPhotos.slice(0, 6));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPopularPhotosError(
          error instanceof Error
            ? error.message
            : "Неуспешно зареждане на галерията.",
        );
        setPopularPhotos([]);
      } finally {
        if (isMounted) {
          setIsPopularPhotosLoading(false);
        }
      }
    };

    loadPopularPhotos();

    return () => {
      isMounted = false;
    };
  }, [backendBaseUrl]);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/background.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-baby-blue-light/75" />
        <div className="absolute inset-0 bg-dots-pattern opacity-20" />

        <div className="container relative z-10 mx-auto px-4 py-14 text-center sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-background/55 px-4 py-2 backdrop-blur-sm sm:mb-6">
              <Sparkles className="h-4 w-4 text-primary animate-bounce-soft sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Ръчно изработени с любов
              </span>
              <Sparkles className="h-4 w-4 text-primary animate-bounce-soft sm:h-5 sm:w-5" />
            </div>

            <h1 className="mb-5 font-heading text-[clamp(2.2rem,9vw,4.4rem)] font-extrabold leading-[1.08] text-foreground sm:mb-6">
              Сладки подаръци,{" "}
              <span className="text-primary">създадени с любов</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              Уникални ръчно изработени подаръци за бебета и деца — всяко
              творение е специално, точно като твоето малко чудо.
            </p>

            <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/uslugi"
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-base font-heading font-bold text-background shadow-lg shadow-foreground/20 transition-all hover:scale-105 hover:bg-foreground/90 sm:w-auto"
              >
                🧸 Виж услугите
              </Link>
              <Link
                to="/galeriya"
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-heading font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-rose-dark sm:w-auto"
              >
                🎨 Разгледай галерията
              </Link>
              <Link
                to="/kontakti"
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border-2 border-border bg-background px-8 py-3.5 text-base font-heading font-bold text-foreground transition-all hover:scale-105 hover:border-primary hover:text-primary sm:w-auto"
              >
                ✉️ Пиши ни
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border/50 bg-background/80 px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-background py-14 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-3 font-heading text-2xl font-extrabold sm:text-3xl md:mb-4 md:text-4xl">
              Какво <span className="text-primary">правим</span> 🎁
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              Създаваме уникални подаръци, които носят радост на малки и големи.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                className="group rounded-3xl border border-border/50 bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-baby-blue-light transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-14 sm:w-14">
                  <s.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="mb-2 font-heading text-base font-bold sm:text-lg">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/uslugi"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-6 py-3 font-heading text-sm font-bold text-foreground transition-all hover:scale-105 hover:border-primary hover:text-primary sm:text-base"
            >
              Виж всички услуги →
            </Link>
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="bg-baby-blue-light/50 bg-stars-pattern py-14 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-3 font-heading text-2xl font-extrabold sm:text-3xl md:mb-4 md:text-4xl">
              Популярни <span className="text-primary">продукти</span> ⭐
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              Разгледай нашите най-обичани творения.
            </p>
          </div>
          {isPopularPhotosLoading ? (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-3xl bg-muted border border-border/30 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : popularPhotosError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 text-center">
              {popularPhotosError}
            </div>
          ) : popularPhotos.length === 0 ? (
            <div className="rounded-3xl border border-border/50 bg-card px-6 py-8 text-sm text-muted-foreground text-center">
              Все още няма качени снимки.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-6">
              {popularPhotos.map((photo) => (
                <Link
                  key={photo.photoId}
                  to="/galeriya"
                  className="group relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border/30 shadow-sm"
                  aria-label={photo.alt}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent opacity-90 transition-opacity z-10" />
                  <span className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {photo.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/galeriya"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-rose-dark sm:text-base"
            >
              Виж цялата галерия →
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-background py-14 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-3 font-heading text-2xl font-extrabold sm:text-3xl md:mb-4 md:text-4xl">
              Защо да <span className="text-primary">избереш нас</span> 💝
            </h2>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border-2 border-dashed border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pastel-yellow sm:h-12 sm:w-12">
                  <item.icon className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-2 font-heading font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-pastel-lilac/30 py-14 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-3 font-heading text-2xl font-extrabold sm:text-3xl md:mb-4 md:text-4xl">
              Какво казват <span className="text-primary">нашите клиенти</span>{" "}
              💬
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-primary fill-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                  "{r.text}"
                </p>
                <p className="font-heading font-bold text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-14 text-primary-foreground sm:py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-heading text-2xl font-extrabold sm:text-3xl md:text-4xl">
            Искаш уникален подарък? 🎀
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base opacity-90 sm:text-lg">
            Пиши ни и ще създадем нещо специално за твоето малко чудо!
          </p>
          <Link
            to="/kontakti"
            className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 font-heading text-sm font-bold text-foreground shadow-lg transition-all hover:scale-105 sm:text-base"
          >
            💌 Свържи се с нас
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
