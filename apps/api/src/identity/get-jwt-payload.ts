import { ok, type Result } from "@finapp/result";
import type { JWTPayload } from "hono/utils/jwt/types";
import { jwtVerify, createRemoteJWKSet, type RemoteJWKSet } from "jose";
import { unauthorized, type Unauthorized } from "../core/result";

interface Env {
  POLICY_AUD: string;
  TEAM_DOMAIN: string;
}

type AppJWTPayload = JWTPayload & { email: string };

export async function getJwtPayload(
  token: string | undefined,
  env: Env,
): Promise<Result<AppJWTPayload, Unauthorized>> {
  if (!token) return unauthorized();
  const issuer = `https://${env.TEAM_DOMAIN}`;

  try {
    const url = new URL(`${issuer}/cdn-cgi/access/certs`);
    const JWKS: RemoteJWKSet = createRemoteJWKSet(url);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience: env.POLICY_AUD,
    });

    return ok(payload as AppJWTPayload);
  } catch {
    return unauthorized();
  }
}
