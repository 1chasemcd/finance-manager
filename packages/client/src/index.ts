import { hc } from "hono/client";
import type { AppType } from "@finance-manager/api";

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl);
}
