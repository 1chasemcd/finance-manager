import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import type { AccountInfoResponse } from "@/accounts/account.types";

const { app, login } = await createWorker();

const alice = { email: "alice@example.com", name: "Alice Smith" };
const bob = { email: "bob@example.com", name: "Bob Jones" };
const carol = { email: "carol@example.com", name: "Carol Danvers" };

describe("/api/account", () => {
  it("onboards a first-time visitor from the identity profile", async () => {
    const token = await login(alice);

    const response = await app.auth(token).get("/api/account");

    expect(response.status).toBe(200);
    const body = await response.json<AccountInfoResponse>();
    expect(body.me).toEqual({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
    });
    expect(body.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
    expect(body).not.toHaveProperty("pendingInvite");
  });
});

describe("/api/account/invite", () => {
  it("rejects an invite payload that is not a valid email", async () => {
    const token = await login(alice);

    const response = await app.auth(token).post("/api/account/invite", { email: "not-an-email" });

    expect(response.status).toBe(400);
  });

  it("responds 204 when creating an invite for an unknown email", async () => {
    const token = await login(alice);

    const response = await app
      .auth(token)
      .post("/api/account/invite", { email: "ghost@example.com" });

    expect(response.status).toBe(204);
  });

  it("walks an invite from invitation through acceptance", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);

    const inviteResponse = await app
      .auth(aliceToken)
      .post("/api/account/invite", { email: "bob@example.com" });
    expect(inviteResponse.status).toBe(204);

    const pendingResponse = await app.auth(bobToken).get("/api/account");
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
    const inviteId = pending.pendingInvite?.inviteId ?? 0;
    expect(inviteId).toBeGreaterThan(0);

    const acceptResponse = await app
      .auth(bobToken)
      .post(`/api/account/invite/${inviteId.toString()}/accept`);
    expect(acceptResponse.status).toBe(204);

    const bobAccountResponse = await app.auth(bobToken).get("/api/account");
    const bobAccount = await bobAccountResponse.json<AccountInfoResponse>();
    expect(bobAccount).not.toHaveProperty("pendingInvite");
    expect(bobAccount.groupMembers).toHaveLength(2);
    expect(bobAccount.groupMembers).toEqual(
      expect.arrayContaining([
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
        { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
      ]),
    );

    const aliceAccountResponse = await app.auth(aliceToken).get("/api/account");
    const aliceAccount = await aliceAccountResponse.json<AccountInfoResponse>();

    expect(aliceAccount.groupMembers).toHaveLength(2);
    expect(aliceAccount).not.toHaveProperty("pendingInvite");
  });

  it("removes the invite when it is declined", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);

    expect(
      (await app.auth(aliceToken).post("/api/account/invite", { email: "bob@example.com" })).status,
    ).toBe(204);

    const pending = await (
      await app.auth(bobToken).get("/api/account")
    ).json<AccountInfoResponse>();
    const inviteId = pending.pendingInvite?.inviteId ?? 0;
    expect(inviteId).toBeGreaterThan(0);

    const declineResponse = await app
      .auth(bobToken)
      .post(`/api/account/invite/${inviteId.toString()}/decline`);
    expect(declineResponse.status).toBe(204);

    const afterDecline = await (
      await app.auth(bobToken).get("/api/account")
    ).json<AccountInfoResponse>();
    expect(afterDecline).not.toHaveProperty("pendingInvite");
    expect(afterDecline.groupMembers).toEqual([
      { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
    ]);

    const repeatDecline = await app
      .auth(bobToken)
      .post(`/api/account/invite/${inviteId.toString()}/decline`);
    expect(repeatDecline.status).toBe(404);
  });

  it("does not let another user accept somebody else's invite", async () => {
    const aliceToken = await login(alice);
    const bobToken = await login(bob);
    const carolToken = await login(carol);

    expect(
      (await app.auth(carolToken).post("/api/account/invite", { email: "alice@example.com" }))
        .status,
    ).toBe(204);

    const pending = await (
      await app.auth(aliceToken).get("/api/account")
    ).json<AccountInfoResponse>();
    const inviteId = pending.pendingInvite?.inviteId ?? 0;
    expect(inviteId).toBeGreaterThan(0);

    const hijack = await app
      .auth(bobToken)
      .post(`/api/account/invite/${inviteId.toString()}/accept`);
    expect(hijack.status).toBe(404);

    const aliceAfter = await (
      await app.auth(aliceToken).get("/api/account")
    ).json<AccountInfoResponse>();
    expect(aliceAfter.pendingInvite?.inviteId).toBe(inviteId);
    expect(aliceAfter.groupMembers).toEqual([
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
    ]);
  });

  it("responds 404 for unknown invite ids", async () => {
    const token = await login(alice);
    const fakeId = "999";
    expect((await app.auth(token).post(`/api/account/invite/${fakeId}/accept`)).status).toBe(404);
    expect((await app.auth(token).post(`/api/account/invite/${fakeId}/decline`)).status).toBe(404);
  });
});
