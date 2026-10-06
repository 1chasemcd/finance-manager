import { describe, expect, it } from "vitest";
import { AccountService } from "../../src/accounts/account.service";
import { GroupInviteService } from "../../src/group-invites/group-invite.service";
import { CurrentUser } from "../../src/identity/current-user";
import {
  InMemoryGroupInviteRepository,
  InMemoryUserRepository,
} from "../test-utils/fake-repositories";
import type { User } from "../../src/users/user.types";
import { createFakeClock } from "../test-utils/fake-clock";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

function setup() {
  const clock = createFakeClock(NOW);
  const users = new InMemoryUserRepository();
  const invites = new InMemoryGroupInviteRepository(clock.currentTime);
  const requestContext: { user?: User } = {};
  const currentUser = new CurrentUser(() => requestContext);
  const inviteService = new GroupInviteService(users, invites, currentUser, clock.currentTime);
  const service = new AccountService(users, inviteService, currentUser);

  const me = users.add({
    email: "me@example.com",
    firstName: "Me",
    lastName: "Myself",
    subject: "subject-me",
    groupId: 1,
  });
  const teammate = users.add({
    email: "teammate@example.com",
    firstName: "Team",
    lastName: "Mate",
    subject: "subject-teammate",
    groupId: 1,
  });
  const stranger = users.add({
    email: "stranger@example.com",
    firstName: "Stran",
    lastName: "Ger",
    subject: "subject-stranger",
    groupId: 2,
  });
  requestContext.user = me;

  return { clock, users, invites, requestContext, service, me, teammate, stranger };
}

describe("AccountService.getAccountInfo", () => {
  it("requires an authenticated user", async () => {
    const { service, requestContext } = setup();
    delete requestContext.user;

    await expect(service.getAccountInfo()).rejects.toThrow(
      "No authenticated user in current request.",
    );
  });

  it("returns the current user and their group members without internal ids", async () => {
    const { service } = setup();

    const info = await service.getAccountInfo();

    expect(info.me).toEqual({
      firstName: "Me",
      lastName: "Myself",
      email: "me@example.com",
    });
    expect(info.groupMembers).toEqual([
      { firstName: "Me", lastName: "Myself", email: "me@example.com" },
      { firstName: "Team", lastName: "Mate", email: "teammate@example.com" },
    ]);
  });

  it("omits pendingInvite when there is nothing pending", async () => {
    const { service } = setup();

    const info = await service.getAccountInfo();

    expect(info).not.toHaveProperty("pendingInvite");
  });

  it("omits pendingInvite when the only invite has expired", async () => {
    const { service, invites, me } = setup();
    invites.add({ groupId: 2, userId: me.id, createdAt: new Date(NOW.getTime() - 25 * HOUR_MS) });

    const info = await service.getAccountInfo();

    expect(info).not.toHaveProperty("pendingInvite");
  });

  it("describes a pending invite with the inviting group's members", async () => {
    const { service, invites, me } = setup();
    const invite = invites.add({ groupId: 2, userId: me.id });

    const info = await service.getAccountInfo();

    expect(info.pendingInvite).toEqual({
      inviteId: invite.publicId,
      groupMembers: [{ firstName: "Stran", lastName: "Ger", email: "stranger@example.com" }],
      createdAt: invite.createdAt,
    });
  });

  it("reports the oldest pending invite when several exist", async () => {
    const { service, invites, me, clock } = setup();
    const oldest = invites.add({ groupId: 2, userId: me.id });
    clock.advance(HOUR_MS);
    invites.add({ groupId: 1, userId: me.id });

    const info = await service.getAccountInfo();

    expect(info.pendingInvite?.inviteId).toBe(oldest.publicId);
    expect(info.pendingInvite?.groupMembers).toEqual([
      { firstName: "Stran", lastName: "Ger", email: "stranger@example.com" },
    ]);
  });

  it("ignores invites addressed to other users", async () => {
    const { service, invites, stranger } = setup();
    invites.add({ groupId: 2, userId: stranger.id });

    const info = await service.getAccountInfo();

    expect(info).not.toHaveProperty("pendingInvite");
  });
});
