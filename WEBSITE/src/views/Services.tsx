"use client";

import Link from "next/link";
import {
  Baby,
  Image,
  Palette,
  Circle,
  Box,
  Clock3,
  PartyPopper,
} from "lucide-react";

const serviceCards = [
  {
    icon: Baby,
    title: "Клипсове за биберон",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
  },
  {
    icon: Image,
    title: "Рамка за снимка",
    desc: "Нежна рамка за снимка с име по желание на бебето. Специален спомен, който остава красив акцент в детската стая.",
    cta: "Поръчай рамка",
  },
  {
    icon: Palette,
    title: "Платформа",
    desc: "Декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Виж варианти",
  },
  {
    icon: Circle,
    title: "Кръгла платформа",
    desc: "Кръгла декоративна платформа, идеална за фотосесия, украса или специален повод.",
    cta: "Избери модел",
  },
  {
    icon: Box,
    title: "Кубчета",
    desc: "Декоративни кубчета само с букви за изписване на името на бебето. Идеални за фотосесия, украса или специален повод.",
    cta: "Направи запитване",
  },
];

const Services = () => {
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {serviceCards.map((s) => (
              <div
                key={s.title}
                className="bg-card rounded-3xl border border-border/50 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
              >
                <div className="w-14 h-14 mb-5 rounded-2xl bg-pastel-lilac flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-foreground" />
                </div>
                <h2 className="font-heading font-bold text-xl mb-3">
                  {s.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {s.desc}
                </p>
                <Link
                  href="/kontakti"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-rose-dark transition-all hover:scale-105 self-start"
                >
                  {s.cta} →
                </Link>
              </div>
            ))}
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
