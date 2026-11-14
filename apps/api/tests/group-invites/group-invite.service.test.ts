import { describe, expect, it } from "vitest";
import {
  GROUP_INVITE_VALID_DURATION_MS,
  GroupInviteService,
} from "@/group-invites/group-invite.service";
import { CurrentUser } from "@/identity/current-user";
import {
  createFakeGroupInviteRepository,
  createFakeUserRepository,
} from "../test-utils/fake-repositories";
import { unwrap } from "../test-utils/unwrap";
import type { RequestContextData } from "@/middleware/request-context";
import { createFakeClock } from "../test-utils/fake-clock";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

function setup() {
  const clock = createFakeClock(NOW);
  const users = createFakeUserRepository();
  const invites = createFakeGroupInviteRepository(clock.currentTime);
  const requestContext: RequestContextData = {};
  const currentUser = new CurrentUser(() => requestContext);
  const service = new GroupInviteService(users, invites, currentUser, clock.currentTime);

  const me = {
    id: 1,
    email: "me@example.com",
    firstName: "Me",
    lastName: "Myself",
    subject: "subject-me",
    groupId: 1,
  };
  const other = {
    id: 2,
    email: "other@example.com",
    firstName: "Other",
    lastName: "Person",
    subject: "subject-other",
    groupId: 2,
  };
  users.records.push(me, other);
  requestContext.user = me;

  return { clock, users, invites, requestContext, service, me, other };
}

describe("GroupInviteService.getPendingInvites", () => {
  it("requires an authenticated user", async () => {
    const { service, requestContext } = setup();
    delete requestContext.user;

    await expect(service.getPendingInvites()).rejects.toThrow(
      "No authenticated user in current request.",
    );
  });

  it("returns only the current user's invites", async () => {
    const { service, invites, me, other } = setup();
    await unwrap(invites.create(2, me.id));
    await unwrap(invites.create(1, other.id));

    const pending = await service.getPendingInvites();

    expect(pending).toHaveLength(1);
    expect(pending[0]?.userId).toBe(me.id);
  });

  it("keeps invites issued within the validity window", async () => {
    const { service, invites, clock, me } = setup();
    await unwrap(invites.create(2, me.id));
    clock.advance(GROUP_INVITE_VALID_DURATION_MS - HOUR_MS);

    expect(await service.getPendingInvites()).toHaveLength(1);
  });

  it("keeps an invite issued exactly at the window boundary", async () => {
    const { service, invites, clock, me } = setup();
    await unwrap(invites.create(2, me.id));
    clock.advance(GROUP_INVITE_VALID_DURATION_MS);

    expect(await service.getPendingInvites()).toHaveLength(1);
  });

  it("drops invites older than the validity window", async () => {
    const { service, invites, clock, me } = setup();
    await unwrap(invites.create(2, me.id));
    clock.advance(GROUP_INVITE_VALID_DURATION_MS + 1);

    expect(await service.getPendingInvites()).toHaveLength(0);
  });
});

describe("GroupInviteService.inviteUserToGroup", () => {
  it("requires an authenticated user", async () => {
    const { service, requestContext, other } = setup();
    delete requestContext.user;

    await expect(service.inviteUserToGroup(other.email)).rejects.toThrow(
      "No authenticated user in current request.",
    );
  });

  it("invites an existing user into the current user's group", async () => {
    const { service, invites, me, other } = setup();

    await service.inviteUserToGroup(other.email);

    expect(invites.records).toHaveLength(1);
    expect(invites.records[0]).toMatchObject({
      groupId: me.groupId,
      userId: other.id,
      createdAt: NOW,
    });
  });

  it("ignores unknown email addresses", async () => {
    const { service, invites } = setup();

    await expect(service.inviteUserToGroup("nobody@example.com")).resolves.toBeUndefined();
    expect(invites.records).toHaveLength(0);
  });

  it("does not create a second invite while one is still pending", async () => {
    const { service, invites, other } = setup();

    await service.inviteUserToGroup(other.email);
    await service.inviteUserToGroup(other.email);

    expect(invites.records).toHaveLength(1);
  });

  it("issues a fresh invite after the previous one expired", async () => {
    const { service, invites, clock, other } = setup();
    await service.inviteUserToGroup(other.email);
    const expiredId = invites.records[0]?.id;

    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);
    await service.inviteUserToGroup(other.email);

    expect(invites.records).toHaveLength(1);
    expect(invites.records[0]?.id).not.toBe(expiredId);
    expect(invites.records[0]?.createdAt).toEqual(new Date(NOW.getTime() + 25 * HOUR_MS));
  });
});

describe("GroupInviteService.acceptInviteToGroup", () => {
  it("moves the current user into the inviting group and deletes the invite", async () => {
    const { service, invites, requestContext, me, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.records[0];
    if (invite === undefined) throw new Error("expected an invite");

    requestContext.user = other;
    unwrap(await service.acceptInviteToGroup(invite.id));

    expect(other.groupId).toBe(me.groupId);
    expect(invites.records).toHaveLength(0);
  });

  it("returns err for an unknown id", async () => {
    const { service } = setup();

    expect((await service.acceptInviteToGroup(-1)).isErr).toBe(true);
  });

  it("returns err for an invite addressed to somebody else", async () => {
    const { service, invites, requestContext, me } = setup();
    const invite = await unwrap(invites.create(2, me.id + 100));

    expect((await service.acceptInviteToGroup(invite.id)).isErr).toBe(true);
    expect(requestContext.user?.groupId).toBe(me.groupId);
  });

  it("returns err once the invite has expired", async () => {
    const { service, invites, clock, requestContext, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.records[0];
    if (invite === undefined) throw new Error("expected an invite");
    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);

    requestContext.user = other;
    expect((await service.acceptInviteToGroup(invite.id)).isErr).toBe(true);
    expect(other.groupId).toBe(2);
  });

  it("cannot accept the same invite twice", async () => {
    const { service, invites, requestContext, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.records[0];
    if (invite === undefined) throw new Error("expected an invite");

    requestContext.user = other;
    unwrap(await service.acceptInviteToGroup(invite.id));
    expect((await service.acceptInviteToGroup(invite.id)).isErr).toBe(true);
  });
});

describe("GroupInviteService.declineInviteToGroup", () => {
  it("deletes the invite without changing groups", async () => {
    const { service, invites, requestContext, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.records[0];
    if (invite === undefined) throw new Error("expected an invite");

    requestContext.user = other;
    unwrap(await service.declineInviteToGroup(invite.id));

    expect(invites.records).toHaveLength(0);
    expect(other.groupId).toBe(2);
  });

  it("returns err for an unknown id", async () => {
    const { service } = setup();

    expect((await service.declineInviteToGroup(-1)).isErr).toBe(true);
  });
});

describe("GroupInviteService.cleanupExpiredInvites", () => {
  it("removes only the invites outside the validity window", async () => {
    const { service, invites, clock, me } = setup();
    const stale = await unwrap(invites.create(2, me.id));

    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);
    const fresh = await unwrap(invites.create(1, me.id));

    await service.cleanupExpiredInvites();

    expect(invites.records.map((invite) => invite.id)).toEqual([fresh.id]);
    expect(invites.records.map((invite) => invite.id)).not.toContain(stale.id);
  });
});
