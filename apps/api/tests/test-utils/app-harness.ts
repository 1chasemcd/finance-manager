import { createCloudflareAccessMock, createTestJwtIssuer } from "./jwt";
import { createFetchMock } from "./fetch-mock";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { createTestHarness } from "wrangler";
import path from "path";
import { clearD1 } from "./d1";

const TEAM_DOMAIN = "https://mcdnld.cloudflareaccess.com";
const POLICY_AUD = "policy-aud-123";

export interface RequestOptions {
  readonly token?: string;
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly json?: unknown;
}

export interface AppHarness {
  api: (path: string, options?: RequestOptions) => Promise<Response>;
  login: (identity: CloudflareAccessIdentity) => Promise<string>;
}

export async function createWorker() {
  const issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
  const access = createCloudflareAccessMock(issuer);
  const server = createTestHarness({
    workers: [
      {
        configPath: path.join(__PACKAGE_ROOT__, "wrangler.jsonc"),
        env: "prod",
        vars: {
          TEAM_DOMAIN,
          POLICY_AUD,
        },
      },
    ],
  });

  const worker = server.getWorker<Cloudflare.Env>();
  let env: Cloudflare.Env;

  beforeAll(async () => {
    await server.listen();
    await worker.applyD1Migrations("DB");
    env = await worker.getEnv();
  });

  beforeEach(() => {
    const fetchMock = createFetchMock();
    fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/certs`, access.certs);
    fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/get-identity`, access.getIdentity);
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock.handleFetch);
  });

  afterEach(async () => {
    vi.resetAllMocks();
    access.reset();
    await clearD1(env.DB);
  });

  afterAll(async () => {
    await server.close();
  });

  function api(path: string, options: RequestOptions = {}): Promise<Response> {
    const headers: [string, string][] = [];
    if (options.token !== undefined) headers.push(["Cf-Access-Jwt-Assertion", options.token]);
    if (options.json !== undefined) headers.push(["Content-Type", "application/json"]);

    return server.fetch(`http://test.local${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.json === undefined ? {} : { body: JSON.stringify(options.json) }),
    }) as unknown as Promise<Response>;
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
  };
}
