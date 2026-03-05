import Link from "next/link";
import {
  Gift,
  Star,
  Baby,
  Heart,
  Sparkles,
  MessageCircle,
  Clock,
  Palette,
  ShieldCheck,
} from "lucide-react";

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

const Index = () => {
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

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-bounce-soft" />
              <span className="text-sm font-medium text-muted-foreground">
                Ръчно изработени с любов
              </span>
              <Sparkles className="w-5 h-5 text-primary animate-bounce-soft" />
            </div>

            <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight mb-6 text-foreground">
              Сладки подаръци,{" "}
              <span className="text-primary">създадени с любов</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Уникални ръчно изработени подаръци за бебета и деца — всяко парче
              е специално, точно като твоето малко чудо.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href="/galeriya"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-bold text-base hover:bg-rose-dark transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                🎨 Разгледай галерията
              </Link>
              <Link
                href="/kontakti"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-background text-foreground font-heading font-bold text-base border-2 border-border hover:border-primary hover:text-primary transition-all hover:scale-105"
              >
                ✉️ Пиши ни
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {badges.map((b) => (
                <span
                  key={b}
                  className="px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium border border-border/50 shadow-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Какво <span className="text-primary">правим</span> 🎁
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Създаваме уникални подаръци, които носят радост на малки и големи.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((s) => (
              <div
                key={s.title}
                className="group bg-card rounded-3xl border border-border/50 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-baby-blue-light flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="py-16 md:py-24 bg-baby-blue-light/50 bg-stars-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Популярни <span className="text-primary">продукти</span> ⭐
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Разгледай нашите най-обичани творения.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border/30 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Gift className="w-10 h-10 group-hover:scale-110 transition-transform" />
                </div>
                <span className="absolute bottom-3 left-3 z-20 text-xs font-medium bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Подарък {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/galeriya"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:bg-rose-dark transition-all hover:scale-105"
            >
              Виж цялата галерия →
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Защо да <span className="text-primary">избереш нас</span> 💝
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-3xl border-2 border-dashed border-border p-6 text-center hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pastel-yellow flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 bg-pastel-lilac/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Какво казват <span className="text-primary">нашите клиенти</span>{" "}
              💬
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm"
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
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
            Искаш уникален подарък? 🎀
          </h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
            Пиши ни и ще създадем нещо специално за твоето малко чудо!
          </p>
          <Link
            href="/kontakti"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-background text-foreground font-heading font-bold hover:scale-105 transition-all shadow-lg"
          >
            💌 Свържи се с нас
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
