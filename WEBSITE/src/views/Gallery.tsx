"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";

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
  categories?: string[];
};

const Gallery = () => {
  const backendBaseUrl = useMemo(() => getBackendBaseUrl(), []);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [categories, setCategories] = useState<string[]>(["Всички"]);
  const [activeCategory, setActiveCategory] = useState("Всички");
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGalleryPhotos = async () => {
      setIsLoading(true);
      setGalleryError(null);

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
        const apiCategories = Array.isArray(payload.categories)
          ? payload.categories
          : [];
        const derivedCategories = Array.from(
          new Set(nextPhotos.map((photo) => photo.category).filter(Boolean)),
        );

        setPhotos(nextPhotos);
        setCategories([
          "Всички",
          ...new Set([...apiCategories, ...derivedCategories]),
        ]);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setGalleryError(
          error instanceof Error
            ? error.message
            : "Неуспешно зареждане на галерията.",
        );
        setPhotos([]);
        setCategories(["Всички"]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGalleryPhotos();

    return () => {
      isMounted = false;
    };
  }, [backendBaseUrl]);

  const filteredPhotos =
    activeCategory === "Всички"
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  const activePhoto =
    photos.find((photo) => photo.photoId === lightboxPhotoId) || null;

  return (
    <main className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-4 font-heading text-3xl font-extrabold md:text-5xl">
            Нашата <span className="text-primary">галерия</span> 🖼️
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Всяко творение е уникално и изработено с любов. Разгледай нашите
            реални снимки от последните поръчки.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-border/50 bg-card px-6 py-12 text-sm text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Зареждане на галерията...
          </div>
        ) : galleryError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {galleryError}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Все още няма качени снимки за тази категория.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {filteredPhotos.map((photo) => (
              <button
                key={photo.photoId}
                onClick={() => setLightboxPhotoId(photo.photoId)}
                className="group relative overflow-hidden rounded-3xl border border-border/30 bg-muted shadow-sm transition-all duration-300 hover:shadow-xl"
                aria-label={photo.alt}
                type="button"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 text-left text-white">
                  <p className="text-sm font-semibold">{photo.title}</p>
                  <p className="mt-1 text-xs text-white/80">{photo.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activePhoto ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
            onClick={() => setLightboxPhotoId(null)}
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-card shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.alt}
                className="max-h-[85vh] w-full object-contain bg-black/5"
              />
              <div className="flex items-center justify-between gap-3 border-t border-border/50 px-5 py-4">
                <div>
                  <p className="font-heading text-lg font-extrabold">
                    {activePhoto.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activePhoto.category}
                  </p>
                </div>

                <button
                  onClick={() => setLightboxPhotoId(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Затвори"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-16 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <p>
            Тук ще откриеш реални снимки на ръчно изработените ни подаръци.
            Галерията се обновява директно от качените снимки, за да можеш да
            разглеждаш актуални примери от завършени поръчки.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Gallery;
