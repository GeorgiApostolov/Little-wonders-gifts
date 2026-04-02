import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendProxyTarget = env.BACKEND_PROXY_TARGET || "http://localhost:3000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // Prevent Vite from returning index.html for local API requests.
        "/backend": {
          target: backendProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
