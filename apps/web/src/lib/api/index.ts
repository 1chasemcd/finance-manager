import { createApiClient } from "@finapp/client";

export const api = createApiClient("/").api;

export function ensureOk(res: {
  ok: boolean;
  status: number;
}): asserts res is { ok: true; status: number } {
  if (!res.ok) throw new Error(`Request failed with status ${res.status.toString()}`);
}
