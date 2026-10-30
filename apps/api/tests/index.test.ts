import { exports as e } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("worker.fetch", () => {
  it("responds to health endpoint", async () => {
    const response = await e.default.fetch("https://finapp.mcdnld.cc/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
