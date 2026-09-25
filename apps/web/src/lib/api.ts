import { createApiClient } from "@finance-manager/client";

export const api = createApiClient(import.meta.env["VITE_API_URL"]);
