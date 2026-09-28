import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: process.env.WORKERS_CI_BRANCH === 'feat/learning-lab-robot-rescue' ? {
    'import.meta.env.VITE_LEARNING_LAB_PREVIEW': JSON.stringify('true'),
    'import.meta.env.VITE_LEARNING_LAB_VERSION_BUILD': JSON.stringify('true'),
  } : process.env.WORKERS_CI_BRANCH === 'main' ? {
    'import.meta.env.VITE_LEARNING_LAB_RELEASE': JSON.stringify('true'),
  } : {},
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
