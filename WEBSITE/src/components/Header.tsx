"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";

const navItems = [
  { label: "Начало", to: "/" },
  { label: "Галерия", to: "/galeriya" },
  { label: "За нас", to: "/za-nas" },
  { label: "Услуги", to: "/uslugi" },
  { label: "Контакти", to: "/kontakti" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Heart className="w-7 h-7 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-heading font-extrabold text-xl text-foreground">
            Little Wonders <span className="text-primary">Gifts</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-accent ${
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl hover:bg-accent transition-colors"
          aria-label="Отвори менюто"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-border/50 bg-background px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
