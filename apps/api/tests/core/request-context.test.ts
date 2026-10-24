import { describe, expect, it } from "vitest";
import { requestContext, createRequestContextMiddleware } from "@/middleware/request-context";
import type { User } from "@/users/user.types";
import type { Context } from "hono";
import type { CloudflareEnv } from "@/types/cloudflare-env";

const user: User = {
  id: 1,
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  subject: "subject-1",
  groupId: 7,
};

async function runWithRequestContext(callback: () => Promise<void>) {
  const c = { req: { method: "get", path: "/api/health" } } as unknown as Context<
    {
      Bindings: CloudflareEnv;
    },
    string
  >;
  const middleware = createRequestContextMiddleware();
  await middleware(c, callback);
}

describe("getRequestContext", () => {
  it("throws outside of a request scope", () => {
    expect(requestContext()).toBeUndefined();
  });

  it("returns the store inside a request scope", async () => {
    await runWithRequestContext(() => {
      expect(requestContext()?.requestId).toBeTruthy();
      expect(requestContext()?.method).toEqual("get");
      expect(requestContext()?.path).toEqual("/api/health");

      return Promise.resolve();
    });
  });

  it("shares mutations with nested async calls", async () => {
    await runWithRequestContext(async () => {
      const context = requestContext();
      if (!context) expect.fail();
      context.user = user;

      await Promise.resolve();
      await Promise.resolve();

      expect(requestContext()?.user).toEqual(user);
      expect(requestContext()).toBe(context);
    });
  });

  it("isolates concurrent request scopes", async () => {
    const seen: (User | undefined)[] = [];

    await Promise.all([
      runWithRequestContext(async () => {
        const context = requestContext();
        if (!context) expect.fail();
        context.user = user;
        await Promise.resolve();
        seen.push(requestContext()?.user);
      }),
      runWithRequestContext(async () => {
        await Promise.resolve();
        seen.push(requestContext()?.user);
      }),
    ]);

    expect(seen).toEqual([user, undefined]);
  });

  it("leaves no store behind after completion", async () => {
    await runWithRequestContext(() => {
      const context = requestContext();
      if (!context) expect.fail();
      context.user = user;
      return Promise.resolve();
    });

    expect(requestContext()).toBeUndefined();
  });

  it("propagates failures from the callback", async () => {
    await expect(runWithRequestContext(() => Promise.reject(new Error("boom")))).rejects.toThrow(
      "boom",
    );
  });
});
