import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite configuration for Fintech Ledger Core Frontend
 * Used for development server and preview
 * Production builds use Bun.build() for better performance
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    strictPort: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: true,
    // Note: Production builds use Bun.build() instead
    // This config is mainly for preview and dev server
  },
  // Define environment variables for Vite
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      process.env.VITE_API_BASE_URL || "http://localhost:3010",
    ),
  },
});

