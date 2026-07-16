import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./FinanceManager.Api.json",
  output: {
    path: "./lib/api/generated",
  },
  plugins: [
    "@hey-api/client-next",
    {
      name: "@hey-api/sdk",
      validator: {
        request: "zod",
      },
    },
  ],
});
