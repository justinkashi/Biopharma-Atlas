import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// @ts-ignore — vitest types added as devDep
/// <reference types="vitest" />

// For GitHub Pages: set base to "/<repo-name>/" 
// e.g., if your repo is "biopharma-atlas", use "/biopharma-atlas/"
// For local dev or custom domain, use "./"
const base = process.env.GITHUB_ACTIONS ? "/Biopharma-Atlas/" : "./";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(import.meta.dirname, "client/src/__tests__/setup.ts")],
    include: [path.resolve(import.meta.dirname, "client/src/__tests__/**/*.test.{ts,tsx}")],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('researchDocs')) return 'research';
          if (id.includes('stockPitchData')) return 'pitch';
          if (id.includes('investmentData')) return 'investment';
        },
      },
    },
  },
});
