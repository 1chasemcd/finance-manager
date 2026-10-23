import { afterEach, beforeEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "./fake-d1";
import { createCloudflareAccessMock, createTestJwtIssuer } from "./jwt";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { createFetchMock, type FetchMock } from "./fetch-mock";
import { createApp } from "@/app";
import { createContainer, type Container } from "@/container";

export const TEAM_DOMAIN = "https://team.example.test";
export const POLICY_AUD = "policy-aud-123";

const executionContext = {
  waitUntil(promise: Promise<unknown>): void {
    void promise;
  },
  passThroughOnException(): void {
    throw new Error("passThroughOnException is not supported in tests.");
  },
  props: {},
} as unknown as ExecutionContext;

export interface RequestOptions {
  readonly token?: string;
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly json?: unknown;
}

export interface AppHarness {
  api: (path: string, options?: RequestOptions) => Promise<Response>;
  login: (identity: CloudflareAccessIdentity) => Promise<string>;
  fetchMock: FetchMock;
}

function createEnv(database: TestDatabase): CloudflareEnv {
  return {
    DB: database.d1,
    POLICY_AUD,
    TEAM_DOMAIN,
  } as unknown as CloudflareEnv;
}

export async function createAppHarness(): Promise<AppHarness> {
  const issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
  const access = createCloudflareAccessMock(issuer);
  const fetchMock = createFetchMock();

  let testDatabase: TestDatabase;
  let env: CloudflareEnv;
  let container: Container;

  beforeEach(() => {
    access.reset();
    fetchMock.reset();

    testDatabase = createTestDatabase();
    env = createEnv(testDatabase);
    container = createContainer({ ...env, handleFetch: fetchMock.handleFetch });
    fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/certs`, access.certs);
    fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/get-identity`, access.getIdentity);
  });

  afterEach(() => {
    testDatabase.close();
  });

  async function api(path: string, options: RequestOptions = {}): Promise<Response> {
    const headers = new Headers();
    if (options.token !== undefined) headers.set("Cf-Access-Jwt-Assertion", options.token);
    if (options.json !== undefined) headers.set("Content-Type", "application/json");

    return createApp(container).fetch(
      new Request(`http://test.local${path}`, {
        method: options.method ?? "GET",
        headers,
        ...(options.json === undefined ? {} : { body: JSON.stringify(options.json) }),
      }),
      env,
      executionContext,
    );
  }

  async function login(identity: CloudflareAccessIdentity): Promise<string> {
    const sub = crypto.randomUUID();
    const token = await issuer.signToken({ sub });
    access.setupIdentity(sub, identity);
    await api("/api/account", { token });
    return token;
  }

  return {
    api,
    login,
    fetchMock,
  };
}
