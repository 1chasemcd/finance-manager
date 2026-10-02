import { jwtVerify, createRemoteJWKSet, type RemoteJWKSet } from "jose";

interface Env {
  POLICY_AUD: string;
  TEAM_DOMAIN: string;
}

export async function validateJwt(token: string | undefined, env: Env) {
  // Verify the POLICY_AUD environment variable is set
  if (!env.POLICY_AUD) {
    return "NO AUD";
  }

  // Check if token exists
  if (!token) {
    return "NO TOKEN";
  }

  try {
    // Create JWKS from your team domain
    const url = new URL(`https://${env.TEAM_DOMAIN}/cdn-cgi/access/certs`);
    const JWKS: RemoteJWKSet = createRemoteJWKSet(url);

    // Verify the JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${env.TEAM_DOMAIN}`,
      audience: env.POLICY_AUD,
    });

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return message;
  }
}
