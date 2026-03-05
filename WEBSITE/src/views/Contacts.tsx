"use client";

import { useState } from "react";
import { Instagram, Facebook, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Съобщението е изпратено! 💗",
      description: "Ще ти отговорим възможно най-скоро.",
    });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-4">
            Свържи се <span className="text-primary">с нас</span> 💌
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Имаш въпрос или искаш да поръчаш? Пиши ни — ще ти отговорим възможно
            най-скоро! 💗
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-10 max-w-5xl mx-auto">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl border border-border/50 p-10 shadow-sm"
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
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:bg-rose-dark transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" /> Изпрати съобщение
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-pastel-mint/50 rounded-3xl p-6 border border-border/30 text-center">
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
                  href="mailto:hello@littlewondersgifts.com"
                  aria-label="Имейл"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="bg-pastel-lilac/50 rounded-3xl p-6 border border-border/30 text-center">
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
