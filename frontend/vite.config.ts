import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("@radix-ui")) {
            return "base-ui";
          }

          if (id.includes("monaco")) {
            return "monaco";
          }

          if (id.includes("@tanstack")) {
            return "utils";
          }

          if (id.includes("sentry")) {
            return "telemetry";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }

          return "index";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
