import { createApiClient } from "@finapp/client";

export const api = createApiClient("/").api;

export function ensureOk(res: { ok: boolean; status: number }): void {
  if (!res.ok) throw new Error(`Request failed with status ${res.status.toString()}`);
}
