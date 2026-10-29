import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "@/db/client";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { GroupInviteDrizzleRepository } from "@/group-invites/group-invite.drizzle-repository";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { createTestDatabase, type TestDatabase } from "../test-utils/fake-d1";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import type { User } from "@/users/user.types";

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
  const group = await groups.create();
  const index = nextUser;
  nextUser += 1;
  return unwrap(
    await users.create({
      email: `user-${String(index)}@example.com`,
      firstName: "First",
      lastName: "Last",
      subject: `subject-${String(index)}`,
      groupId: group.id,
    }),
  );
}

describe("GroupInviteDrizzleRepository.create", () => {
  it("inserts an invite with a public id and a creation timestamp", async () => {
    const user = await seedUser();
    const other = await seedUser();

    unwrap(await invites.create(user.groupId, other.id));

    const rows = await invites.byUser(other.id);
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

    unwrap(await invites.create(first.groupId, invitee.id));
    unwrap(await invites.create(second.groupId, invitee.id));

    expect(await invites.byUser(invitee.id)).toHaveLength(2);
  });

  it("gives every invite a distinct public id", async () => {
    const first = await seedUser();
    const second = await seedUser();
    const invitee = await seedUser();

    unwrap(await invites.create(first.groupId, invitee.id));
    unwrap(await invites.create(second.groupId, invitee.id));

    const rows = await invites.byUser(invitee.id);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.publicId).not.toBe(rows[1]?.publicId);
  });
});

describe("GroupInviteDrizzleRepository.byUser", () => {
  it("returns only that user's invites", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    const otherInvitee = await seedUser();

    unwrap(await invites.create(user.groupId, invitee.id));
    unwrap(await invites.create(user.groupId, otherInvitee.id));

    expect(await invites.byUser(invitee.id)).toHaveLength(1);
    expect(await invites.byUser(9999)).toEqual([]);
  });
});

describe("GroupInviteDrizzleRepository.delete", () => {
  it("deletes an existing invite", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.create(user.groupId, invitee.id));
    const [invite] = await invites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await invites.delete(invite.id));
    expect(await invites.byUser(invitee.id)).toEqual([]);
  });

  it("returns DeleteError when there is nothing to delete", async () => {
    expect(unwrapError(await invites.delete(4242))._tag).toBe("DeleteError");
  });

  it("returns DeleteError when the invite was already deleted", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.create(user.groupId, invitee.id));
    const [invite] = await invites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    unwrap(await invites.delete(invite.id));
    expect(unwrapError(await invites.delete(invite.id))._tag).toBe("DeleteError");
  });
});

describe("GroupInviteDrizzleRepository.deleteExpired", () => {
  it("removes invites created before the cutoff", async () => {
    const user = await seedUser();
    const staleInvitee = await seedUser();
    const freshInvitee = await seedUser();
    unwrap(await invites.create(user.groupId, staleInvitee.id));
    unwrap(await invites.create(user.groupId, freshInvitee.id));
    const [stale] = await invites.byUser(staleInvitee.id);
    if (stale === undefined) throw new Error("expected an invite");

    const staleCreatedAt = Math.floor((Date.now() - 2 * DAY_MS) / 1000);
    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      staleCreatedAt,
      stale.id,
    ]);

    await invites.deleteExpired(new Date(Date.now() - DAY_MS));

    expect(await invites.byUser(staleInvitee.id)).toEqual([]);
    expect(await invites.byUser(freshInvitee.id)).toHaveLength(1);
  });

  it("keeps invites created exactly at the cutoff", async () => {
    const user = await seedUser();
    const invitee = await seedUser();
    unwrap(await invites.create(user.groupId, invitee.id));
    const [invite] = await invites.byUser(invitee.id);
    if (invite === undefined) throw new Error("expected an invite");

    const cutoffSeconds = Math.floor(Date.now() / 1000) - Math.floor(DAY_MS / 1000);
    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      cutoffSeconds,
      invite.id,
    ]);

    await invites.deleteExpired(new Date(cutoffSeconds * 1000));

    expect(await invites.byUser(invitee.id)).toHaveLength(1);

    database.run("UPDATE group_invites SET created_at = ? WHERE id = ?", [
      cutoffSeconds - 1,
      invite.id,
    ]);
    await invites.deleteExpired(new Date(cutoffSeconds * 1000));

    expect(await invites.byUser(invitee.id)).toEqual([]);
  });
});
