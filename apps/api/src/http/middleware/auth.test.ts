import { err, ok } from "@finapp/result";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authMiddlewareFactory } from "./auth";
import { getJwtPayload } from "../../identity/get-jwt-payload";
import { getCloudflareIdentity } from "../../identity/get-cloudflare-identity";
import { getRequestContext, runWithRequestContext } from "../../core/request-context";
import { UserService } from "../../users/user.service";
import {
  InMemoryGroupRepository,
  InMemoryUserRepository,
} from "../../test-support/fake-repositories";

vi.mock("../../identity/get-jwt-payload", () => ({ getJwtPayload: vi.fn() }));
vi.mock("../../identity/get-cloudflare-identity", () => ({
  getCloudflareIdentity: vi.fn(),
}));

const env = {
  POLICY_AUD: "policy-aud",
  TEAM_DOMAIN: "https://team.example.test",
} as unknown as CloudflareBindings;

function setup() {
  const users = new InMemoryUserRepository();
  const groups = new InMemoryGroupRepository();
  const userService = new UserService(users, groups);
  const state = { handled: false };

  const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("*", (_, next) => runWithRequestContext(next))
    .use("*", authMiddlewareFactory(getRequestContext, userService))
    .get("/protected", (c) => {
      state.handled = true;
      return c.json({ user: getRequestContext().user ?? null });
    });

  return {
    users,
    groups,
    state,
    request: async (token?: string): Promise<Response> => {
      const headers = token === undefined ? {} : { "Cf-Access-Jwt-Assertion": token };
      return await app.request("/protected", { headers }, env);
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("authMiddleware", () => {
  it("rejects requests without a JWT assertion", async () => {
    const { request, state } = setup();

    const response = await request();

    expect(response.status).toBe(401);
    expect(state.handled).toBe(false);
    expect(getJwtPayload).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid JWT", async () => {
    vi.mocked(getJwtPayload).mockResolvedValue(err("Unauthorized"));
    const { request, state } = setup();

    const response = await request("bad-token");

    expect(response.status).toBe(401);
    expect(state.handled).toBe(false);
    expect(getCloudflareIdentity).not.toHaveBeenCalled();
  });

  it("loads an existing user without calling the identity endpoint", async () => {
    const { request, users, groups, state } = setup();
    const seeded = users.add({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      subject: "subject-1",
      groupId: 4,
    });
    vi.mocked(getJwtPayload).mockResolvedValue(ok({ sub: "subject-1" }));

    const response = await request("good-token");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: seeded });
    expect(getCloudflareIdentity).not.toHaveBeenCalled();
    expect(users.users).toHaveLength(1);
    expect(groups.groups).toHaveLength(0);
    expect(state.handled).toBe(true);
  });

  it("onboards an unknown subject using the identity profile", async () => {
    const { request, users, groups } = setup();
    vi.mocked(getJwtPayload).mockResolvedValue(ok({ sub: "subject-new" }));
    vi.mocked(getCloudflareIdentity).mockResolvedValue(
      ok({ email: "jane@example.com", name: "Jane Marie Doe" }),
    );

    const response = await request("good-token");

    expect(response.status).toBe(200);
    expect(getCloudflareIdentity).toHaveBeenCalledWith("good-token", env);
    expect(users.users).toHaveLength(1);
    expect(users.users[0]).toMatchObject({
      subject: "subject-new",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Marie Doe",
    });
    expect(groups.groups).toHaveLength(1);
    expect(users.users[0]?.groupId).toBe(groups.groups[0]?.id);

    const body = await response.json<{ user: { id: number } | null }>();
    expect(body.user?.id).toBe(users.users[0]?.id);
  });

  it("responds 502 when the identity endpoint fails", async () => {
    vi.mocked(getJwtPayload).mockResolvedValue(ok({ sub: "subject-new" }));
    vi.mocked(getCloudflareIdentity).mockResolvedValue(err("BadGateway"));
    const { request, users, state } = setup();

    const response = await request("good-token");

    expect(response.status).toBe(502);
    expect(users.users).toHaveLength(0);
    expect(state.handled).toBe(false);
  });

  it("responds 409 instead of failing when onboarding hits a conflict", async () => {
    const { request, users } = setup();
    users.add({
      email: "taken@example.com",
      firstName: "Already",
      lastName: "There",
      subject: "other-subject",
      groupId: 1,
    });
    vi.mocked(getJwtPayload).mockResolvedValue(ok({ sub: "subject-new" }));
    vi.mocked(getCloudflareIdentity).mockResolvedValue(
      ok({ email: "taken@example.com", name: "New Person" }),
    );

    const response = await request("good-token");

    expect(response.status).toBe(409);
    expect(users.users).toHaveLength(1);
  });
});
