import { describe, expect, it } from "vitest";
import { createAppHarness, TEAM_DOMAIN } from "./test-utils/app-harness";

const harness = await createAppHarness();
const { api, login } = harness;
const testUser = { email: "test@example.com", name: "Test User" };

describe("/api/health", () => {
  it("responds without a token", async () => {
    const response = await api("/api/health");

    expect(response.status).toBe(200);
    expect(await response.json<{ status: string }>()).toEqual({ status: "ok" });
  });
});

describe("authentication", () => {
  it("produces response for valid token", async () => {
    const token = await login(testUser);
    expect((await api("/api/account", { token })).status).toBe(200);
  });

  it("rejects request without token", async () => {
    expect((await api("/api/account")).status).toBe(401);
  });

  it("rejects malformed tokens", async () => {
    expect((await api("/api/account", { token: "not-a-jwt" })).status).toBe(401);
  });

  it("caches a single user record across repeat visits", async () => {
    const token = await login(testUser);

    expect((await api("/api/account", { token })).status).toBe(200);
    expect((await api("/api/account", { token })).status).toBe(200);

    expect(
      harness.fetchMock.requests.filter((r) => r.url.endsWith("/cdn-cgi/access/get-identity")),
    ).toHaveLength(1);
  });

  it("responds 502 when the identity endpoint is unavailable", async () => {
    harness.fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/get-identity`, () =>
      Response.error(),
    );

    const token = await login({ sub: "identity-outage", identity: "error" });
    const response = await api("/api/account", { token });
    expect(response.status).toBe(502);
  });

  it("responds 502 when the identity endpoint returns invalid JSON", async () => {
    harness.fetchMock.register(
      `${TEAM_DOMAIN}/cdn-cgi/access/get-identity`,
      () => new Response("not json"),
    );

    const token = await login({ sub: "identity-garbage", identity: "invalid-json" });
    const response = await api("/api/account", { token });
    expect(response.status).toBe(502);
  });

  it("responds 409 when the identity email already belongs to another user", async () => {
    const ownerToken = await login({ email: "shared@example.com", name: "Email Owner" });
    expect((await api("/api/account", { token: ownerToken })).status).toBe(200);

    const token = await login({ email: "shared@example.com", name: "Email Squatter" });
    const response = await api("/api/account", { token });

    expect(response.status).toBe(409);
  });
});
