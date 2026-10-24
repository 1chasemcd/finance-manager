import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { createDevMiddleware } from "@/middleware/dev";
import { createRequestContextMiddleware, requestContext } from "@/middleware/request-context";
import { UserService } from "@/users/user.service";
import type { User } from "@/users/user.types";
import { InMemoryGroupRepository, InMemoryUserRepository } from "../test-utils/fake-repositories";
import { createFakeLogger } from "../test-utils/fake-logger";

function devEnv(devUser: string): Cloudflare.DevEnv {
  return { DEV_USER: devUser } as unknown as Cloudflare.DevEnv;
}

function setup() {
  const users = new InMemoryUserRepository();
  const groups = new InMemoryGroupRepository();
  const userService = new UserService(users, groups);
  const logger = createFakeLogger();

  const app = new Hono<{ Bindings: Cloudflare.DevEnv }>()
    .use("*", createRequestContextMiddleware())
    .use(
      "*",
      createDevMiddleware({
        requestContext,
        userService,
        logger,
      }),
    )
    .get("/me", (c) => c.json({ user: requestContext()?.user ?? null }));

  return {
    users,
    groups,
    logger,
    userService,
    request: (requestEnv: Cloudflare.DevEnv = devEnv("alice")) =>
      app.request("/me", {}, requestEnv),
  };
}

describe("devMiddleware", () => {
  it("onboards the dev users and attaches the DEV_USER to the request context", async () => {
    const { request, users, logger } = setup();

    const response = await request();

    expect(response.status).toBe(200);
    const body = await response.json<{ user: User | null }>();
    expect(body.user).toMatchObject({
      subject: "alice",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "",
    });
    expect(users.users.map((user) => user.subject).sort()).toEqual(["alice", "bob"]);
    expect(logger.calls).toHaveLength(0);
  });

  it("logs an error and continues when onboarding a dev user fails", async () => {
    const { request, logger, userService } = setup();
    vi.spyOn(userService, "onboardUser").mockRejectedValueOnce(new Error("alice boom"));

    const response = await request(devEnv("bob"));

    expect(response.status).toBe(200);
    const body = await response.json<{ user: User | null }>();
    expect(body.user?.subject).toBe("bob");
    expect(logger.calls).toEqual([{ level: "error", message: "alice boom", context: {} }]);
  });
});
