import {
  createCloudflareAccessMock,
  createTestJwtIssuer,
  type CloudflareAccessMock,
  type TestJwtIssuer,
} from "./jwt";
import { createFetchMock } from "./fetch-mock";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { createTestHarness, type TestHarness } from "wrangler";
import path from "path";
import { clearD1 } from "./d1";

const TEAM_DOMAIN = "https://mcdnld.cloudflareaccess.com";
const POLICY_AUD = "policy-aud-123";
const BASE_URL = "http://finap.mcdnld.cc";

interface Fetcher {
  get: (path: string) => Promise<Response>;
  post: (path: string, body?: unknown) => Promise<Response>;
  put: (path: string, body?: unknown) => Promise<Response>;
  delete: (path: string) => Promise<Response>;
}

class AppFetcher implements Fetcher {
  constructor(
    private readonly server: TestHarness,
    private readonly token?: string,
  ) {}
  get(path: string) {
    return this.fetch(path, "GET");
  }
  post(path: string, body: unknown) {
    return this.fetch(path, "POST", body);
  }
  put(path: string, body: unknown) {
    return this.fetch(path, "PUT", body);
  }
  delete(path: string) {
    return this.fetch(path, "DELETE");
  }

  auth(token: string): Fetcher {
    return new AppFetcher(this.server, token);
  }

  private fetch(path: string, method: string, body?: unknown): Promise<Response> {
    const headers: [string, string][] = [];
    if (this.token !== undefined) headers.push(["Cf-Access-Jwt-Assertion", this.token]);
    if (body !== undefined) headers.push(["Content-Type", "application/json"]);

    return this.server.fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }) as unknown as Promise<Response>;
  }
}

export interface AppHarness {
  app: Fetcher & { auth: (token: string) => Fetcher };
  getEnv: () => Cloudflare.Env;
  login: (identity: CloudflareAccessIdentity) => Promise<string>;
}

export function createWorker() {
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

  const app = new AppFetcher(server);
  let access: CloudflareAccessMock;
  let issuer: TestJwtIssuer;
  let env: Cloudflare.Env;

  beforeAll(async () => {
    await server.listen();
    const worker = server.getWorker<Cloudflare.Env>();
    await worker.applyD1Migrations("DB");

    env = await worker.getEnv();
    issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
    access = createCloudflareAccessMock(issuer);
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

  return {
    app,
    getEnv: () => env,
    login: async (identity: CloudflareAccessIdentity): Promise<string> => {
      const sub = crypto.randomUUID();
      const token = await issuer.signToken({ sub });
      access.setupIdentity(sub, identity);
      await app.auth(token).get("/api/account");
      return token;
    },
  };
}
