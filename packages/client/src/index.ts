import { hc } from "hono/client";
import type { AppType } from "@finapp/api";

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl);
}
