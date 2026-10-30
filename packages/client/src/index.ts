import { hc } from "hono/client";
import type { AppType } from "@finapp/api/client";

export function createApiClient(
  baseUrl: string,
  options?: { headers: () => Record<string, string> },
) {
  return hc<AppType>(baseUrl, options);
}
