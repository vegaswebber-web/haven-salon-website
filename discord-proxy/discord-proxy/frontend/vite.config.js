import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Geliştirme ortamında backend'e yönlendir
      "/proxy": "http://localhost:3001",
      "/session": "http://localhost:3001",
      "/ping": "http://localhost:3001",
    },
  },
  build: {
    outDir: "dist",
  },
});
