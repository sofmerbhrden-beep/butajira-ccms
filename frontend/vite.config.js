import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      // Forward all /api/v1/* (and /api/health) to the Express backend.
      // More-specific rule for eTrade must come first so Vite picks it up
      // before the catch-all /api rule below.
      "/api/etrade": {
        target: "https://etrade.gov.et",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/etrade/, "/api"),
        headers: {
          "Referer": "https://etrade.gov.et",
          "Origin": "https://etrade.gov.et",
        },
      },
      "/api/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
