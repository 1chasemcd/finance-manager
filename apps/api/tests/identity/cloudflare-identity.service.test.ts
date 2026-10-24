import { describe, expect, it, vi } from "vitest";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import { CloudflareIdentityService } from "@/identity/cloudflare-identity.service";
import { createCloudflareAccessMock, createTestJwtIssuer } from "../test-utils/jwt";
import { createFetchMock } from "../test-utils/fetch-mock";
import { createFakeLogger } from "../test-utils/fake-logger";

const TEAM_DOMAIN = "https://team.example.test";
const POLICY_AUD = "policy-aud-123";
const env = { TEAM_DOMAIN, POLICY_AUD };

async function setup() {
  const fetchMock = createFetchMock();
  const issuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
  const access = createCloudflareAccessMock(issuer);
  const certsFn = vi.fn(access.certs);
  const getIdentityFn = vi.fn(access.getIdentity);
  fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/certs`, certsFn);
  fetchMock.register(`${TEAM_DOMAIN}/cdn-cgi/access/get-identity`, getIdentityFn);
  const identity = new CloudflareIdentityService(fetchMock.handleFetch, createFakeLogger());

  return {
    issuer,
    access,
    certsFn,
    getIdentityFn,
    identity,
  };
}

describe("CloudflareIdentityService.getIdentity", () => {
  it("returns the identity payload from the Access API", async () => {
    const { issuer, access, identity, getIdentityFn } = await setup();

    const sub = "user";
    const token = await issuer.signToken({ sub });
    access.setupIdentity(sub, { email: "jane@example.com", name: "Jane Doe" });
    const result = unwrap(await identity.getIdentity(token, env));

    expect(result).toEqual({ email: "jane@example.com", name: "Jane Doe" });
    expect(getIdentityFn).toHaveBeenCalledOnce();
  });

  it("keeps a payload with only optional fields", async () => {
    const { issuer, access, identity } = await setup();

    const sub = "user";
    const token = await issuer.signToken({ sub });
    access.setupIdentity(sub, {});
    const result = unwrap(await identity.getIdentity(token, env));
    expect(result).toEqual({});
  });

  it("returns Err when the identity endpoint cannot find the specified token", async () => {
    const { identity } = await setup();

    const result = unwrapError(await identity.getIdentity("unknown-token", env));
    expect(result).toEqual({
      _tag: "BadGateway",
    });
  });
});

describe("CloudflareIdentityService.jwtVerify", () => {
  it("verifies a token issued by the team domain", async () => {
    const { issuer, identity } = await setup();

    const sub = "user";
    const token = await issuer.signToken({ sub });
    const payload = unwrap(await identity.jwtVerify(token, env));

    expect(payload.sub).toBe(sub);
    expect(payload.iss).toBe(TEAM_DOMAIN);
    expect(payload.aud).toBe(POLICY_AUD);
  });

  it("verifies subsequent tokens without refetching the JWKS", async () => {
    const { issuer, identity, certsFn } = await setup();

    const token = await issuer.signToken({ sub: "test" });
    await identity.jwtVerify(token, env);
    await identity.jwtVerify(token, env);

    expect(certsFn).toHaveBeenCalledOnce();
  });

  it("rejects a token with the wrong audience", async () => {
    const { issuer, identity } = await setup();

    const token = await issuer.signToken({ sub: "test", aud: "other-aud" });

    expect(unwrapError(await identity.jwtVerify(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects a token with the wrong issuer", async () => {
    const { issuer, identity } = await setup();

    const token = await issuer.signToken({ sub: "test", iss: "http://malicious-issuer.com" });

    expect(unwrapError(await identity.jwtVerify(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects an expired token", async () => {
    const { issuer, identity } = await setup();

    const token = await issuer.signToken({
      sub: "user-1",
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    expect(unwrapError(await identity.jwtVerify(token, env))).toEqual({ _tag: "Unauthorized" });
  });

  it("rejects a malformed token", async () => {
    const { identity } = await setup();

    expect(unwrapError(await identity.jwtVerify("not-a-jwt", env))).toEqual({
      _tag: "Unauthorized",
    });
  });

  it("rejects a token signed with a key that is not in the JWKS", async () => {
    const { identity } = await setup();

    const rogueIssuer = await createTestJwtIssuer(TEAM_DOMAIN, POLICY_AUD);
    const token = await rogueIssuer.signToken({ sub: "user-1" });

    expect(unwrapError(await identity.jwtVerify(token, env))).toEqual({ _tag: "Unauthorized" });
  });
});
