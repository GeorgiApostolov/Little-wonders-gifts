import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-baby-blue-light border-t border-border/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logo.webp"
                alt="Little Wonders Gifts"
                width={802}
                height={318}
                unoptimized
                className="h-24 md:h-28 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ръчно изработени подаръци за бебета и деца, създадени с любов и
              внимание към всеки детайл.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Начало", to: "/" },
                { label: "Галерия", to: "/galeriya" },
                { label: "За нас", to: "/za-nas" },
                { label: "Услуги", to: "/uslugi" },
                { label: "Контакти", to: "/kontakti" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-4">
              Последвай ни
            </h3>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/little.wonders.gifts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61574482834482"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@littlewondersgifts.com"
                aria-label="Имейл"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              hello@littlewondersgifts.com
            </p>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Всички права запазени. 💗
        </div>
      </div>
    </footer>
  );
};

export default Footer;
