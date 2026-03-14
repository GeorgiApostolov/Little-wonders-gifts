import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type AccountOrder = {
  orderId: string;
  serviceSlug: string;
  serviceTitle: string;
  selectedAudience?: string;
  selectedOptionLabel?: string;
  babyName?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  status?: string;
};

export default function Profile() {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const backendBaseUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_BASE_URL;
    if (!configured) {
      return "/backend";
    }

    return configured.replace(/\/+$/, "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (!token) {
        if (isMounted) {
          setOrders([]);
          setIsOrdersLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${backendBaseUrl}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = (await response.json()) as {
          status?: string;
          message?: string;
          orders?: AccountOrder[];
        };

        if (!response.ok || payload.status !== "ok") {
          throw new Error(
            payload.message || "Неуспешно зареждане на поръчките.",
          );
        }

        if (isMounted) {
          setOrders(Array.isArray(payload.orders) ? payload.orders : []);
          setOrdersError(null);
        }
      } catch (error) {
        if (isMounted) {
          setOrdersError(
            error instanceof Error
              ? error.message
              : "Възникна грешка при зареждане на поръчките.",
          );
        }
      } finally {
        if (isMounted) {
          setIsOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [backendBaseUrl, token]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/vhod" replace />;
  }

  return (
    <main className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm mb-8">
          <h1 className="font-heading font-extrabold text-3xl mb-2">
            Моят профил
          </h1>
          <p className="text-muted-foreground text-sm">
            {user?.fullName || "Потребител"} • {user?.email || ""}
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm">
          <h2 className="font-heading font-extrabold text-2xl mb-6">
            Моите поръчки
          </h2>

          {isOrdersLoading ? (
            <p className="text-sm text-muted-foreground">
              Зареждане на поръчките...
            </p>
          ) : ordersError ? (
            <p className="text-sm text-red-600">{ordersError}</p>
          ) : orders.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Все още няма поръчки от този профил.
              </p>
              <Link
                to="/uslugi"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:bg-rose-dark transition-all"
              >
                Направи първа поръчка
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.orderId}
                  className="rounded-2xl border border-border/60 p-5 bg-background"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="font-heading font-bold text-base">
                      Поръчка {order.orderId}
                    </p>
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      {order.status || "new"}
                    </span>
                  </div>

                  <p className="text-sm mb-1">
                    <strong>Услуга:</strong>{" "}
                    {order.serviceTitle || order.serviceSlug}
                  </p>
                  {order.selectedOptionLabel ? (
                    <p className="text-sm mb-1">
                      <strong>Комбинация:</strong> {order.selectedOptionLabel}
                    </p>
                  ) : null}
                  {order.babyName ? (
                    <p className="text-sm mb-1">
                      <strong>Име на бебето:</strong> {order.babyName}
                    </p>
                  ) : null}
                  {order.createdAt ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      Създадена: {order.createdAt}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
