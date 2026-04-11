import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-baby-blue-light border-t border-border/30">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-3 inline-flex items-center sm:mb-4">
              <img
                src="/logo.webp"
                alt="Little Wonders Gifts"
                className="h-20 w-auto object-contain sm:h-24 md:h-28"
              />
            </Link>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground md:mx-0">
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
                    to={item.to}
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
            <div className="flex justify-center gap-3 md:justify-start">
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
            <p className="mt-4 text-xs text-muted-foreground">
              hello@littlewondersgifts.com
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Всички права запазени. 💗
        </div>
      </div>
    </footer>
  );
};

export default Footer;
