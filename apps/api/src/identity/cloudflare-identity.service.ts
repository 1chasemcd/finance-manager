import type { Logger } from "@/core/logger";
import { err, ok, type Result } from "@finapp/result";
import {
  createRemoteJWKSet,
  customFetch,
  jwtVerify,
  type JWTPayload,
  type RemoteJWKSet,
} from "jose";

interface Env {
  POLICY_AUD: string;
  TEAM_DOMAIN: string;
}

type AppJWTPayload = JWTPayload & { sub: string };

export interface IdentityService {
  jwtVerify(token: string, env: Env): Promise<Result<AppJWTPayload>>;
  getIdentity(token: string, env: Env): Promise<Result<CloudflareAccessIdentity>>;
}

export class CloudflareIdentityService implements IdentityService {
  private jwks: RemoteJWKSet | undefined;
  constructor(
    private readonly handleFetch: typeof fetch,
    private readonly logger: Logger,
  ) {}

  async jwtVerify(token: string, env: Env): Promise<Result<AppJWTPayload>> {
    try {
      const url = new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`);
      this.jwks ??= createRemoteJWKSet(url, { [customFetch]: this.handleFetch });

      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: env.TEAM_DOMAIN,
        audience: env.POLICY_AUD,
      });

      return ok(payload as AppJWTPayload);
    } catch (e) {
      this.logger.warn("JWT verification failure", {
        error: e instanceof Error ? e.message : String(e),
      });
      return err();
    }
  }

  async getIdentity(token: string, env: Env): Promise<Result<CloudflareAccessIdentity>> {
    const url = `${env.TEAM_DOMAIN}/cdn-cgi/access/get-identity`;

    try {
      const response = await this.handleFetch(url, {
        method: "GET",
        headers: {
          Cookie: `CF_Authorization=${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        this.logger.error("Cloudflare identity endpoint error response", {
          status: response.status,
          response: await response.text(),
        });
        return err();
      }

      const data = await response.json();
      return ok(data as CloudflareAccessIdentity);
    } catch (e) {
      this.logger.error("Cloudflare identity endpoint failure", {
        error: e instanceof Error ? e.message : String(e),
      });
      return err();
    }
  }
}
