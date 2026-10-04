import { ok, err, type Result } from "@finapp/result";
import type { JWTPayload } from "hono/utils/jwt/types";
import { jwtVerify, createRemoteJWKSet, type RemoteJWKSet } from "jose";

interface Env {
  POLICY_AUD: string;
  TEAM_DOMAIN: string;
}

interface Unauthorized {
  _tag: "Unauthorized";
}

type AppJWTPayload = JWTPayload & { sub: string };

let JWKS: RemoteJWKSet | undefined;

export async function getJwtPayload(
  token: string,
  env: Env,
): Promise<Result<AppJWTPayload, Unauthorized>> {
  try {
    const url = new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`);
    JWKS ??= createRemoteJWKSet(url);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });

    return ok(payload as AppJWTPayload);
  } catch {
    return err("Unauthorized");
  }
}
