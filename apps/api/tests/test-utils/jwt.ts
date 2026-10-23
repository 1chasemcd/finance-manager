import { decodeJwt, exportJWK, generateKeyPair, SignJWT, type JWK } from "jose";

interface TestJwtClaims {
  readonly sub: string;
  readonly aud?: string;
  readonly iss?: string;
  readonly exp?: number;
  readonly [claim: string]: unknown;
}

export interface TestJwtIssuer {
  readonly jwks: { keys: JWK[] };
  signToken(claims: TestJwtClaims): Promise<string>;
}

export async function createTestJwtIssuer(
  issuer: string,
  audience: string,
): Promise<TestJwtIssuer> {
  const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
  const publicJwk = await exportJWK(publicKey);
  const kid = "test-signing-key";

  return {
    jwks: { keys: [{ ...publicJwk, kid, alg: "RS256", use: "sig" }] },
    signToken(claims): Promise<string> {
      const { exp, iss, aud, ...rest } = claims;
      return new SignJWT(rest)
        .setProtectedHeader({ alg: "RS256", kid })
        .setIssuer(iss ?? issuer)
        .setAudience(aud ?? audience)
        .setIssuedAt()
        .setExpirationTime(exp ?? "10m")
        .sign(privateKey);
    },
  };
}

export interface CloudflareAccessMock {
  readonly reset: () => void;
  readonly setupIdentity: (sub: string, identity: CloudflareAccessIdentity) => void;
  readonly certs: (request: Request) => Response;
  readonly getIdentity: (request: Request) => Response;
}

export function createCloudflareAccessMock(tokenIssuer: TestJwtIssuer): CloudflareAccessMock {
  const identities = new Map<string, CloudflareAccessIdentity>();

  return {
    reset: () => {
      identities.clear();
    },
    setupIdentity: (sub, identity) => identities.set(sub, identity),
    certs: () => {
      return Response.json(tokenIssuer.jwks);
    },
    getIdentity: (request) => {
      const subject = subjectFromCookie(new Headers(request.headers).get("Cookie"));
      const res = identities.get(subject);
      if (res) return Response.json(res);
      return Response.error();
    },
  };
}

function subjectFromCookie(cookie: string | null): string {
  const match = /CF_Authorization=([^;]+)/.exec(cookie ?? "");
  const token = match?.[1];
  if (token === undefined) return "";
  return decodeJwt(token).sub ?? "";
}
