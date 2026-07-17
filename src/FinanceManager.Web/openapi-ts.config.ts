import { defineConfig } from "@hey-api/openapi-ts"

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
  ],
})
