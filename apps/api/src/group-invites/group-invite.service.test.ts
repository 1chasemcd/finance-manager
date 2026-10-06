import { describe, expect, it } from "vitest";
import { GROUP_INVITE_VALID_DURATION_MS, GroupInviteService } from "./group-invite.service";
import { CurrentUser } from "../identity/current-user";
import {
  InMemoryGroupInviteRepository,
  InMemoryUserRepository,
  createFakeClock,
} from "../test-support/fake-repositories";
import { unwrap, unwrapError } from "../test-support/unwrap";
import type { User } from "../users/user.types";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

function setup() {
  const clock = createFakeClock(NOW);
  const users = new InMemoryUserRepository();
  const invites = new InMemoryGroupInviteRepository(clock.currentTime);
  const store: { user?: User } = {};
  const currentUser = new CurrentUser(() => store);
  const service = new GroupInviteService(users, invites, currentUser, clock.currentTime);

  const me = users.add({
    email: "me@example.com",
    firstName: "Me",
    lastName: "Myself",
    subject: "subject-me",
    groupId: 1,
  });
  const other = users.add({
    email: "other@example.com",
    firstName: "Other",
    lastName: "Person",
    subject: "subject-other",
    groupId: 2,
  });
  store.user = me;

  return { clock, users, invites, store, service, me, other };
}

describe("GROUP_INVITE_VALID_DURATION_MS", () => {
  it("is 24 hours", () => {
    expect(GROUP_INVITE_VALID_DURATION_MS).toBe(24 * HOUR_MS);
  });
});

describe("GroupInviteService.getPendingInvites", () => {
  it("requires an authenticated user", async () => {
    const { service, store } = setup();
    delete store.user;

    await expect(service.getPendingInvites()).rejects.toThrow(
      "No authenticated user in current request.",
    );
  });

  it("returns only the current user's invites", async () => {
    const { service, invites, me, other } = setup();
    invites.add({ groupId: 2, userId: me.id });
    invites.add({ groupId: 1, userId: other.id });

    const pending = await service.getPendingInvites();

    expect(pending).toHaveLength(1);
    expect(pending[0]?.userId).toBe(me.id);
  });

  it("keeps invites issued within the validity window", async () => {
    const { service, invites, clock, me } = setup();
    invites.add({ groupId: 2, userId: me.id });
    clock.advance(GROUP_INVITE_VALID_DURATION_MS - HOUR_MS);

    expect(await service.getPendingInvites()).toHaveLength(1);
  });

  it("keeps an invite issued exactly at the window boundary", async () => {
    const { service, invites, clock, me } = setup();
    invites.add({ groupId: 2, userId: me.id });
    clock.advance(GROUP_INVITE_VALID_DURATION_MS);

    expect(await service.getPendingInvites()).toHaveLength(1);
  });

  it("drops invites older than the validity window", async () => {
    const { service, invites, clock, me } = setup();
    invites.add({ groupId: 2, userId: me.id });
    clock.advance(GROUP_INVITE_VALID_DURATION_MS + 1);

    expect(await service.getPendingInvites()).toHaveLength(0);
  });
});

describe("GroupInviteService.inviteUserToGroup", () => {
  it("invites an existing user into the current user's group", async () => {
    const { service, invites, me, other } = setup();

    await service.inviteUserToGroup(other.email);

    expect(invites.invites).toHaveLength(1);
    expect(invites.invites[0]).toMatchObject({
      groupId: me.groupId,
      userId: other.id,
      createdAt: NOW,
    });
  });

  it("ignores unknown email addresses", async () => {
    const { service, invites } = setup();

    await expect(service.inviteUserToGroup("nobody@example.com")).resolves.toBeUndefined();
    expect(invites.invites).toHaveLength(0);
  });

  it("does not create a second invite while one is still pending", async () => {
    const { service, invites, other } = setup();

    await service.inviteUserToGroup(other.email);
    await service.inviteUserToGroup(other.email);

    expect(invites.invites).toHaveLength(1);
  });

  it("issues a fresh invite after the previous one expired", async () => {
    const { service, invites, clock, other } = setup();
    await service.inviteUserToGroup(other.email);
    const expiredId = invites.invites[0]?.publicId;

    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);
    await service.inviteUserToGroup(other.email);

    expect(invites.invites).toHaveLength(1);
    expect(invites.invites[0]?.publicId).not.toBe(expiredId);
    expect(invites.invites[0]?.createdAt).toEqual(new Date(NOW.getTime() + 25 * HOUR_MS));
  });

  it("requires an authenticated user", async () => {
    const { service, store, other } = setup();
    delete store.user;

    await expect(service.inviteUserToGroup(other.email)).rejects.toThrow(
      "No authenticated user in current request.",
    );
  });
});

