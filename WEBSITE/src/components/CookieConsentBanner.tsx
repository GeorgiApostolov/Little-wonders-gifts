import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cookieConsentStorageKey } from "@/lib/legal";

type CookieConsentChoice = "necessary" | "all";

type CookieConsentPayload = {
  choice: CookieConsentChoice;
  savedAt: string;
};

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedConsent = window.localStorage.getItem(cookieConsentStorageKey);
      setIsVisible(!savedConsent);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (choice: CookieConsentChoice) => {
    if (typeof window !== "undefined") {
      const payload: CookieConsentPayload = {
        choice,
        savedAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(cookieConsentStorageKey, JSON.stringify(payload));
      } catch {
        // Ignore storage write errors; the banner will show again on next visit.
      }
    }

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/60 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-foreground/90 md:max-w-3xl">
          Използваме необходими бисквитки за вход, сигурност и работа на сайта.
          Можеш да прочетеш повече в{" "}
          <Link to="/biskvitki" className="font-semibold text-primary underline underline-offset-2">
            Политика за бисквитки
          </Link>
          .
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => saveConsent("necessary")}
            className="rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
          >
            Само необходими
          </button>
          <button
            type="button"
            onClick={() => saveConsent("all")}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-rose-dark"
          >
            Приемам всички
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
