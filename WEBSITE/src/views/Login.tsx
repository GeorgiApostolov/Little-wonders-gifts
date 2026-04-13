import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: "Успешен вход",
        description: "Радваме се, че отново си с нас!",
      });
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Неуспешен вход",
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
        <div className="mx-auto max-w-md rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-7 md:p-10">
          <h1 className="font-heading font-extrabold text-3xl mb-2 text-center">
            Вход в профил
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Влез и продължи с твоите поръчки.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="email"
                className="font-heading font-bold text-sm mb-2 block"
              >
                Имейл
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ti@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="font-heading font-bold text-sm mb-2 block"
              >
                Парола
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:bg-rose-dark transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Влизане..." : "Влез"}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Нямаш профил?{" "}
            <Link to="/registracia" className="text-primary font-semibold">
              Регистрирай се
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
