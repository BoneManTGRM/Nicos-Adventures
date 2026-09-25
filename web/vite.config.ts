import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { storeCatalogPlugin } from "./scripts/store-catalog";

export default defineConfig({
  plugins: [react(), storeCatalogPlugin()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000"
    }
  },
  build: {
    sourcemap: true
  }
});
