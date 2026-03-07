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

export default function ServiceDetails() {
  const [slug, setSlug] = useState("");
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
