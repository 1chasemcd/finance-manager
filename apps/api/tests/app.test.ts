import { describe, expect, it } from "vitest";
import worker from "@/index";
import { createTestDatabase } from "./test-utils/fake-d1";
import { createAppHarness, createEnv } from "./test-utils/app-harness";

const harness = createAppHarness();
const { api, login, readJson, usersWithSubject } = harness;

describe("GET /api/health", () => {
  it("responds without a token", async () => {
    const response = await api("/api/health");

    expect(response.status).toBe(200);
    expect(await readJson<{ status: string }>(response)).toEqual({ status: "ok" });
  });
});

describe("authentication", () => {
  it("rejects requests without a token", async () => {
    expect((await api("/api/account")).status).toBe(401);
  });

  it("ignores the dev user header outside development", async () => {
    const response = await worker.fetch(
      new Request("http://test.local/api/account", {
        headers: { "Dev-User-Sub": "intruder" },
      }),
      harness.env,
      harness.executionContext,
    );

    expect(response.status).toBe(401);
    expect(usersWithSubject("intruder")).toBe(0);
  });

  it("rejects malformed tokens", async () => {
    expect((await api("/api/account", { token: "not-a-jwt" })).status).toBe(401);
  });

  it("rejects tokens issued by a different team", async () => {
    const token = await harness.issuer.signToken({
      sub: "intruder",
      iss: "https://evil.example.test",
    });

    expect((await api("/api/account", { token })).status).toBe(401);
    expect(usersWithSubject("intruder")).toBe(0);
  });

  it("rejects tokens issued for a different application", async () => {
    const token = await harness.issuer.signToken({
      sub: "intruder",
      aud: "another-application-aud",
    });

    expect((await api("/api/account", { token })).status).toBe(401);
    expect(usersWithSubject("intruder")).toBe(0);
  });
});

describe("worker bindings", () => {
  it("keeps each set of bindings pointed at its own database", async () => {
    const otherDatabase = createTestDatabase();
    const otherEnv = createEnv(otherDatabase);

    try {
      const token = await login("multi-tenant", {
        email: "multi@example.com",
        name: "Multi Tenant",
      });
      expect((await api("/api/account", { token })).status).toBe(200);
      expect(usersWithSubject("multi-tenant")).toBe(1);

      const response = await worker.fetch(
        new Request("http://test.local/api/account", {
          headers: { "Cf-Access-Jwt-Assertion": token },
        }),
        otherEnv,
        harness.executionContext,
      );

      expect(response.status).toBe(200);
      expect(
        otherDatabase.all("SELECT id FROM users WHERE subject = ?", ["multi-tenant"]),
      ).toHaveLength(1);
      expect(usersWithSubject("multi-tenant")).toBe(1);
    } finally {
      otherDatabase.close();
    }
  });
});
