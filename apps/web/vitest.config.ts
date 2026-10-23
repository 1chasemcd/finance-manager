import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
  },
});
