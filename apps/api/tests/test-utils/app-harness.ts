import { afterEach, beforeEach, vi } from "vitest";
import worker from "@/index";
import { createTestDatabase, type TestDatabase } from "./fake-d1";
import {
  CloudflareAccessMock,
  createTestJwtIssuer,
  type IdentityResponse,
  type TestJwtIssuer,
} from "./jwt";
import type { CloudflareEnv } from "@/types/cloudflare-env";

export const TEAM_DOMAIN = "https://team.example.test";
export const POLICY_AUD = "policy-aud-123";

export interface RequestOptions {
  readonly token?: string;
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly json?: unknown;
}

export interface AppHarness {
  readonly executionContext: ExecutionContext;
  readonly access: CloudflareAccessMock;
  readonly issuer: TestJwtIssuer;
  readonly env: CloudflareEnv;
  api: (path: string, options?: RequestOptions) => Promise<Response>;
  login: (options: { sub: string; identity: IdentityResponse }) => Promise<string>;
}

export function createEnv(database: TestDatabase): CloudflareEnv {
  return {
    DB: database.d1,
    POLICY_AUD,
    TEAM_DOMAIN,
  } as unknown as CloudflareEnv;
}

const executionContext = {
  waitUntil(promise: Promise<unknown>): void {
    void promise;
  },
  passThroughOnException(): void {
    throw new Error("passThroughOnException is not supported in tests.");
  },
  props: {},
} as unknown as ExecutionContext;

export function createAppHarness(): AppHarness {
  let testDatabase: TestDatabase;
  let access: CloudflareAccessMock;
  let issuer: TestJwtIssuer;
  let env: CloudflareEnv;

  beforeEach(async () => {
    testDatabase = createTestDatabase();
    issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
    access = new CloudflareAccessMock(TEAM_DOMAIN, issuer.jwks);
    vi.stubGlobal("fetch", access.fetch);
    env = createEnv(testDatabase);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    testDatabase.close();
  });

  return {
    executionContext,
    get access() {
      return access;
    },
    get issuer() {
      return issuer;
    },
    get env() {
      return env;
    },
    async api(path: string, options: RequestOptions = {}): Promise<Response> {
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
    },
    async login({ sub, identity }: { sub: string; identity: IdentityResponse }): Promise<string> {
      access.identities.set(sub, identity);
      return issuer.signToken({ sub });
    },
  };
}
