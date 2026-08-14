import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./FinanceManager.Api.json",
  output: {
    path: "./src/lib/api/generated",
  },
  plugins: [
    "@tanstack/react-query",
    "zod",
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/lib/api/hey-api.ts",
    },
  ],
});
