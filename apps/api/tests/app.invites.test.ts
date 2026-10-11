import { describe, expect, it } from "vitest";
import worker from "@/index";
import { createAppHarness } from "./test-utils/app-harness";
import type { AccountInfoResponse } from "@/accounts/account.types";

const harness = createAppHarness();
const { api, login, readJson, countRows } = harness;

describe("group invites", () => {
  async function onboard(sub: string, email: string, name: string): Promise<string> {
    const token = await login(sub, { email, name });
    const response = await api("/api/account", { token });
    expect(response.status).toBe(200);
    return token;
  }

  it("rejects an invite payload that is not a valid email", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "not-an-email" },
    });

    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON bodies", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await worker.fetch(
      new Request("http://test.local/api/invite", {
        method: "POST",
        headers: {
          "Cf-Access-Jwt-Assertion": token,
          "Content-Type": "application/json",
        },
        body: "{ not json",
      }),
      harness.env,
      harness.executionContext,
    );

    expect(response.status).toBe(400);
  });

  it("rejects requests without a JSON content type", async () => {
    const token = await login("payload-checker", {
      email: "payload@example.com",
      name: "Payload Checker",
    });

    const response = await worker.fetch(
      new Request("http://test.local/api/invite", {
        method: "POST",
        headers: {
          "Cf-Access-Jwt-Assertion": token,
          "Content-Type": "text/plain",
        },
        body: "email=payload@example.com",
      }),
      harness.env,
      harness.executionContext,
    );

    expect(response.status).toBe(400);
  });

  it("responds 204 without creating an invite for an unknown email", async () => {
    const token = await login("solo-inviter", {
      email: "solo@example.com",
      name: "Solo Inviter",
    });
    const invitesBefore = countRows("group_invites");

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "ghost@example.com" },
    });

    expect(response.status).toBe(204);
    expect(countRows("group_invites")).toBe(invitesBefore);
  });

  it("walks an invite from invitation through acceptance", async () => {
    const aliceToken = await onboard("alice", "alice@example.com", "Alice Smith");
    const bobToken = await onboard("bob", "bob@example.com", "Bob Jones");

    const inviteResponse = await api("/api/invite", {
      method: "POST",
      token: aliceToken,
      json: { email: "bob@example.com" },
    });
    expect(inviteResponse.status).toBe(204);

    const pending = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: bobToken }),
    );
    expect(pending.pendingInvite).toBeDefined();
    expect(pending.pendingInvite?.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
    expect(typeof pending.pendingInvite?.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(pending.pendingInvite?.createdAt as unknown as string))).toBe(
      false,
    );
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const acceptResponse = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(acceptResponse.status).toBe(204);

    const afterAccept = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: bobToken }),
    );
    expect(afterAccept).not.toHaveProperty("pendingInvite");
    expect(afterAccept.groupMembers).toHaveLength(2);
    expect(afterAccept.groupMembers).toEqual(
      expect.arrayContaining([
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
        { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
      ]),
    );

    const aliceAfter = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: aliceToken }),
    );
    expect(aliceAfter.groupMembers).toHaveLength(2);
    expect(aliceAfter).not.toHaveProperty("pendingInvite");

    const repeatAccept = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(repeatAccept.status).toBe(404);
  });

  it("removes the invite when it is declined", async () => {
    const carolToken = await onboard("carol", "carol@example.com", "Carol Danvers");
    const daveToken = await onboard("dave", "dave@example.com", "Dave Eggers");

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: carolToken,
          json: { email: "dave@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: daveToken }),
    );
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const declineResponse = await api(`/api/invite/${inviteId}/decline`, {
      method: "POST",
      token: daveToken,
    });
    expect(declineResponse.status).toBe(204);

    const afterDecline = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: daveToken }),
    );
    expect(afterDecline).not.toHaveProperty("pendingInvite");
    expect(afterDecline.groupMembers).toEqual([
      { firstName: "Dave", lastName: "Eggers", email: "dave@example.com" },
    ]);

    const repeatDecline = await api(`/api/invite/${inviteId}/decline`, {
      method: "POST",
      token: daveToken,
    });
    expect(repeatDecline.status).toBe(404);
  });

  it("does not let another user accept somebody else's invite", async () => {
    const carolToken = await login("carol", {
      email: "carol@example.com",
      name: "Carol Danvers",
    });
    const eveToken = await onboard("eve", "eve@example.com", "Eve Eves");
    const frankToken = await onboard("frank", "frank@example.com", "Frank Fontaine");

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: carolToken,
          json: { email: "eve@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: eveToken }),
    );
    const inviteId = pending.pendingInvite?.inviteId;
    if (inviteId === undefined) throw new Error("expected a pending invite");

    const hijack = await api(`/api/invite/${inviteId}/accept`, {
      method: "POST",
      token: frankToken,
    });
    expect(hijack.status).toBe(404);

    const eveAfter = await readJson<AccountInfoResponse>(
      await api("/api/account", { token: eveToken }),
    );
    expect(eveAfter.pendingInvite?.inviteId).toBe(inviteId);
    expect(eveAfter.groupMembers).toEqual([
      { firstName: "Eve", lastName: "Eves", email: "eve@example.com" },
    ]);
  });

  it("responds 404 for unknown invite ids", async () => {
    const token = await onboard("unknown-invite", "unknown-invite@example.com", "Unknown Invite");

    expect((await api(`/api/invite/not-a-real-id/accept`, { method: "POST", token })).status).toBe(
      404,
    );
    expect((await api(`/api/invite/not-a-real-id/decline`, { method: "POST", token })).status).toBe(
      404,
    );
  });
});
