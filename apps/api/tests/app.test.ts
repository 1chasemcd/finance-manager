import { describe, expect, it } from "vitest";
import { createWorker } from "./test-utils/app-harness";

const { api, login } = await createWorker();
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
    console.warn("test2");
    const token = await login(testUser);
    expect((await api("/api/account", { token })).status).toBe(200);
  });

  it("rejects request without token", async () => {
    expect((await api("/api/account")).status).toBe(401);
  });

  it("rejects malformed tokens", async () => {
    expect((await api("/api/account", { token: "not-a-jwt" })).status).toBe(401);
  });

  // it("responds 409 when the identity email already belongs to another user", async () => {
  //   const ownerToken = await login({ email: "shared@example.com", name: "Email Owner" });
  //   expect((await api("/api/account", { token: ownerToken })).status).toBe(200);

  //   const token = await login({ email: "shared@example.com", name: "Email Squatter" });
  //   const response = await api("/api/account", { token });

  //   expect(response.status).toBe(409);
  // });
});
