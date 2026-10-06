import { decodeJwt, exportJWK, generateKeyPair, SignJWT, type JWK } from "jose";

export interface TestJwtClaims {
  readonly sub: string;
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
      const builder = new SignJWT(rest)
        .setProtectedHeader({ alg: "RS256", kid })
        .setIssuer(typeof iss === "string" ? iss : issuer)
        .setAudience(typeof aud === "string" ? aud : audience)
        .setIssuedAt();

      if (exp === undefined) builder.setExpirationTime("10m");
      else builder.setExpirationTime(exp);

      return builder.sign(privateKey);
    },
  };
}

export type IdentityResponse = Record<string, unknown> | "error" | "invalid-json";

export class CloudflareAccessMock {
  readonly identities = new Map<string, IdentityResponse>();
  readonly identityRequests: string[] = [];
  jwksRequests = 0;

  constructor(
    private readonly teamDomain: string,
    private readonly jwks: { keys: JWK[] },
  ) {}

  readonly fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = toUrl(input);

    if (url === `${this.teamDomain}/cdn-cgi/access/certs`) {
      this.jwksRequests += 1;
      return Promise.resolve(Response.json(this.jwks));
    }

    if (url === `${this.teamDomain}/cdn-cgi/access/get-identity`) {
      const subject = subjectFromCookie(new Headers(init?.headers).get("Cookie"));
      this.identityRequests.push(subject);

      const identity = this.identities.get(subject);
      if (identity === "error") {
        return Promise.resolve(new Response("identity provider unavailable", { status: 500 }));
      }
      if (identity === "invalid-json") {
        return Promise.resolve(new Response("<!doctype html>", { status: 200 }));
      }
      return Promise.resolve(Response.json(identity ?? {}));
    }

    return Promise.reject(new Error(`Unexpected fetch in test: ${url}`));
  };
}

function toUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function subjectFromCookie(cookie: string | null): string {
  const match = /CF_Authorization=([^;]+)/.exec(cookie ?? "");
  const token = match?.[1];
  if (token === undefined) return "";
  return decodeJwt(token).sub ?? "";
}
