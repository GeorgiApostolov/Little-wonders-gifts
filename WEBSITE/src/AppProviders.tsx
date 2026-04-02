import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NetworkLoadingIndicator from "@/components/NetworkLoadingIndicator";
import { getBackendBaseUrl } from "@/lib/backend";

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [activeFetches, setActiveFetches] = useState(0);
  const backendBaseUrl = getBackendBaseUrl();

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const shouldTrackFetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || "GET").toUpperCase();
      if (method !== "GET") {
        return false;
      }

      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      return (
        url.startsWith("/backend") ||
        url.includes("/backend/") ||
        url.startsWith(backendBaseUrl)
      );
    };

    window.fetch = async (...args) => {
      const shouldTrack = shouldTrackFetch(args[0], args[1]);

      if (!shouldTrack) {
        return originalFetch(...args);
      }

      setActiveFetches((current) => current + 1);

      try {
        return await originalFetch(...args);
      } finally {
        setActiveFetches((current) => Math.max(0, current - 1));
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [backendBaseUrl]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NetworkLoadingIndicator active={activeFetches > 0} />
        {children}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
