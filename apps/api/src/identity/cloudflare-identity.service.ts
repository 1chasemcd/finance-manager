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

interface Unauthorized {
  _tag: "Unauthorized";
}

interface BadGateway {
  _tag: "BadGateway";
}

type AppJWTPayload = JWTPayload & { sub: string };

export interface IdentityService {
  jwtVerify(token: string, env: Env): Promise<Result<AppJWTPayload, Unauthorized>>;
  getIdentity(token: string, env: Env): Promise<Result<CloudflareAccessIdentity, BadGateway>>;
}

export class CloudflareIdentityService implements IdentityService {
  private jwks: RemoteJWKSet | undefined;
  constructor(private readonly handleFetch: typeof fetch) {}

  async jwtVerify(token: string, env: Env): Promise<Result<AppJWTPayload, Unauthorized>> {
    try {
      const url = new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`);
      this.jwks ??= createRemoteJWKSet(url, { [customFetch]: this.handleFetch });

      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: env.TEAM_DOMAIN,
        audience: env.POLICY_AUD,
      });

      return ok(payload as AppJWTPayload);
    } catch {
      return err("Unauthorized");
    }
  }

  async getIdentity(
    token: string,
    env: Env,
  ): Promise<Result<CloudflareAccessIdentity, BadGateway>> {
    const url = `${env.TEAM_DOMAIN}/cdn-cgi/access/get-identity`;

    let response: Response;

    try {
      response = await this.handleFetch(url, {
        method: "GET",
        headers: {
          Cookie: `CF_Authorization=${token}`,
          Accept: "application/json",
        },
      });
    } catch {
      return err("BadGateway");
    }

    if (!response.ok) return err("BadGateway");

    try {
      const data = await response.json();
      return ok(data as CloudflareAccessIdentity);
    } catch {
      return err("BadGateway");
    }
  }
}
