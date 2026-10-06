import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getJwtPayload } from "./get-jwt-payload";
import { CloudflareAccessMock, createTestJwtIssuer, type TestJwtIssuer } from "../test-support/jwt";
import { unwrap, unwrapError } from "../test-support/unwrap";

const TEAM_DOMAIN = "https://team.example.test";
const POLICY_AUD = "policy-aud-123";
const env = { TEAM_DOMAIN, POLICY_AUD };

let access: CloudflareAccessMock;
let issuer: TestJwtIssuer;

beforeAll(async () => {
  issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
  access = new CloudflareAccessMock(TEAM_DOMAIN, issuer.jwks);
});

beforeEach(() => {
  vi.stubGlobal("fetch", access.fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getJwtPayload", () => {
  it("verifies a token issued by the team domain", async () => {
    const payload = unwrap(await getJwtPayload(await issuer.signToken({ sub: "user-1" }), env));

    expect(payload.sub).toBe("user-1");
    expect(payload.iss).toBe(TEAM_DOMAIN);
    expect(payload.aud).toBe(POLICY_AUD);
    expect(access.jwksRequests).toBe(1);
  });

  it("verifies subsequent tokens without refetching the JWKS", async () => {
    unwrap(await getJwtPayload(await issuer.signToken({ sub: "user-2" }), env));

    expect(access.jwksRequests).toBe(1);
  });

  it("rejects a token with the wrong audience", async () => {
    const token = await issuer.signToken({ sub: "user-1", aud: "other-aud" });

    expect(unwrapError(await getJwtPayload(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects a token with the wrong issuer", async () => {
    const token = await issuer.signToken({
      sub: "user-1",
      iss: "https://evil.example.test",
    });

    expect(unwrapError(await getJwtPayload(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects an expired token", async () => {
    const token = await issuer.signToken({
      sub: "user-1",
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    expect(unwrapError(await getJwtPayload(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects a malformed token", async () => {
    expect(unwrapError(await getJwtPayload("not-a-jwt", env))).toEqual({
      _tag: "Unauthorized",
    });
  });

  it("rejects a token signed with a key that is not in the JWKS", async () => {
    const rogueIssuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
    const token = await rogueIssuer.signToken({ sub: "user-1" });

    expect(unwrapError(await getJwtPayload(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("returns Err when the JWKS endpoint is unreachable", async () => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("jwks down"))),
    );
    const freshGetJwtPayload = (await import("./get-jwt-payload")).getJwtPayload;
    const token = await issuer.signToken({ sub: "user-1" });

    expect(unwrapError(await freshGetJwtPayload(token, env))).toEqual({
      _tag: "Unauthorized",
    });
    expect(unwrapError(await freshGetJwtPayload("not-a-jwt", env))).toEqual({
      _tag: "Unauthorized",
    });
  });
});
