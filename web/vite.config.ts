import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "standalone-arcade-entries",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url || "/", "http://localhost");
        const game = url.pathname.replace(/\/$/, "");
        if (game === "/games/starfall-anglers" || game === "/games/timberline-hunt" || game === "/games/luma-lagoon" || game === "/games/skullwing" || game === "/games/mascaras-del-volcan") {
          request.url = game + "/index.html" + url.search;
        }
        next();
      });
    },
  }],
  define: ['feat/learning-lab-robot-rescue', 'feat/becca-unicorn-play'].includes(process.env.WORKERS_CI_BRANCH ?? '') ? {
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
