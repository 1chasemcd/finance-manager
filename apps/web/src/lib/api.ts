import { createApiClient } from "@finapp/client";
import { getDevUserHeader } from "./devUserHeader";

export const api = createApiClient(
  "/",
  import.meta.env.DEV ? { headers: () => getDevUserHeader() } : undefined,
).api;
