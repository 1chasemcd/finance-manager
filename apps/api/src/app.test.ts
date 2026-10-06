import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import worker from "./index";
import { createTestDatabase, type TestDatabase } from "./test-support/fake-d1";
import { applyMigrations } from "./test-support/migrations";
import {
  CloudflareAccessMock,
  createTestJwtIssuer,
  type IdentityResponse,
  type TestJwtIssuer,
} from "./test-support/jwt";

const TEAM_DOMAIN = "https://team.example.test";
const POLICY_AUD = "policy-aud-123";

interface AccountUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface AccountResponse {
  me: AccountUser;
  groupMembers: AccountUser[];
  pendingInvite?: {
    inviteId: string;
    groupMembers: AccountUser[];
    createdAt: string;
  };
}

interface RequestOptions {
  readonly token?: string;
  readonly method?: "GET" | "POST";
  readonly json?: unknown;
}

let database: TestDatabase;
let access: CloudflareAccessMock;
let issuer: TestJwtIssuer;
let env: CloudflareBindings;

const executionContext = {
  waitUntil(promise: Promise<unknown>): void {
    void promise;
  },
  passThroughOnException(): void {
    throw new Error("passThroughOnException is not supported in tests.");
  },
  props: {},
} as unknown as ExecutionContext;

beforeAll(async () => {
  database = createTestDatabase();
  applyMigrations(database);
  issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
  access = new CloudflareAccessMock(TEAM_DOMAIN, issuer.jwks);
  vi.stubGlobal("fetch", access.fetch);
  env = {
    DB: database.d1,
    POLICY_AUD,
    TEAM_DOMAIN,
  } as unknown as CloudflareBindings;
});

afterAll(() => {
  vi.unstubAllGlobals();
  database.close();
});

