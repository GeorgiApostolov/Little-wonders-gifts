"use client";

import Link from "next/link";
import { Gift, Palette, Baby, Package } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const serviceCards = [
  {
    icon: Gift,
    title: "Персонализирани подаръци",
    desc: "Уникални подаръци с гравиране или бродерия на име, дата и специално послание. Перфектни за всеки повод — рожден ден, кръщене, бебешко парти.",
    cta: "Поръчай сега",
  },
  {
    icon: Palette,
    title: "Керамични фигури по поръчка",
    desc: "Ръчно рисувани керамични фигурки с любим герой, животинче или дизайн по ваш избор. Всяка фигура е уникат.",
    cta: "Научи повече",
  },
  {
    icon: Baby,
    title: "Клипсове за биберон с име",
    desc: "Персонализирани клипсове от хранителен силикон и натурално дърво. Безопасни, практични и невероятно сладки.",
    cta: "Избери цветове",
  },
  {
    icon: Package,
    title: "Подаръчни комплекти",
    desc: "Красиво подредени комплекти с внимателно подбрани продукти. Готови за подаряване — просто добави усмивка!",
    cta: "Виж комплектите",
  },
];

const faqs = [
  {
    q: "Колко време отнема изработката?",
    a: "Обикновено 5–7 работни дни, в зависимост от сложността на поръчката. При спешни поръчки се свържете с нас за индивидуална уговорка.",
  },
  {
    q: "Мога ли да избера цветове и дизайн?",
    a: "Разбира се! Можете да изберете цветове, шрифтове и дизайн. Ще ви изпратим визуализация за одобрение преди изработката.",
  },
  {
    q: "Подходящи ли са продуктите за бебета?",
    a: "Да! Всички наши продукти са изработени от сертифицирани, нетоксични материали, безопасни за бебета и малки деца.",
  },
  {
    q: "Как мога да поръчам?",
    a: "Свържете се с нас чрез контактната форма, Instagram или Facebook. Ще обсъдим вашите пожелания и ще ви изпратим оферта.",
  },
  {
    q: "Правите ли доставки в цяла България?",
    a: "Да, доставяме в цялата страна чрез куриер. Също така е възможно лично предаване в София.",
  },
  {
    q: "Мога ли да поръчам за фирмено събитие?",
    a: "Да! Изработваме корпоративни подаръци и комплекти за събития. Свържете се с нас за специална оферта при по-големи количества.",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {serviceCards.map((s) => (
              <div
                key={s.title}
                className="bg-card rounded-3xl border border-border/50 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 mb-5 rounded-2xl bg-pastel-lilac flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-foreground" />
                </div>
                <h2 className="font-heading font-bold text-xl mb-3">
                  {s.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {s.desc}
                </p>
                <Link
                  href="/kontakti"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-rose-dark transition-all hover:scale-105"
                >
                  {s.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-center mb-10">
            Често задавани <span className="text-primary">въпроси</span> ❓
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-2xl px-5 bg-card"
              >
                <AccordionTrigger className="font-heading font-bold text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
};

export default Services;
