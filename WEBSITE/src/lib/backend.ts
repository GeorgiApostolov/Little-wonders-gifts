export function getBackendBaseUrl() {
  const configured = import.meta.env.VITE_BACKEND_BASE_URL?.trim();
  if (!configured) {
    return "/backend";
  }

  return configured.replace(/\/+$/, "");
}

export function parseApiErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

function isLikelyHtmlResponse(text: string) {
  const normalized = text.trim().toLowerCase();
  return (
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.includes("<html")
  );
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    const rawResponse = await response.text();
    const normalizedContentType = contentType.toLowerCase();
    const trimmedResponse = rawResponse.trim();

    if (
      response.status >= 500 &&
      (normalizedContentType.includes("text/plain") ||
        normalizedContentType === "") &&
      trimmedResponse === ""
    ) {
      throw new Error(
        "Локалният backend не отговаря през Vite proxy. Стартирай `npm start` в `WEBSITE/backend`.",
      );
    }

    throw new Error(
      isLikelyHtmlResponse(rawResponse)
        ? "Backend endpoint-ът върна HTML вместо JSON. Провери дали backend сървърът работи и дали Vite proxy е настроен."
        : "Сървърът върна невалиден JSON отговор.",
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Сървърът върна невалиден JSON отговор.");
  }
}