async function api(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers = new Headers();
  if (options.token !== undefined) headers.set("Cf-Access-Jwt-Assertion", options.token);
  if (options.json !== undefined) headers.set("Content-Type", "application/json");

  return worker.fetch(
    new Request(`http://test.local${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.json === undefined ? {} : { body: JSON.stringify(options.json) }),
    }),
    env,
    executionContext,
  );
}

async function login(sub: string, identity: IdentityResponse): Promise<string> {
  access.identities.set(sub, identity);
  return issuer.signToken({ sub });
}

function readJson<T>(response: Response): Promise<T> {
  return response.json();
}

function countRows(table: string): number {
  const rows = database.all<Record<string, number>>(`SELECT COUNT(*) AS count FROM ${table}`);
  return rows[0]?.["count"] ?? 0;
}

function usersWithSubject(sub: string): number {
  return (
    database.all<Record<string, number>>("SELECT COUNT(*) AS count FROM users WHERE subject = ?", [
      sub,
    ])[0]?.["count"] ?? 0
  );
}

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

  it("rejects malformed tokens", async () => {
    expect((await api("/api/account", { token: "not-a-jwt" })).status).toBe(401);
  });

  it("rejects tokens issued by a different team", async () => {
    const token = await issuer.signToken({
      sub: "intruder",
      iss: "https://evil.example.test",
    });

    expect((await api("/api/account", { token })).status).toBe(401);
    expect(usersWithSubject("intruder")).toBe(0);
  });

  it("rejects tokens issued for a different application", async () => {
    const token = await issuer.signToken({
      sub: "intruder",
      aud: "another-application-aud",
    });

    expect((await api("/api/account", { token })).status).toBe(401);
    expect(usersWithSubject("intruder")).toBe(0);
  });

  it("onboards a first-time visitor from the identity profile", async () => {
    const token = await login("first-timer", {
      email: "first@example.com",
      name: "First Timer",
    });

    const response = await api("/api/account", { token });

    expect(response.status).toBe(200);
    const body = await readJson<AccountResponse>(response);
    expect(body.me).toEqual({
      firstName: "First",
      lastName: "Timer",
      email: "first@example.com",
    });
    expect(body.groupMembers).toEqual([
      { firstName: "First", lastName: "Timer", email: "first@example.com" },
    ]);
    expect(body).not.toHaveProperty("pendingInvite");
    expect(access.identityRequests).toContain("first-timer");
  });

  it("keeps a single user record across repeat visits", async () => {
    const token = await login("repeat-visitor", {
      email: "repeat@example.com",
      name: "Repeat Visitor",
    });
    expect((await api("/api/account", { token })).status).toBe(200);

    const identityCalls = access.identityRequests.filter((sub) => sub === "repeat-visitor");
    expect((await api("/api/account", { token })).status).toBe(200);
    expect(access.identityRequests.filter((sub) => sub === "repeat-visitor")).toHaveLength(
      identityCalls.length,
    );
    expect(usersWithSubject("repeat-visitor")).toBe(1);
    expect(access.jwksRequests).toBe(1);
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

  it("keeps each set of bindings pointed at its own database", async () => {
    const otherDatabase = createTestDatabase();
    applyMigrations(otherDatabase);
    const otherEnv = {
      DB: otherDatabase.d1,
      POLICY_AUD,
      TEAM_DOMAIN,
    } as unknown as CloudflareBindings;

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
        executionContext,
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

describe("group invites", () => {
  async function onboard(sub: string, email: string, name: string): Promise<string> {
    const token = await login(sub, { email, name });
    const response = await api("/api/account", { token });
    expect(response.status).toBe(200);
    return token;
  }

  it("rejects an invite payload that is not a valid email", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "not-an-email" },
    });

    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON bodies", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await worker.fetch(
      new Request("http://test.local/api/invite", {
        method: "POST",
        headers: {
          "Cf-Access-Jwt-Assertion": token,
          "Content-Type": "application/json",
        },
        body: "{ not json",
      }),
      env,
      executionContext,
    );

    expect(response.status).toBe(400);
  });

  it("rejects requests without a JSON content type", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await worker.fetch(
      new Request("http://test.local/api/invite", {
        method: "POST",
        headers: {
          "Cf-Access-Jwt-Assertion": token,
          "Content-Type": "text/plain",
        },
        body: "email=payload@example.com",
      }),
      env,
      executionContext,
    );

    expect(response.status).toBe(400);
  });

  it("responds 204 without creating an invite for an unknown email", async () => {
    const token = await login("solo-inviter", {
      email: "solo@example.com",
      name: "Solo Inviter",
    });
    const invitesBefore = countRows("group_invites");

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "ghost@example.com" },
    });

    expect(response.status).toBe(204);
    expect(countRows("group_invites")).toBe(invitesBefore);
  });

  it("walks an invite from invitation through acceptance", async () => {
    const aliceToken = await onboard("alice", "alice@example.com", "Alice Smith");
    const bobToken = await onboard("bob", "bob@example.com", "Bob Jones");

    const inviteResponse = await api("/api/invite", {
      method: "POST",
      token: aliceToken,
      json: { email: "bob@example.com" },
    });
    expect(inviteResponse.status).toBe(204);

    const pending = await readJson<AccountResponse>(await api("/api/account", { token: bobToken }));
    expect(pending.pendingInvite).toBeDefined();
    expect(pending.pendingInvite?.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
    expect(typeof pending.pendingInvite?.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(pending.pendingInvite?.createdAt ?? ""))).toBe(false);
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const acceptResponse = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(acceptResponse.status).toBe(204);

    const afterAccept = await readJson<AccountResponse>(
      await api("/api/account", { token: bobToken }),
    );
    expect(afterAccept).not.toHaveProperty("pendingInvite");
    expect(afterAccept.groupMembers).toHaveLength(2);
    expect(afterAccept.groupMembers).toEqual(
      expect.arrayContaining([
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
        { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
      ]),
    );

    const aliceAfter = await readJson<AccountResponse>(
      await api("/api/account", { token: aliceToken }),
    );
    expect(aliceAfter.groupMembers).toHaveLength(2);
    expect(aliceAfter).not.toHaveProperty("pendingInvite");

    const repeatAccept = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(repeatAccept.status).toBe(404);
  });

  it("removes the invite when it is declined", async () => {
    const carolToken = await onboard("carol", "carol@example.com", "Carol Danvers");
    const daveToken = await onboard("dave", "dave@example.com", "Dave Eggers");

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: carolToken,
          json: { email: "dave@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await readJson<AccountResponse>(
      await api("/api/account", { token: daveToken }),
    );
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const declineResponse = await api(`/api/invite/${inviteId}/decline`, {
      method: "POST",
      token: daveToken,
    });
    expect(declineResponse.status).toBe(204);

    const afterDecline = await readJson<AccountResponse>(
      await api("/api/account", { token: daveToken }),
    );
    expect(afterDecline).not.toHaveProperty("pendingInvite");
    expect(afterDecline.groupMembers).toEqual([
      { firstName: "Dave", lastName: "Eggers", email: "dave@example.com" },
    ]);

    const repeatDecline = await api(`/api/invite/${inviteId}/decline`, {
      method: "POST",
      token: daveToken,
    });
    expect(repeatDecline.status).toBe(404);
  });

  it("does not let another user accept somebody else's invite", async () => {
    const carolToken = await login("carol", {
      email: "carol@example.com",
      name: "Carol Danvers",
    });
    const eveToken = await onboard("eve", "eve@example.com", "Eve Eves");
    const frankToken = await onboard("frank", "frank@example.com", "Frank Fontaine");

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: carolToken,
          json: { email: "eve@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await readJson<AccountResponse>(await api("/api/account", { token: eveToken }));
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const hijack = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: frankToken,
    });
    expect(hijack.status).toBe(404);

    const eveAfter = await readJson<AccountResponse>(
      await api("/api/account", { token: eveToken }),
    );
    expect(eveAfter.pendingInvite?.inviteId).toBe(inviteId);
    expect(eveAfter.groupMembers).toEqual([
      { firstName: "Eve", lastName: "Eves", email: "eve@example.com" },
    ]);
  });

  it("responds 404 for unknown invite ids", async () => {
    const token = await onboard("unknown-invite", "unknown-invite@example.com", "Unknown Invite");

    expect((await api("/api/invite/not-a-real-id/accept", { method: "POST", token })).status).toBe(
      404,
    );
    expect((await api("/api/invite/not-a-real-id/decline", { method: "POST", token })).status).toBe(
      404,
    );
  });
});
