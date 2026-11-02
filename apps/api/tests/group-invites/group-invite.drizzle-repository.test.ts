import { describe, expect, it } from "vitest";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { createTestD1 } from "../test-utils/d1";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const d1 = await createTestD1();
const repos = await createRepositoryContainer(d1);
const { seedUser } = createDataSeeds(repos);
const { groupInvites } = repos;

describe("GroupInviteDrizzleRepository.create", () => {
  it("inserts an invite with a public id and a creation timestamp", async () => {
    const user = await seedUser();
    const other = await seedUser();

    unwrap(await groupInvites.create(user.groupId, other.id));

    const rows = await groupInvites.byUser(other.id);
    expect(rows).toHaveLength(1);
    const invite = rows[0];
    if (invite === undefined) throw new Error("expected an invite");

    expect(invite.groupId).toBe(user.groupId);
    expect(invite.userId).toBe(other.id);
    expect(invite.publicId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(invite.createdAt).toBeInstanceOf(Date);
    expect(Math.abs(invite.createdAt.getTime() - Date.now())).toBeLessThan(HOUR_MS);
  });

  it("allows inviting the same user to a different group", async () => {
    const first = await seedUser();
    const second = await seedUser();
    const invitee = await seedUser();

    unwrap(await groupInvites.create(first.groupId, invitee.id));
    unwrap(await groupInvites.create(second.groupId, invitee.id));

    expect(await groupInvites.byUser(invitee.id)).toHaveLength(2);
  });

  it("gives every invite a distinct public id", async () => {
    const first = await seedUser();
    const second = await seedUser();
    const invitee = await seedUser();

    unwrap(await groupInvites.create(first.groupId, invitee.id));
    unwrap(await groupInvites.create(second.groupId, invitee.id));

    const rows = await groupInvites.byUser(invitee.id);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.publicId).not.toBe(rows[1]?.publicId);
  });
});

describe("GroupInviteDrizzleRepository.byUser", () => {
  it("returns only that user's invites", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    const otherInvitee = await seedUser();

    unwrap(await groupInvites.create(user.groupId, invitee.id));
    unwrap(await groupInvites.create(user.groupId, otherInvitee.id));

    expect(await groupInvites.byUser(invitee.id)).toHaveLength(1);
    expect(await groupInvites.byUser(9999)).toEqual([]);
  });
});

describe("GroupInviteDrizzleRepository.delete", () => {
  it("deletes an existing invite", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await groupInvites.create(user.groupId, invitee.id));
    const [invite] = await groupInvites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await groupInvites.delete(invite.id));
    expect(await groupInvites.byUser(invitee.id)).toEqual([]);
  });

  it("returns DeleteError when there is nothing to delete", async () => {
    expect(unwrapError(await groupInvites.delete(4242))._tag).toBe("DeleteError");
  });

  it("returns DeleteError when the invite was already deleted", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await groupInvites.create(user.groupId, invitee.id));
    const [invite] = await groupInvites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await groupInvites.delete(invite.id));
    expect(unwrapError(await groupInvites.delete(invite.id))._tag).toBe("DeleteError");
  });
});

describe("GroupInviteDrizzleRepository.deleteExpired", () => {
  it("removes invites created before the cutoff", async () => {
    const user = await seedUser();
    const staleInvitee = await seedUser();
    const freshInvitee = await seedUser();
    unwrap(await groupInvites.create(user.groupId, staleInvitee.id));
    unwrap(await groupInvites.create(user.groupId, freshInvitee.id));
    const [stale] = await groupInvites.byUser(staleInvitee.id);
    if (stale === undefined) throw new Error("expected an invite");

    const staleCreatedAt = Math.floor((Date.now() - 2 * DAY_MS) / 1000);
    await d1
      .prepare("UPDATE group_invites SET created_at = ? WHERE id = ?")
      .bind(staleCreatedAt, stale.id)
      .run();

    await groupInvites.deleteExpired(new Date(Date.now() - DAY_MS));

    expect(await groupInvites.byUser(staleInvitee.id)).toEqual([]);
    expect(await groupInvites.byUser(freshInvitee.id)).toHaveLength(1);
  });

  it("keeps invites created exactly at the cutoff", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await groupInvites.create(user.groupId, invitee.id));
    const [invite] = await groupInvites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    const cutoffSeconds = Math.floor(Date.now() / 1000) - Math.floor(DAY_MS / 1000);
    await d1
      .prepare("UPDATE group_invites SET created_at = ? WHERE id = ?")
      .bind(cutoffSeconds, invite.id)
      .run();

    await groupInvites.deleteExpired(new Date(cutoffSeconds * 1000));

    expect(await groupInvites.byUser(invitee.id)).toHaveLength(1);

    await d1
      .prepare("UPDATE group_invites SET created_at = ? WHERE id = ?")
      .bind(cutoffSeconds - 1, invite.id)
      .run();
    await groupInvites.deleteExpired(new Date(cutoffSeconds * 1000));

    expect(await groupInvites.byUser(invitee.id)).toEqual([]);
  });
});
