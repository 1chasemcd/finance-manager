import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "../../src/db/client";
import { GroupDrizzleRepository } from "../../src/groups/group.drizzle-repository";
import { GroupInviteDrizzleRepository } from "../../src/group-invites/group-invite.drizzle-repository";
import { UserDrizzleRepository } from "../../src/users/user.drizzle-repository";
import { createTestDatabase, type TestDatabase } from "../test-utils/fake-d1";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import type { User } from "../../src/users/user.types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

let database: TestDatabase;
let db: Db;
let invites: GroupInviteDrizzleRepository;
let users: UserDrizzleRepository;
let groups: GroupDrizzleRepository;
let nextUser = 1;

beforeEach(() => {
  database = createTestDatabase();
  db = createDb(database.d1);
  invites = new GroupInviteDrizzleRepository(db);
  users = new UserDrizzleRepository(db);
  groups = new GroupDrizzleRepository(db);
  nextUser = 1;
});

afterEach(() => {
  database.close();
});

async function seedUser(): Promise<User> {
  const group = await groups.createGroup();
  const index = nextUser;
  nextUser += 1;
  return unwrap(
    await users.createUser({
      email: `user-${String(index)}@example.com`,
      firstName: "First",
      lastName: "Last",
      subject: `subject-${String(index)}`,
      groupId: group.id,
    }),
  );
}

describe("GroupInviteDrizzleRepository.createInvite", () => {
  it("inserts an invite with a public id and a creation timestamp", async () => {
    const user = await seedUser();
    const other = await seedUser();

    unwrap(await invites.createInvite(user.groupId, other.id));

    const rows = await invites.getInvitesByUser(other.id);
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

  it("returns Conflict for a duplicate group and user pair", async () => {
    const user = await seedUser();
    const other = await seedUser();

    unwrap(await invites.createInvite(user.groupId, other.id));
    expect(unwrapError(await invites.createInvite(user.groupId, other.id))._tag).toBe("Conflict");
    expect(await invites.getInvitesByUser(other.id)).toHaveLength(1);
  });

  it("allows inviting the same user to a different group", async () => {
    const first = await seedUser();
    const second = await seedUser();
    const invitee = await seedUser();

    unwrap(await invites.createInvite(first.groupId, invitee.id));
    unwrap(await invites.createInvite(second.groupId, invitee.id));

    expect(await invites.getInvitesByUser(invitee.id)).toHaveLength(2);
  });

  it("gives every invite a distinct public id", async () => {
    const first = await seedUser();
    const second = await seedUser();
    const invitee = await seedUser();

    unwrap(await invites.createInvite(first.groupId, invitee.id));
    unwrap(await invites.createInvite(second.groupId, invitee.id));

    const rows = await invites.getInvitesByUser(invitee.id);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.publicId).not.toBe(rows[1]?.publicId);
  });
});

describe("GroupInviteDrizzleRepository.getInvitesByUser", () => {
  it("returns only that user's invites", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    const otherInvitee = await seedUser();

    unwrap(await invites.createInvite(user.groupId, invitee.id));
    unwrap(await invites.createInvite(user.groupId, otherInvitee.id));

    expect(await invites.getInvitesByUser(invitee.id)).toHaveLength(1);
    expect(await invites.getInvitesByUser(9999)).toEqual([]);
  });
});

describe("GroupInviteDrizzleRepository.deleteInvite", () => {
  it("deletes an existing invite", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.createInvite(user.groupId, invitee.id));
    const [invite] = await invites.getInvitesByUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await invites.deleteInvite(invite.id));
    expect(await invites.getInvitesByUser(invitee.id)).toEqual([]);
  });

  it("returns NotFound when there is nothing to delete", async () => {
    expect(unwrapError(await invites.deleteInvite(4242))).toEqual({
      _tag: "NotFound",
      resource: "groupInvite",
      id: "4242",
    });
  });

  it("returns NotFound when the invite was already deleted", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.createInvite(user.groupId, invitee.id));
    const [invite] = await invites.getInvitesByUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await invites.deleteInvite(invite.id));
    expect(unwrapError(await invites.deleteInvite(invite.id))._tag).toBe("NotFound");
  });
});

describe("GroupInviteDrizzleRepository.deleteInvitesOlderThan", () => {
  it("removes invites created before the cutoff", async () => {
    const user = await seedUser();
    const staleInvitee = await seedUser();
    const freshInvitee = await seedUser();
    unwrap(await invites.createInvite(user.groupId, staleInvitee.id));
    unwrap(await invites.createInvite(user.groupId, freshInvitee.id));
    const [stale] = await invites.getInvitesByUser(staleInvitee.id);
    if (stale === undefined) throw new Error("expected an invite");

    const staleCreatedAt = Math.floor((Date.now() - 2 * DAY_MS) / 1000);
    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      staleCreatedAt,
      stale.id,
    ]);

    await invites.deleteInvitesOlderThan(new Date(Date.now() - DAY_MS));

    expect(await invites.getInvitesByUser(staleInvitee.id)).toEqual([]);
    expect(await invites.getInvitesByUser(freshInvitee.id)).toHaveLength(1);
  });

  it("keeps invites created exactly at the cutoff", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.createInvite(user.groupId, invitee.id));
    const [invite] = await invites.getInvitesByUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    const cutoffSeconds = Math.floor(Date.now() / 1000) - Math.floor(DAY_MS / 1000);
    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      cutoffSeconds,
      invite.id,
    ]);

    await invites.deleteInvitesOlderThan(new Date(cutoffSeconds * 1000));

    expect(await invites.getInvitesByUser(invitee.id)).toHaveLength(1);

    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      cutoffSeconds - 1,
      invite.id,
    ]);
    await invites.deleteInvitesOlderThan(new Date(cutoffSeconds * 1000));

    expect(await invites.getInvitesByUser(invitee.id)).toEqual([]);
  });
});
