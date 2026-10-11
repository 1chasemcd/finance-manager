import { describe, expect, it } from "vitest";
import { createAppHarness } from "./test-utils/app-harness";
import type { AccountInfoResponse } from "@/accounts/account.types";

const harness = createAppHarness();
const { api, login, readJson, usersWithSubject } = harness;

describe("GET /api/account", () => {
  it("onboards a first-time visitor from the identity profile", async () => {
    const token = await login("first-timer", {
      email: "first@example.com",
      name: "First Timer",
    });

    const response = await api("/api/account", { token });

    expect(response.status).toBe(200);
    const body = await readJson<AccountInfoResponse>(response);
    expect(body.me).toEqual({
      firstName: "First",
      lastName: "Timer",
      email: "first@example.com",
    });
    expect(body.groupMembers).toEqual([
      { firstName: "First", lastName: "Timer", email: "first@example.com" },
    ]);
    expect(body).not.toHaveProperty("pendingInvite");
    expect(harness.access.identityRequests).toContain("first-timer");
  });

  it("keeps a single user record across repeat visits", async () => {
    const token = await login("repeat-visitor", {
      email: "repeat@example.com",
      name: "Repeat Visitor",
    });
    expect((await api("/api/account", { token })).status).toBe(200);

    const identityCalls = harness.access.identityRequests.filter((sub) => sub === "repeat-visitor");
    expect((await api("/api/account", { token })).status).toBe(200);
    expect(harness.access.identityRequests.filter((sub) => sub === "repeat-visitor")).toHaveLength(
      identityCalls.length,
    );
    expect(usersWithSubject("repeat-visitor")).toBe(1);
    expect(harness.access.jwksRequests).toBe(1);
  });

  it("responds 502 when the identity endpoint is unavailable", async () => {
    const token = await login("identity-outage", "error");

    const response = await api("/api/account", { token });

    expect(response.status).toBe(502);
    expect(usersWithSubject("identity-outage")).toBe(0);
  });

  it("responds 502 when the identity endpoint returns invalid JSON", async () => {
    const token = await login("identity-garbage", "invalid-json");

    expect((await api("/api/account", { token })).status).toBe(502);
    expect(usersWithSubject("identity-garbage")).toBe(0);
  });

  it("responds 409 when the identity email already belongs to another user", async () => {
    const ownerToken = await login("email-owner", {
      email: "shared@example.com",
      name: "Email Owner",
    });
    expect((await api("/api/account", { token: ownerToken })).status).toBe(200);

    const token = await login("email-squatter", {
      email: "shared@example.com",
      name: "Email Squatter",
    });
    const response = await api("/api/account", { token });

    expect(response.status).toBe(409);
    expect(usersWithSubject("email-squatter")).toBe(0);
  });
});
