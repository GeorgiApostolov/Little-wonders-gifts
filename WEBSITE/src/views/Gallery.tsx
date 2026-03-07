"use client";

import { useState } from "react";
import { Gift, X } from "lucide-react";

const categories = [
  "Всички",
  "Керамични фигури",
  "Клипсове за биберон",
  "Подаръчни комплекти",
];

const galleryItems = Array.from({ length: 9 }).map((_, i) => ({
  id: i,
  title: `Подарък ${i + 1}`,
  category: categories[1 + (i % 3)],
  alt: `Ръчно изработен подарък за бебе — ${categories[1 + (i % 3)].toLowerCase()}`,
}));

const Gallery = () => {
  const [active, setActive] = useState("Всички");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered =
    active === "Всички"
      ? galleryItems
      : galleryItems.filter((g) => g.category === active);

  return (
    <main className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-4">
            Нашата <span className="text-primary">галерия</span> 🖼️
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Всяко творение е уникално и изработено с любов. Разгледай нашите
            творения!
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === c
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setLightbox(item.id)}
              className="group relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              aria-label={item.alt}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Gift className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <span className="absolute bottom-3 left-3 z-20 text-xs font-medium bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <div
              className="relative bg-card rounded-3xl max-w-lg w-full aspect-square flex items-center justify-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Gift className="w-16 h-16 text-muted-foreground" />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* SEO text */}
        <div className="mt-16 max-w-3xl mx-auto text-sm text-muted-foreground leading-relaxed">
          <p>
            Тук ще откриете малка част от моите ръчно изработени керамични
            фигурки и клипсове за биберон. Обичам да работя с нежни цветове и
            много внимание към детайла. Всяко творение е създадено с грижа, за
            да носи усмивки на най-малките и техните родители. Ако имате любими
            цветове, можете да изберете своя собствена комбинация, за да
            създадем нещо специално точно за вас.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Gallery;
