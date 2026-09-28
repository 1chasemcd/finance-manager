import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      configPath: "../api/wrangler.jsonc",
      // Reuse the same local D1/KV state as `wrangler dev` in apps/api
      persistState: { path: "../api/.wrangler/state" },
    }),
  ],
});
