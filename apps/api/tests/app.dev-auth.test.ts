import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import worker from "@/index";
import { createTestDatabase, type TestDatabase } from "./test-utils/fake-d1";
import type { CloudflareEnv } from "@/types/cloudflare-env";

interface AccountUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface AccountResponse {
  me: AccountUser;
  groupMembers: AccountUser[];
}

let database: TestDatabase;
let env: CloudflareEnv;
let randomApiRequests = 0;
let rileyEmail: string | undefined;

const executionContext = {
  waitUntil(promise: Promise<unknown>): void {
    void promise;
  },
  passThroughOnException(): void {
    throw new Error("passThroughOnException is not supported in tests.");
  },
  props: {},
} as unknown as ExecutionContext;

beforeAll(() => {
  vi.stubGlobal("__ENVIRONMENT__", "dev");

  vi.stubGlobal("fetch", (input: string | URL): Response => {
    const url = input instanceof URL ? input.href : input;
    if (!url.startsWith("https://randomapi.dev/")) {
      throw new Error(`Unexpected fetch in dev auth tests: ${url}`);
    }
    randomApiRequests += 1;
    return new Response(JSON.stringify({ data: [{ firstName: "Riley", lastName: "Test" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  database = createTestDatabase();
  env = {
    DB: database.d1,
  } as unknown as CloudflareEnv;
});

afterAll(() => {
  vi.unstubAllGlobals();
  database.close();
});

async function api(path: string, devUserSub?: string): Promise<Response> {
  const headers = new Headers();
  if (devUserSub !== undefined) headers.set("Dev-User-Sub", devUserSub);

  return worker.fetch(
    new Request(`http://test.local${path}`, {
      headers,
    }),
    env,
    executionContext,
  );
}

function readJson<T>(response: Response): Promise<T> {
  return response.json();
}

function usersWithSubject(sub: string): number {
  return (
    database.all<Record<string, number>>("SELECT COUNT(*) AS count FROM users WHERE subject = ?", [
      sub,
    ])[0]?.["count"] ?? 0
  );
}

describe("dev authentication", () => {
  it("rejects requests without a dev user header", async () => {
    expect((await api("/api/account")).status).toBe(401);
  });

  it("onboards an unknown dev user with a generated identity", async () => {
    const response = await api("/api/account", "riley");

    expect(response.status).toBe(200);
    const body = await readJson<AccountResponse>(response);
    expect(body.me).toEqual({
      firstName: "Riley",
      lastName: "Test",
      email: body.me.email,
    });
    expect(body.me.email).toMatch(/^Riley\.Test\.\d{4}@gmail\.com$/);
    expect(usersWithSubject("riley")).toBe(1);
    expect(randomApiRequests).toBe(1);
    rileyEmail = body.me.email;
  });

  it("logs back in as an existing dev user without regenerating the identity", async () => {
    const response = await api("/api/account", "riley");

    expect(response.status).toBe(200);
    const body = await readJson<AccountResponse>(response);
    expect(body.me.email).toBe(rileyEmail);
    expect(usersWithSubject("riley")).toBe(1);
    expect(randomApiRequests).toBe(1);
  });

  it("keeps each dev user subject separate", async () => {
    const response = await api("/api/account", "casey");

    expect(response.status).toBe(200);
    const body = await readJson<AccountResponse>(response);
    expect(body.me.email).not.toBe(rileyEmail);
    expect(usersWithSubject("casey")).toBe(1);
    expect(usersWithSubject("riley")).toBe(1);
    expect(randomApiRequests).toBe(2);
  });
});
