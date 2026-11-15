import { describe, expect, it } from "vitest";
import { createWorker } from "./test-utils/app-harness";

const { app, login } = await createWorker();
const testUser = { email: "test@example.com", name: "Test User" };

describe("/api/health", () => {
  it("responds without a token", async () => {
    const response = await app.get("/api/health");

    expect(response.status).toBe(200);
    expect(await response.json<{ status: string }>()).toEqual({ status: "ok" });
  });
});

describe("authentication", () => {
  it("produces response for valid token", async () => {
    console.warn("test2");
    const token = await login(testUser);
    expect((await app.auth(token).get("/api/account")).status).toBe(200);
  });

  it("rejects request without token", async () => {
    expect((await app.get("/api/account")).status).toBe(401);
  });

  it("rejects malformed tokens", async () => {
    expect((await app.auth("not-a-jwt").get("/api/account")).status).toBe(401);
  });

  it("responds 409 when the identity email already belongs to another user", async () => {
    const ownerToken = await login({ email: "shared@example.com", name: "Email Owner" });
    expect((await app.auth(ownerToken).get("/api/account")).status).toBe(200);

    const token = await login({ email: "shared@example.com", name: "Email Squatter" });
    const response = await app.auth(token).get("/api/account");

    expect(response.status).toBe(409);
  });
});