describe("GroupInviteService.acceptInviteToGroup", () => {
  it("moves the current user into the inviting group and deletes the invite", async () => {
    const { service, invites, store, me, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.invites[0];
    if (invite === undefined) throw new Error("expected an invite");

    store.user = other;
    unwrap(await service.acceptInviteToGroup(invite.publicId));

    expect(other.groupId).toBe(me.groupId);
    expect(invites.invites).toHaveLength(0);
  });

  it("returns NotFound for an unknown public id", async () => {
    const { service } = setup();

    expect(unwrapError(await service.acceptInviteToGroup("unknown-id"))).toEqual({
      _tag: "NotFound",
      resource: "groupInvite",
      id: "unknown-id",
    });
  });

  it("returns NotFound for an invite addressed to somebody else", async () => {
    const { service, invites, store, me } = setup();
    const invite = invites.add({ groupId: 2, userId: me.id + 100 });

    expect(unwrapError(await service.acceptInviteToGroup(invite.publicId))._tag).toBe("NotFound");
    expect(store.user?.groupId).toBe(me.groupId);
  });

  it("returns NotFound once the invite has expired", async () => {
    const { service, invites, clock, store, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.invites[0];
    if (invite === undefined) throw new Error("expected an invite");
    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);

    store.user = other;
    expect(unwrapError(await service.acceptInviteToGroup(invite.publicId))._tag).toBe("NotFound");
    expect(other.groupId).toBe(2);
  });

  it("cannot accept the same invite twice", async () => {
    const { service, invites, store, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.invites[0];
    if (invite === undefined) throw new Error("expected an invite");

    store.user = other;
    unwrap(await service.acceptInviteToGroup(invite.publicId));
    expect(unwrapError(await service.acceptInviteToGroup(invite.publicId))._tag).toBe("NotFound");
  });
});

describe("GroupInviteService.declineInviteToGroup", () => {
  it("deletes the invite without changing groups", async () => {
    const { service, invites, store, other } = setup();
    await service.inviteUserToGroup(other.email);
    const invite = invites.invites[0];
    if (invite === undefined) throw new Error("expected an invite");

    store.user = other;
    unwrap(await service.declineInviteToGroup(invite.publicId));

    expect(invites.invites).toHaveLength(0);
    expect(other.groupId).toBe(2);
  });

  it("returns NotFound for an unknown public id", async () => {
    const { service } = setup();

    expect(unwrapError(await service.declineInviteToGroup("unknown-id"))).toEqual({
      _tag: "NotFound",
      resource: "groupInvite",
      id: "unknown-id",
    });
  });
});

describe("GroupInviteService.cleanupExpiredInvites", () => {
  it("removes only the invites outside the validity window", async () => {
    const { service, invites, clock, me } = setup();
    const stale = invites.add({ groupId: 2, userId: me.id });

    clock.advance(GROUP_INVITE_VALID_DURATION_MS + HOUR_MS);
    const fresh = invites.add({ groupId: 2, userId: me.id });

    await service.cleanupExpiredInvites();

    expect(invites.invites.map((invite) => invite.publicId)).toEqual([fresh.publicId]);
    expect(invites.invites.map((invite) => invite.id)).not.toContain(stale.id);
  });
});
