import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";

type AccountOrder = {
  orderId: string;
  serviceSlug: string;
  serviceTitle: string;
  selectedAudience?: string;
  selectedOptionLabel?: string;
  selectedClipLabel?: string;
  selectedDecorationLabel?: string;
  babyName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryCourier?: string;
  deliveryType?: string;
  deliveryAddress?: string;
  deliveryOfficeLabel?: string;
  paymentMethod?: string;
  createdAt?: string;
  status?: string;
};

const orderStatusLabels: Record<string, string> = {
  new: "Нова",
  confirmed: "Потвърдена",
  shipped: "Пътува към вас",
};

function getOrderStatusLabel(status?: string) {
  return orderStatusLabels[status || ""] || "Нова";
}

function getCourierLabel(value?: string) {
  if (value === "econt") {
    return "Еконт";
  }

  if (value === "speedy") {
    return "Спиди";
  }

  return "-";
}

function getDeliveryTypeLabel(value?: string) {
  if (value === "office") {
    return "До офис";
  }

  if (value === "address") {
    return "До адрес";
  }

  return "-";
}

function getPaymentMethodLabel(value?: string) {
  if (value === "cod") {
    return "Наложен платеж";
  }

  return value || "-";
}

export default function Profile() {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const backendBaseUrl = getBackendBaseUrl();

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

        const payload = await readJsonResponse<{
          status?: string;
          message?: string;
          orders?: AccountOrder[];
        }>(response);

        if (!response.ok || payload.status !== "ok") {
          throw new Error(
            parseApiErrorMessage(payload, "Неуспешно зареждане на поръчките."),
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
    <main className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-7 md:p-10">
          <h1 className="mb-2 font-heading text-2xl font-extrabold sm:text-3xl">
            Моят профил
          </h1>
          <p className="text-muted-foreground text-sm">
            {user?.fullName || "Потребител"} • {user?.email || ""}
          </p>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-7 md:p-10">
          <h2 className="mb-6 font-heading text-xl font-extrabold sm:text-2xl">
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
                  className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="font-heading font-bold text-base">
                      Поръчка {order.orderId}
                    </p>
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      {getOrderStatusLabel(order.status)}
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
                  {order.selectedClipLabel ? (
                    <p className="text-sm mb-1">
                      <strong>Щипка:</strong> {order.selectedClipLabel}
                    </p>
                  ) : null}
                  {order.selectedDecorationLabel ? (
                    <p className="text-sm mb-1">
                      <strong>Елемент:</strong> {order.selectedDecorationLabel}
                    </p>
                  ) : null}
                  {order.babyName ? (
                    <p className="text-sm mb-1">
                      <strong>Име на бебето:</strong> {order.babyName}
                    </p>
                  ) : null}
                  {order.customerPhone ? (
                    <p className="text-sm mb-1">
                      <strong>Телефон:</strong> {order.customerPhone}
                    </p>
                  ) : null}
                  <p className="text-sm mb-1">
                    <strong>Куриер:</strong>{" "}
                    {getCourierLabel(order.deliveryCourier)}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Тип доставка:</strong>{" "}
                    {getDeliveryTypeLabel(order.deliveryType)}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Данни за доставка:</strong>{" "}
                    {order.deliveryType === "office"
                      ? order.deliveryOfficeLabel || "-"
                      : order.deliveryAddress || "-"}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Плащане:</strong>{" "}
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
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
