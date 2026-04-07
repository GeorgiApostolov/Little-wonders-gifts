import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  LogOut,
  PackageCheck,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  Truck,
} from "lucide-react";
import {
  getBackendBaseUrl,
  parseApiErrorMessage,
  readJsonResponse,
} from "@/lib/backend";

type AdminSection = "menu" | "orders" | "gallery";

type AdminOrder = {
  orderId: string;
  serviceSlug: string;
  serviceTitle: string;
  selectedAudience?: string;
  selectedOptionLabel?: string;
  selectedClipLabel?: string;
  selectedDecorationLabel?: string;
  babyName?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  status?: string;
};

type GalleryPhoto = {
  photoId: string;
  title: string;
  category: string;
  imageUrl: string;
  alt: string;
  createdAt?: string | null;
};

type ApiResponse<T> = {
  status: string;
  message?: string;
} & T;

type OrderEditForm = {
  serviceTitle: string;
  selectedOptionLabel: string;
  selectedClipLabel: string;
  selectedDecorationLabel: string;
  babyName: string;
  customerName: string;
  customerEmail: string;
};

const adminTokenStorageKey = "lw_admin_token";

const galleryCategoryOptions = [
  "Керамични фигури",
  "Клипсове за биберон",
  "Подаръчни комплекти",
];

const orderStatusLabels: Record<string, string> = {
  new: "Нова",
  confirmed: "Потвърдена",
  shipped: "Пътува към вас",
};

function getOrderStatusLabel(status?: string) {
  return orderStatusLabels[status || ""] || "Нова";
}

function getOrderStatusClasses(status?: string) {
  if (status === "shipped") {
    return "bg-sky-100 text-sky-800";
  }

  if (status === "confirmed") {
    return "bg-emerald-100 text-emerald-800";
  }

  return "bg-amber-100 text-amber-900";
}

function readStoredAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(adminTokenStorageKey) || "";
}

function storeAdminToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.sessionStorage.setItem(adminTokenStorageKey, token);
    return;
  }

  window.sessionStorage.removeItem(adminTokenStorageKey);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Неуспешно прочитане на файла."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Неуспешно прочитане на файла."));
    };

    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const backendBaseUrl = useMemo(() => getBackendBaseUrl(), []);
  const [adminToken, setAdminToken] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("menu");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderEditForm, setOrderEditForm] = useState<OrderEditForm>({
    serviceTitle: "",
    selectedOptionLabel: "",
    selectedClipLabel: "",
    selectedDecorationLabel: "",
    babyName: "",
    customerName: "",
    customerEmail: "",
  });

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState(galleryCategoryOptions[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setAdminToken(readStoredAdminToken());
  }, []);

  const adminHeaders = useMemo(() => {
    if (!adminToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${adminToken}`,
    };
  }, [adminToken]);

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthenticating(true);
    setLoginError(null);

    try {
      const response = await fetch(`${backendBaseUrl}/admin/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });
      const payload = await readJsonResponse<ApiResponse<{ token?: string }>>(
        response,
      );

      if (!response.ok || !payload.token) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешен админ вход."),
        );
      }

      setAdminToken(payload.token);
      storeAdminToken(payload.token);
      setPassword("");
      setActiveSection("menu");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Неуспешен админ вход.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    setAdminToken("");
    storeAdminToken("");
    setActiveSection("menu");
    setOrders([]);
    setPhotos([]);
    setOrdersMessage(null);
    setUploadMessage(null);
    setOrdersError(null);
    setPhotosError(null);
    setEditingOrderId(null);
  }

  function startEditingOrder(order: AdminOrder) {
    setEditingOrderId(order.orderId);
    setOrdersError(null);
    setOrdersMessage(null);
    setOrderEditForm({
      serviceTitle: order.serviceTitle || "",
      selectedOptionLabel: order.selectedOptionLabel || "",
      selectedClipLabel: order.selectedClipLabel || "",
      selectedDecorationLabel: order.selectedDecorationLabel || "",
      babyName: order.babyName || "",
      customerName: order.customerName || "",
      customerEmail: order.customerEmail || "",
    });
  }

  function cancelEditingOrder() {
    setEditingOrderId(null);
  }

  function updateOrderEditField(
    field: keyof OrderEditForm,
    value: string,
  ) {
    setOrderEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function loadOrders() {
    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await fetch(`${backendBaseUrl}/admin/orders`, {
        headers: adminHeaders,
      });
      const payload = await readJsonResponse<
        ApiResponse<{ orders?: AdminOrder[] }>
      >(response);

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешно зареждане на поръчките."),
        );
      }

      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неуспешно зареждане на поръчките.";
      setOrdersError(message);

      if (message.toLowerCase().includes("админ")) {
        handleLogout();
      }
    } finally {
      setIsOrdersLoading(false);
    }
  }

  async function loadPhotos() {
    setIsPhotosLoading(true);
    setPhotosError(null);

    try {
      const response = await fetch(`${backendBaseUrl}/gallery/photos`);
      const payload = await readJsonResponse<
        ApiResponse<{ photos?: GalleryPhoto[] }>
      >(response);

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешно зареждане на галерията."),
        );
      }

      setPhotos(Array.isArray(payload.photos) ? payload.photos : []);
    } catch (error) {
      setPhotosError(
        error instanceof Error
          ? error.message
          : "Неуспешно зареждане на галерията.",
      );
    } finally {
      setIsPhotosLoading(false);
    }
  }

  useEffect(() => {
    if (!adminToken || activeSection !== "orders") {
      return;
    }

    loadOrders();
  }, [adminToken, activeSection]);

  useEffect(() => {
    if (!adminToken || activeSection !== "gallery") {
      return;
    }

    loadPhotos();
  }, [adminToken, activeSection]);

  async function updateOrderStatus(
    orderId: string,
    status: "confirmed" | "shipped",
  ) {
    setUpdatingOrderId(orderId);
    setOrdersError(null);
    setOrdersMessage(null);

    try {
      const response = await fetch(`${backendBaseUrl}/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders,
        },
        body: JSON.stringify({
          status,
        }),
      });
      const payload = await readJsonResponse<
        ApiResponse<{
          order?: AdminOrder;
          email?: {
            sentCustomer?: boolean;
            skipped?: boolean;
            reason?: string;
          };
        }>
      >(response);

      if (!response.ok || !payload.order) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешна промяна на статуса."),
        );
      }

      const updatedOrder = payload.order;
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order,
        ),
      );

      const emailInfo = payload.email?.sentCustomer
        ? " Имейлът е изпратен."
        : payload.email?.reason
          ? ` Имейлът не беше изпратен: ${payload.email.reason}`
          : "";
      setOrdersMessage(
        `${payload.message || "Статусът е обновен."}${emailInfo}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неуспешна промяна на статуса.";
      setOrdersError(message);

      if (message.toLowerCase().includes("админ")) {
        handleLogout();
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function deleteOrder(orderId: string) {
    const shouldDelete = window.confirm(
      `Сигурна ли си, че искаш да изтриеш поръчка ${orderId}?`,
    );
    if (!shouldDelete) {
      return;
    }

    setUpdatingOrderId(orderId);
    setOrdersError(null);
    setOrdersMessage(null);

    try {
      const response = await fetch(
        `${backendBaseUrl}/admin/orders/${encodeURIComponent(orderId)}`,
        {
          method: "DELETE",
          headers: adminHeaders,
        },
      );
      const payload = await readJsonResponse<
        ApiResponse<{ order?: AdminOrder }>
      >(response);

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешно изтриване на поръчката."),
        );
      }

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.orderId !== orderId),
      );
      setOrdersMessage(payload.message || "Поръчката е изтрита.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неуспешно изтриване на поръчката.";
      setOrdersError(message);

      if (message.toLowerCase().includes("админ")) {
        handleLogout();
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function saveOrderEdit(event: FormEvent<HTMLFormElement>, orderId: string) {
    event.preventDefault();
    setUpdatingOrderId(orderId);
    setOrdersError(null);
    setOrdersMessage(null);

    try {
      const response = await fetch(
        `${backendBaseUrl}/admin/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...adminHeaders,
          },
          body: JSON.stringify(orderEditForm),
        },
      );
      const payload = await readJsonResponse<
        ApiResponse<{ order?: AdminOrder }>
      >(response);

      if (!response.ok || !payload.order) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешна редакция на поръчката."),
        );
      }

      const updatedOrder = payload.order;
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order,
        ),
      );
      setOrdersMessage(payload.message || "Поръчката е редактирана.");
      setEditingOrderId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неуспешна редакция на поръчката.";
      setOrdersError(message);

      if (message.toLowerCase().includes("админ")) {
        handleLogout();
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handlePhotoUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadMessage(null);
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Избери снимка за качване.");
      return;
    }

    setIsUploading(true);

    try {
      const base64Data = await fileToDataUrl(selectedFile);
      const response = await fetch(`${backendBaseUrl}/admin/gallery/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders,
        },
        body: JSON.stringify({
          title: photoTitle.trim(),
          category: photoCategory,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data,
        }),
      });
      const payload = await readJsonResponse<
        ApiResponse<{ photo?: GalleryPhoto }>
      >(response);

      if (!response.ok || !payload.photo) {
        throw new Error(
          parseApiErrorMessage(payload, "Неуспешно качване на снимката."),
        );
      }

      const uploadedPhoto = payload.photo;
      setPhotos((currentPhotos) => [uploadedPhoto, ...currentPhotos]);
      setUploadMessage(payload.message || "Снимката е качена успешно.");
      setPhotoTitle("");
      setPhotoCategory(galleryCategoryOptions[0]);
      setSelectedFile(null);
      const fileInput = document.getElementById(
        "admin-photo-upload",
      ) as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неуспешно качване на снимката.";
      setUploadError(message);

      if (message.toLowerCase().includes("админ")) {
        handleLogout();
      }
    } finally {
      setIsUploading(false);
    }
  }

  if (!adminToken) {
    return (
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-extrabold">
                  Админ меню
                </h1>
                <p className="text-sm text-muted-foreground">
                  Достъп само с парола
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-heading font-bold"
                >
                  Админ парола
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Въведи паролата"
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-heading font-bold text-primary-foreground transition-all hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticating ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Влизане...
                  </>
                ) : (
                  "Влез в админ менюто"
                )}
              </button>

              {loginError ? (
                <p className="text-sm text-red-600">{loginError}</p>
              ) : null}
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Little Wonders Gifts
            </p>
            <h1 className="font-heading text-3xl font-extrabold md:text-5xl">
              Админ меню
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-sm font-heading font-bold transition-all hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Изход
          </button>
        </div>

        {activeSection === "menu" ? (
          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveSection("orders")}
              className="rounded-3xl border border-border/60 bg-card p-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <PackageCheck className="h-7 w-7" />
              </div>
              <h2 className="mb-2 font-heading text-2xl font-extrabold">
                Поръчки
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Виж всички поръчки, потвърждавай ги и изпращай имейл, че вече се
                изработват или че пътуват към клиента.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("gallery")}
              className="rounded-3xl border border-border/60 bg-card p-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
                <ImagePlus className="h-7 w-7" />
              </div>
              <h2 className="mb-2 font-heading text-2xl font-extrabold">
                Галерия
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Качи снимка в папка `photos`, задай категория и заглавие, а
                публичната галерия ще я покаже автоматично.
              </p>
            </button>
          </div>
        ) : null}

        {activeSection === "orders" ? (
          <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Секция
                </p>
                <h2 className="font-heading text-2xl font-extrabold">
                  Всички поръчки
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection("menu")}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Обнови
                </button>
              </div>
            </div>

            {ordersMessage ? (
              <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {ordersMessage}
              </p>
            ) : null}

            {ordersError ? (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {ordersError}
              </p>
            ) : null}

            {isOrdersLoading ? (
              <p className="text-sm text-muted-foreground">Зареждане на поръчките...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Все още няма поръчки.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isUpdating = updatingOrderId === order.orderId;
                  const isConfirmed =
                    order.status === "confirmed" || order.status === "shipped";
                  const isShipped = order.status === "shipped";
                  const isEditing = editingOrderId === order.orderId;

                  return (
                    <article
                      key={order.orderId}
                      className="rounded-3xl border border-border/60 bg-background p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-heading text-lg font-extrabold">
                            Поръчка {order.orderId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.serviceTitle || order.serviceSlug}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getOrderStatusClasses(order.status)}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-foreground/90">
                        <p>
                          <strong>Създадена:</strong> {order.createdAt || "-"}
                        </p>
                        <p>
                          <strong>Комбинация:</strong> {order.selectedOptionLabel || "-"}
                        </p>
                        <p>
                          <strong>Щипка:</strong> {order.selectedClipLabel || "-"}
                        </p>
                        <p>
                          <strong>Елемент:</strong> {order.selectedDecorationLabel || "-"}
                        </p>
                        <p>
                          <strong>Име:</strong> {order.babyName || "-"}
                        </p>
                        <p>
                          <strong>Клиент:</strong> {order.customerName || "-"}
                        </p>
                        <p>
                          <strong>Имейл:</strong> {order.customerEmail || "Няма въведен имейл"}
                        </p>
                        <p>
                          <strong>Потвърдена:</strong> {order.confirmedAt || "-"}
                        </p>
                        <p>
                          <strong>Изпратена:</strong> {order.shippedAt || "-"}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            isEditing
                              ? cancelEditingOrder()
                              : startEditingOrder(order)
                          }
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2.5 text-sm font-heading font-bold transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          {isEditing ? "Затвори редакция" : "Редактирай"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(order.orderId, "confirmed")
                          }
                          disabled={isUpdating || isConfirmed}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-heading font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Потвърди
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(order.orderId, "shipped")
                          }
                          disabled={isUpdating || isShipped}
                          className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-heading font-bold text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                          Пътува към вас
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteOrder(order.orderId)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-heading font-bold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Изтрий
                        </button>
                      </div>

                      {isEditing ? (
                        <form
                          onSubmit={(event) => saveOrderEdit(event, order.orderId)}
                          className="mt-5 grid gap-4 rounded-3xl border border-border/60 bg-card p-4"
                        >
                          <div className="grid gap-2">
                            <label className="text-sm font-heading font-bold">
                              Услуга
                            </label>
                            <input
                              type="text"
                              value={orderEditForm.serviceTitle}
                              onChange={(event) =>
                                updateOrderEditField(
                                  "serviceTitle",
                                  event.target.value,
                                )
                              }
                              maxLength={140}
                              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-heading font-bold">
                              Комбинация
                            </label>
                            <input
                              type="text"
                              value={orderEditForm.selectedOptionLabel}
                              onChange={(event) =>
                                updateOrderEditField(
                                  "selectedOptionLabel",
                                  event.target.value,
                                )
                              }
                              maxLength={160}
                              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <label className="text-sm font-heading font-bold">
                                Щипка
                              </label>
                              <input
                                type="text"
                                value={orderEditForm.selectedClipLabel}
                                onChange={(event) =>
                                  updateOrderEditField(
                                    "selectedClipLabel",
                                    event.target.value,
                                  )
                                }
                                maxLength={80}
                                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>

                            <div className="grid gap-2">
                              <label className="text-sm font-heading font-bold">
                                Елемент
                              </label>
                              <input
                                type="text"
                                value={orderEditForm.selectedDecorationLabel}
                                onChange={(event) =>
                                  updateOrderEditField(
                                    "selectedDecorationLabel",
                                    event.target.value,
                                  )
                                }
                                maxLength={80}
                                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <label className="text-sm font-heading font-bold">
                                Име на бебето
                              </label>
                              <input
                                type="text"
                                value={orderEditForm.babyName}
                                onChange={(event) =>
                                  updateOrderEditField(
                                    "babyName",
                                    event.target.value,
                                  )
                                }
                                maxLength={60}
                                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>

                            <div className="grid gap-2">
                              <label className="text-sm font-heading font-bold">
                                Клиент
                              </label>
                              <input
                                type="text"
                                value={orderEditForm.customerName}
                                onChange={(event) =>
                                  updateOrderEditField(
                                    "customerName",
                                    event.target.value,
                                  )
                                }
                                maxLength={80}
                                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-heading font-bold">
                              Имейл
                            </label>
                            <input
                              type="email"
                              value={orderEditForm.customerEmail}
                              onChange={(event) =>
                                updateOrderEditField(
                                  "customerEmail",
                                  event.target.value,
                                )
                              }
                              maxLength={160}
                              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-heading font-bold text-primary-foreground transition-all hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <Pencil className="h-4 w-4" />
                              )}
                              Запази промените
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditingOrder}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2.5 text-sm font-heading font-bold transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Откажи
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {activeSection === "gallery" ? (
          <section className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-5 md:p-8 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Секция
                  </p>
                  <h2 className="font-heading text-2xl font-extrabold">
                    Качване в галерията
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("menu")}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </button>
              </div>

              <form onSubmit={handlePhotoUpload} className="grid gap-5">
                <div className="grid gap-2">
                  <label
                    htmlFor="admin-photo-title"
                    className="text-sm font-heading font-bold"
                  >
                    Заглавие
                  </label>
                  <input
                    id="admin-photo-title"
                    type="text"
                    value={photoTitle}
                    onChange={(event) => setPhotoTitle(event.target.value)}
                    placeholder="Пример: Рамка за Никол"
                    maxLength={140}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="admin-photo-category"
                    className="text-sm font-heading font-bold"
                  >
                    Категория
                  </label>
                  <select
                    id="admin-photo-category"
                    value={photoCategory}
                    onChange={(event) => setPhotoCategory(event.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {galleryCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="admin-photo-upload"
                    className="text-sm font-heading font-bold"
                  >
                    Снимка
                  </label>
                  <input
                    id="admin-photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Разрешени формати: JPG, PNG, WEBP, GIF.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-heading font-bold text-primary-foreground transition-all hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Качване...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      Качи снимката
                    </>
                  )}
                </button>

                {uploadMessage ? (
                  <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {uploadMessage}
                  </p>
                ) : null}

                {uploadError ? (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {uploadError}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-5 md:p-8 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-extrabold">
                    Качени снимки
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Публичната галерия ще показва този списък.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadPhotos}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Обнови
                </button>
              </div>

              {photosError ? (
                <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {photosError}
                </p>
              ) : null}

              {isPhotosLoading ? (
                <p className="text-sm text-muted-foreground">Зареждане на снимките...</p>
              ) : photos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Все още няма качени снимки.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {photos.map((photo) => (
                    <article
                      key={photo.photoId}
                      className="overflow-hidden rounded-3xl border border-border/60 bg-background"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.alt}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                      <div className="p-4">
                        <p className="font-semibold">{photo.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {photo.category}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
