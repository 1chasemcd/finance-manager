import worker from "@/index";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { describe, expect, it } from "vitest";

describe("worker.fetch", () => {
  it("builds app capable of producing response", async () => {
    const env = {} as unknown as CloudflareEnv;
    const executionContext = {} as unknown as ExecutionContext;
    const response = await worker.fetch(
      new Request("https://app/api/health"),
      env,
      executionContext,
    );

    expect(response.status).toBe(200);
    expect(await response.json<{ status: string }>()).toEqual({ status: "ok" });
  });
});
