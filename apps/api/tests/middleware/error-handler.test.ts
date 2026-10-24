import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createErrorHandler } from "@/middleware/error-handler";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { createFakeLogger } from "../test-utils/fake-logger";

describe("createErrorHandler", () => {
  it("logs the unhandled exception and responds with a 500", async () => {
    const logger = createFakeLogger();
    const app = new Hono<{ Bindings: CloudflareEnv }>()
      .onError(createErrorHandler({ logger }))
      .get("/boom", () => {
        throw new Error("kaboom");
      });

    const response = await app.request("/boom");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
    expect(logger.calls).toHaveLength(1);
    expect(logger.calls[0]).toMatchObject({
      level: "error",
      message: "Unhandled API exception",
      context: { error: "kaboom" },
    });
    expect(logger.calls[0]?.context["stack"]).toContain("Error: kaboom");
  });

  it("logs errors thrown from middleware", async () => {
    const logger = createFakeLogger();
    const app = new Hono<{ Bindings: CloudflareEnv }>()
      .onError(createErrorHandler({ logger }))
      .use("*", () => {
        throw new Error("middleware exploded");
      });

    const response = await app.request("/any");

    expect(response.status).toBe(500);
    expect(logger.calls[0]).toMatchObject({
      level: "error",
      message: "Unhandled API exception",
      context: { error: "middleware exploded" },
    });
  });
});
