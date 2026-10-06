import { afterEach, describe, expect, it, vi } from "vitest";
import { getCloudflareIdentity } from "../../src/identity/get-cloudflare-identity";
import { unwrap, unwrapError } from "../test-utils/unwrap";

const TEAM_DOMAIN = "https://team.example.test";
const env = { TEAM_DOMAIN };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCloudflareIdentity", () => {
  it("returns the identity payload from the Access API", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(Response.json({ email: "jane@example.com", name: "Jane Doe" })),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = unwrap(await getCloudflareIdentity("token-abc", env));

    expect(result).toEqual({ email: "jane@example.com", name: "Jane Doe" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${TEAM_DOMAIN}/cdn-cgi/access/get-identity`, {
      method: "GET",
      headers: {
        Cookie: "CF_Authorization=token-abc",
        Accept: "application/json",
      },
    });
  });

  it("keeps a payload with only optional fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({}))),
    );

    expect(unwrap(await getCloudflareIdentity("token-abc", env))).toEqual({});
  });

  it("returns Err when the identity endpoint responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("nope", { status: 500 }))),
    );

    expect(unwrapError(await getCloudflareIdentity("token-abc", env))).toEqual({
      _tag: "BadGateway",
    });
  });

  it("returns Err when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    );

    expect(unwrapError(await getCloudflareIdentity("token-abc", env))).toEqual({
      _tag: "BadGateway",
    });
  });

  it("returns Err when the response is not valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("<!doctype html>", { status: 200 }))),
    );

    expect(unwrapError(await getCloudflareIdentity("token-abc", env))).toEqual({
      _tag: "BadGateway",
    });
  });
});
