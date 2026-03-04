import {
  Heart,
  Shield,
  Sparkles,
  Leaf,
  Star,
  Eye,
  Palette,
  Package,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Любов към занаята",
    desc: "Всеки продукт е създаден с истинска страст и внимание към детайла.",
  },
  {
    icon: Shield,
    title: "Безопасност на първо място",
    desc: "Използваме само сертифицирани, нетоксични материали, безопасни за бебета.",
  },
  {
    icon: Sparkles,
    title: "Уникалност",
    desc: "Няма два еднакви продукта — всяко парче е специално и неповторимо.",
  },
];

const steps = [
  {
    icon: Eye,
    num: "01",
    title: "Вдъхновение",
    desc: "Всяка идея започва с вдъхновение от детския свят — цветове, форми и усмивки.",
  },
  {
    icon: Palette,
    num: "02",
    title: "Дизайн",
    desc: "Скицираме и планираме всеки детайл, за да бъде продуктът перфектен.",
  },
  {
    icon: Star,
    num: "03",
    title: "Изработка",
    desc: "Ръчно създаваме всяко парче с внимание, търпение и майсторство.",
  },
  {
    icon: Package,
    num: "04",
    title: "Опаковане",
    desc: "Красиво опаковаме подаръка, за да бъде готов за специалния момент.",
  },
];

const About = () => {
  return (
    <main>
      {/* Story */}
      <section className="py-16 md:py-24 bg-baby-blue-light/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-6">
            За <span className="text-primary">нас</span> 💕
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Little Wonders Gifts започна като малък семеен проект, вдъхновен от
            раждането на нашето първо дете. Искахме да създадем подаръци, които
            носят топлина, усмивки и спомени за цял живот.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Днес продължаваме да изработваме всеки подарък на ръка, влагайки
            любов във всеки детайл. Вярваме, че най-добрите подаръци са тези,
            създадени с душа — и точно такива правим.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-center mb-12">
            Нашите <span className="text-primary">ценности</span> ✨
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-card rounded-3xl border border-border/50 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-pastel-mint flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24 bg-pastel-yellow/30 bg-dots-pattern">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-center mb-12">
            Как <span className="text-primary">създаваме</span> подаръците 🛠️
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative bg-card rounded-3xl border border-border/50 p-6 text-center"
              >
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm flex items-center justify-center shadow-md">
                  {step.num}
                </span>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-baby-blue-light flex items-center justify-center">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-mint flex items-center justify-center">
              <Shield className="w-8 h-8 text-foreground" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl mb-4">
              Материали и <span className="text-primary">безопасност</span> 🛡️
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Безопасността на вашето бебе е наш приоритет номер едно. Всички
              материали, които използваме, са нетоксични, хипоалергенни и
              сертифицирани за безопасност при контакт с бебета.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Керамичните бои са на водна основа, клипсовете за биберон са от
              хранителен силикон и натурално дърво, а опаковките са от
              рециклирани материали. Грижим се за бебетата <strong>и</strong> за
              природата. 🌿
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
