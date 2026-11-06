import path from "node:path";
import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(root, "apk"),
  base: "./",
  publicDir: false,
  plugins: [react(), tailwindcss(), {
    name: "helios-offline-textures",
    closeBundle() {
      cpSync(path.resolve(root, "public/textures"), path.resolve(root, "android/app/src/main/assets/www/textures"), { recursive: true });
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  build: {
    outDir: path.resolve(root, "android/app/src/main/assets/www"),
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 2000,
  },
});
