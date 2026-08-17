import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./FinanceManager.Api.json",
  output: {
    path: "./src/lib/generated",
  },
  plugins: [
    "@tanstack/react-query",
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/lib/hey-api.ts",
    },
    {
      name: "@hey-api/sdk",
      transformer: true,
    },
  ],
});
