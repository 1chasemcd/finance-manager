import { describe, expect, it } from "vitest";
import { createAppHarness } from "../test-utils/app-harness";
import type { AccountInfoResponse } from "@/accounts/account.types";

const harness = await createAppHarness();
const { api, login } = harness;

const alice = { email: "alice@example.com", name: "Alice Smith" };
const bob = { email: "bob@example.com", name: "Bob Jones" };
const carol = { email: "carol@example.com", name: "Carol Danvers" };

describe("group invites", () => {
  it("rejects an invite payload that is not a valid email", async () => {
    const token = await login(alice);

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "not-an-email" },
    });

    expect(response.status).toBe(400);
  });

  it("responds 204 when creating an invite for an unknown email", async () => {
    const token = await login(alice);

    const response = await api("/api/invite", {
      method: "POST",
      token,
      json: { email: "ghost@example.com" },
    });

    expect(response.status).toBe(204);
  });

  it("walks an invite from invitation through acceptance", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);

    // log bob in first so account exists
    await api("/api/account", { token: bobToken });

    const inviteResponse = await api("/api/invite", {
      method: "POST",
      token: aliceToken,
      json: { email: "bob@example.com" },
    });
    expect(inviteResponse.status).toBe(204);

    const pendingResponse = await api("/api/account", { token: bobToken });
    expect(pendingResponse.status).toBe(200);
    const pending = await pendingResponse.json<AccountInfoResponse>();
    expect(pending.pendingInvite).toBeDefined();
    expect(pending.pendingInvite?.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
    expect(typeof pending.pendingInvite?.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(pending.pendingInvite?.createdAt as unknown as string))).toBe(
      false,
    );
    const inviteId = pending.pendingInvite?.inviteId;
    expect(inviteId).toBeDefined();

    const acceptResponse = await api(`/api/invite/${inviteId ?? ""}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(acceptResponse.status).toBe(204);

    const bobAccountResponse = await api("/api/account", { token: bobToken });
    const bobAccount = await bobAccountResponse.json<AccountInfoResponse>();
    expect(bobAccount).not.toHaveProperty("pendingInvite");
    expect(bobAccount.groupMembers).toHaveLength(2);
    expect(bobAccount.groupMembers).toEqual(
      expect.arrayContaining([
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
        { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
      ]),
    );

    const aliceAccountResponse = await api("/api/account", { token: aliceToken });
    const aliceAccount = await aliceAccountResponse.json<AccountInfoResponse>();

    expect(aliceAccount.groupMembers).toHaveLength(2);
    expect(aliceAccount).not.toHaveProperty("pendingInvite");
  });

  it("removes the invite when it is declined", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: aliceToken,
          json: { email: "bob@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await (
      await api("/api/account", { token: bobToken })
    ).json<AccountInfoResponse>();
    const inviteId = pending.pendingInvite?.inviteId;
    expect(inviteId).toBeDefined();

    const declineResponse = await api(`/api/invite/${inviteId ?? ""}/decline`, {
      method: "POST",
      token: bobToken,
    });
    expect(declineResponse.status).toBe(204);

    const afterDecline = await (
      await api("/api/account", { token: bobToken })
    ).json<AccountInfoResponse>();
    expect(afterDecline).not.toHaveProperty("pendingInvite");
    expect(afterDecline.groupMembers).toEqual([
      { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
    ]);

    const repeatDecline = await api(`/api/invite/${inviteId ?? ""}/decline`, {
      method: "POST",
      token: bobToken,
    });
    expect(repeatDecline.status).toBe(404);
  });

  it("does not let another user accept somebody else's invite", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);
    const carolToken = await login(carol);

    expect(
      (
        await api("/api/invite", {
          method: "POST",
          token: carolToken,
          json: { email: "alice@example.com" },
        })
      ).status,
    ).toBe(204);

    const pending = await (
      await api("/api/account", { token: aliceToken })
    ).json<AccountInfoResponse>();
    const inviteId = pending.pendingInvite?.inviteId;
    expect(inviteId).toBeDefined();

    const hijack = await api(`/api/invite/${inviteId ?? ""}/accept`, {
      method: "POST",
      token: bobToken,
    });
    expect(hijack.status).toBe(404);

    const aliceAfter = await (
      await api("/api/account", { token: aliceToken })
    ).json<AccountInfoResponse>();
    expect(aliceAfter.pendingInvite?.inviteId).toBe(inviteId);
    expect(aliceAfter.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
  });

  it("responds 404 for unknown invite ids", async () => {
    const token = await login(alice);

    expect((await api(`/api/invite/not-a-real-id/accept`, { method: "POST", token })).status).toBe(
      404,
    );
    expect((await api(`/api/invite/not-a-real-id/decline`, { method: "POST", token })).status).toBe(
      404,
    );
  });
});
