import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type ServiceDetails = {
  slug: string;
  title: string;
  desc?: string;
  shortDescription?: string;
  longDescription?: string;
  bullets?: string[];
  bulletPoints?: string[];
};

type ClipAudience = "girl" | "boy";
type ClipDecoration = "flower" | "bow";

type ClipOption = {
  id: string;
  audience: ClipAudience;
  label: string;
  colors: string[];
  decoration?: ClipDecoration;
};

const clipOptions: ClipOption[] = [
  {
    id: "girl-pink-white-flower",
    audience: "girl",
    label: "Розово + бяло + цвете",
    colors: ["#F48FB1", "#FFFFFF", "#F48FB1", "#FFFFFF", "#FADADD"],
    decoration: "flower",
  },
  {
    id: "girl-pink-white-bow",
    audience: "girl",
    label: "Розово + бяло + панделка",
    colors: ["#F48FB1", "#FFFFFF", "#F48FB1", "#FFFFFF", "#F9E4C8"],
    decoration: "bow",
  },
  {
    id: "girl-beige-white-flower",
    audience: "girl",
    label: "Бежово + бяло + цвете",
    colors: ["#D7BFA7", "#FFFFFF", "#D7BFA7", "#FFFFFF", "#EBDCC9"],
    decoration: "flower",
  },
  {
    id: "girl-purple-white-flower",
    audience: "girl",
    label: "Лилаво + бяло + цвете",
    colors: ["#B9A0E6", "#FFFFFF", "#B9A0E6", "#FFFFFF", "#D8C7F2"],
    decoration: "flower",
  },
  {
    id: "girl-purple-white-bow",
    audience: "girl",
    label: "Лилаво + бяло + панделка",
    colors: ["#B9A0E6", "#FFFFFF", "#B9A0E6", "#FFFFFF", "#EBDCC9"],
    decoration: "bow",
  },
  {
    id: "girl-yellow-beige",
    audience: "girl",
    label: "Жълто + бежово/бяло",
    colors: ["#F2D974", "#D7BFA7", "#FFFFFF", "#F2D974", "#EFDCA6"],
  },
  {
    id: "boy-blue-white",
    audience: "boy",
    label: "Синьо + бяло/бежово",
    colors: ["#4A90E2", "#FFFFFF", "#D7BFA7", "#4A90E2", "#B7D2F3"],
  },
  {
    id: "boy-mint-white",
    audience: "boy",
    label: "Ментово зелено + бяло",
    colors: ["#8CD9C8", "#FFFFFF", "#8CD9C8", "#FFFFFF", "#BEE9DF"],
  },
  {
    id: "boy-brown-beige",
    audience: "boy",
    label: "Кафяво + бежово/бяло",
    colors: ["#9F7A5A", "#D7BFA7", "#FFFFFF", "#9F7A5A", "#C9A88C"],
  },
  {
    id: "boy-darkgreen-beige",
    audience: "boy",
    label: "Тъмно зелено + бежово",
    colors: ["#3E6B56", "#D7BFA7", "#3E6B56", "#D7BFA7", "#A5BCA8"],
  },
  {
    id: "boy-babyblue-darkblue",
    audience: "boy",
    label: "Бебешко синьо + тъмно синьо",
    colors: ["#8BBBF4", "#245A9C", "#8BBBF4", "#245A9C", "#A8CCF0"],
  },
];

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

const getClipPreviewDataUri = (option: ClipOption) => {
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
      <circle cx="500" cy="112" r="33" fill="#F4F4F4" stroke="#D8D8D8" stroke-width="2"/>
      <circle cx="500" cy="112" r="17" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="2"/>
      ${renderDecoration(option.decoration)}
      <text x="54" y="205" fill="#666666" font-size="22" font-family="Arial, sans-serif">${option.label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default function ServiceDetails() {
  const [slug, setSlug] = useState("");
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] =
    useState<ClipAudience>("girl");
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    clipOptions[0].id,
  );

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

        if (!response.ok) {
          throw new Error(
            `Service request failed with status ${response.status}`,
          );
        }

        const payload = await response.json();
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
          setService(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Неуспешно зареждане на услугата",
          );
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

  const previewImage = useMemo(() => {
    if (!selectedClipOption) {
      return "";
    }

    return getClipPreviewDataUri(selectedClipOption);
  }, [selectedClipOption]);

  const bullets = service?.bullets || service?.bulletPoints || [];
  const heading = service?.title || "Детайли за услуга";
  const longDescription =
    service?.longDescription ||
    service?.desc ||
    service?.shortDescription ||
    "Няма налично подробно описание за тази услуга.";

  return (
    <main>
      <section className="py-16 md:py-24 bg-baby-blue-light/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-sm">
            <p className="text-sm text-muted-foreground mb-4">Услуга</p>
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-4">
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
                      Билдер за поръчка
                    </p>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl mb-4">
                      Персонализирани клипсове за биберон
                    </h2>

                    {selectedClipOption ? (
                      <img
                        src={previewImage}
                        alt={`Визуализация: ${selectedClipOption.label}`}
                        className="w-full rounded-2xl border border-border/40 mb-5"
                      />
                    ) : null}

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        1) Избери тип
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
                          Момиче
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
                          Момче
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-5">
                      <p className="text-sm font-heading font-bold">
                        2) Избери комбинация
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
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Избрано: {selectedClipOption?.label}
                    </p>
                  </div>
                ) : null}
              </>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/uslugi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-heading font-bold hover:bg-muted transition-all"
              >
                ← Назад към услуги
              </Link>
              <Link
                to="/kontakti"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-rose-dark transition-all"
              >
                Пиши ни за поръчка →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
