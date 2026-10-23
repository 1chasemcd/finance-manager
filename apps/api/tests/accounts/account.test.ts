import { describe, expect, it } from "vitest";
import { createAppHarness } from "./test-utils/app-harness";
import type { AccountInfoResponse } from "@/accounts/account.types";

const harness = await createAppHarness();
const { api, login } = harness;

const testUser = { email: "test@example.com", name: "Test User" };

describe("GET /api/account", () => {
  it("onboards a first-time visitor from the identity profile", async () => {
    const token = await login(testUser);

    const response = await api("/api/account", { token });

    expect(response.status).toBe(200);
    const body = await response.json<AccountInfoResponse>();
    expect(body.me).toEqual({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
    });
    expect(body.groupMembers).toEqual([
      { firstName: "Test", lastName: "User", email: "test@example.com" },
    ]);
    expect(body).not.toHaveProperty("pendingInvite");
  });
});
