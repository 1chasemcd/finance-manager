import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      configPath: "../api/wrangler.dev.jsonc",
      persistState: { path: "../api/.wrangler/state" },
    }),
  ],
});
