"use client";

import { useState, type FormEvent } from "react";
import { Instagram, Facebook, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";

type ContactApiResponse = {
  status?: string;
  message?: string;
};

const backendBaseUrl = getBackendBaseUrl();

const Contacts = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${backendBaseUrl}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      const payload = await readJsonResponse<ContactApiResponse>(response);
      if (!response.ok || payload.status !== "ok") {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешно изпращане на съобщението."),
        );
      }

      toast({
        title: "Съобщението е изпратено! 💗",
        description: "Ще ти отговорим възможно най-скоро.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast({
        title: "Неуспешно изпращане",
        description:
          error instanceof Error ? error.message : "Моля, опитай отново.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="mb-4 font-heading text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Свържи се <span className="text-primary">с нас</span> 💌
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Имаш въпрос или искаш да поръчаш? Пиши ни — ще ти отговорим възможно
            най-скоро! 💗
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-[1.3fr_0.9fr] md:gap-10">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-7 md:p-10"
          >
            <div className="space-y-5">
              <div>
                <Label
                  htmlFor="name"
                  className="font-heading font-bold text-sm mb-2 block"
                >
                  Име
                </Label>
                <Input
                  id="name"
                  placeholder="Твоето име"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="font-heading font-bold text-sm mb-2 block"
                >
                  Имейл
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tvoiat@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label
                  htmlFor="message"
                  className="font-heading font-bold text-sm mb-2 block"
                >
                  Съобщение
                </Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Напиши ни какво мечтаеш..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:bg-rose-dark transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />{" "}
                {isSubmitting ? "Изпращане..." : "Изпрати съобщение"}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border/30 bg-pastel-mint/50 p-5 text-center sm:p-6">
              <h3 className="font-heading font-bold text-lg mb-3">
                📱 Последвай ни
              </h3>
              <div className="flex justify-center gap-3">
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
                  href="mailto:maria_magdalena2003@abv.bg"
                  aria-label="Имейл"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border/30 bg-pastel-lilac/50 p-5 text-center sm:p-6">
              <p className="text-lg font-heading font-bold">
                Ще ти отговорим възможно най-скоро 💗
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Обикновено до 24 часа
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contacts;
