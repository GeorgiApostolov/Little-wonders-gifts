"use client";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Начало", to: "/" },
  { label: "Галерия", to: "/galeriya" },
  { label: "За нас", to: "/za-nas" },
  { label: "Услуги", to: "/uslugi" },
  { label: "Контакти", to: "/kontakti" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 lg:sticky">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 lg:h-[4.5rem]">
        {/* Logo */}
        <Link
          to="/"
          className="flex h-14 items-center overflow-hidden sm:h-16 lg:h-[4.5rem]"
        >
          <img
            src="/logo.webp"
            alt="Little Wonders Gifts"
            className="h-10 w-auto object-contain sm:h-12 lg:h-16"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-accent ${
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link
                to="/profil"
                className="ml-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {user?.fullName}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-accent text-foreground"
                type="button"
              >
                Изход
              </button>
            </>
          ) : (
            <>
              <Link
                to="/vhod"
                className="ml-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-accent text-foreground"
              >
                Вход
              </Link>
              <Link
                to="/registracia"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 transition-colors hover:bg-accent lg:hidden"
          aria-label="Отвори менюто"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="max-h-[calc(100svh-3.5rem)] overflow-y-auto border-t border-border/50 bg-background/95 px-4 pb-4 pt-2 backdrop-blur-md lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
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

          {isAuthenticated ? (
            <>
              <Link
                to="/profil"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:bg-accent"
              >
                Влязъл: {user?.fullName}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full text-left block px-4 py-3 rounded-2xl text-sm font-medium transition-all text-foreground hover:bg-accent"
                type="button"
              >
                Изход
              </button>
            </>
          ) : (
            <>
              <Link
                to="/vhod"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-medium transition-all text-foreground hover:bg-accent"
              >
                Вход
              </Link>
              <Link
                to="/registracia"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-medium transition-all bg-primary text-primary-foreground"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
