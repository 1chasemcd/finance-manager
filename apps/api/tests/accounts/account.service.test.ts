import { describe, expect, it } from "vitest";
import { AccountService } from "@/accounts/account.service";
import { GroupInviteService } from "@/group-invites/group-invite.service";
import { CurrentUser } from "@/identity/current-user";
import type { RequestContextData } from "@/middleware/request-context";
import { createFakeClock } from "../test-utils/fake-clock";
import {
  createFakeGroupInviteRepository,
  createFakeUserRepository,
} from "../test-utils/fake-repositories";
import { unwrap } from "../test-utils/unwrap";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

function setup() {
  const clock = createFakeClock(NOW);
  const users = createFakeUserRepository();
  const invites = createFakeGroupInviteRepository(clock.currentTime);
  const requestContext: RequestContextData = {};
  const currentUser = new CurrentUser(() => requestContext);
  const inviteService = new GroupInviteService(users, invites, currentUser, clock.currentTime);
  const service = new AccountService(users, inviteService, currentUser);

  const me = {
    id: 1,
    email: "me@example.com",
    firstName: "Me",
    lastName: "Myself",
    subject: "subject-me",
    groupId: 1,
  };
  const teammate = {
    id: 2,
    email: "teammate@example.com",
    firstName: "Team",
    lastName: "Mate",
    subject: "subject-teammate",
    groupId: 1,
  };
  const stranger = {
    id: 3,
    email: "stranger@example.com",
    firstName: "Stran",
    lastName: "Ger",
    subject: "subject-stranger",
    groupId: 2,
  };
  users.records.push(me, teammate, stranger);
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
    const { clock, service, invites, me } = setup();
    await unwrap(invites.create(2, me.id));
    clock.advance(1000 * 60 * 60 * 25);

    const info = await service.getAccountInfo();

    expect(info).not.toHaveProperty("pendingInvite");
  });

  it("describes a pending invite with the inviting group's members", async () => {
    const { service, invites, me } = setup();
    const invite = await unwrap(invites.create(2, me.id));

    const info = await service.getAccountInfo();

    expect(info.pendingInvite).toEqual({
      inviteId: invite.id,
      groupMembers: [{ firstName: "Stran", lastName: "Ger", email: "stranger@example.com" }],
      createdAt: invite.createdAt,
    });
  });

  it("reports the oldest pending invite when several exist", async () => {
    const { service, invites, me, clock } = setup();
    const oldest = await unwrap(invites.create(2, me.id));
    clock.advance(HOUR_MS);
    await unwrap(invites.create(1, me.id));

    const info = await service.getAccountInfo();

    expect(info.pendingInvite?.inviteId).toBe(oldest.id);
    expect(info.pendingInvite?.groupMembers).toEqual([
      { firstName: "Stran", lastName: "Ger", email: "stranger@example.com" },
    ]);
  });

  it("ignores invites addressed to other users", async () => {
    const { service, invites, stranger } = setup();
    await unwrap(invites.create(2, stranger.id));

    const info = await service.getAccountInfo();

    expect(info).not.toHaveProperty("pendingInvite");
  });
});
