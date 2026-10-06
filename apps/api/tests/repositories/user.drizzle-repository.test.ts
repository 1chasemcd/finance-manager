import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "../../src/db/client";
import { GroupDrizzleRepository } from "../../src/groups/group.drizzle-repository";
import { UserDrizzleRepository } from "../../src/users/user.drizzle-repository";
import { createTestDatabase, type TestDatabase } from "../test-utils/fake-d1";
import { applyMigrations } from "../test-utils/migrations";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import type { User } from "../../src/users/user.types";

let database: TestDatabase;
let db: Db;
let users: UserDrizzleRepository;
let groups: GroupDrizzleRepository;
let nextUser = 1;

beforeEach(() => {
  database = createTestDatabase();
  applyMigrations(database);
  db = createDb(database.d1);
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

describe("UserDrizzleRepository.getBySubject", () => {
  it("returns the user with that subject", async () => {
    const created = await seedUser();

    expect(unwrap(await users.getBySubject(created.subject))).toEqual(created);
  });

  it("returns NotFound for an unknown subject", async () => {
    expect(unwrapError(await users.getBySubject("missing"))).toEqual({
      _tag: "NotFound",
      resource: "user",
      id: "missing",
    });
  });
});

describe("UserDrizzleRepository.getByEmail", () => {
  it("returns the user with that email", async () => {
    const created = await seedUser();

    expect(unwrap(await users.getByEmail(created.email))).toEqual(created);
  });

  it("returns NotFound for an unknown email", async () => {
    expect(unwrapError(await users.getByEmail("missing@example.com"))).toEqual({
      _tag: "NotFound",
      resource: "user",
      id: "missing@example.com",
    });
  });
});

describe("UserDrizzleRepository.getByGroup", () => {
  it("returns only the members of the group", async () => {
    const first = await seedUser();
    const second = await seedUser();
    expect(second.groupId).not.toBe(first.groupId);

    const members = await users.getByGroup(first.groupId);

    expect(members).toHaveLength(1);
    expect(members[0]?.subject).toBe(first.subject);
  });

  it("returns an empty list for an unknown group", async () => {
    expect(await users.getByGroup(999)).toEqual([]);
  });
});

describe("UserDrizzleRepository.createUser", () => {
  it("persists the new user", async () => {
    const group = await groups.createGroup();
    const created = unwrap(
      await users.createUser({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: group.id,
      }),
    );

    expect(created.id).toBeGreaterThan(0);
    expect(unwrap(await users.getBySubject("subject-1"))).toEqual(created);
    expect(unwrap(await users.getByEmail("jane@example.com"))).toEqual(created);
  });

  it("returns Conflict when the email is already taken", async () => {
    const group = await groups.createGroup();
    unwrap(
      await users.createUser({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: group.id,
      }),
    );

    const result = await users.createUser({
      email: "jane@example.com",
      firstName: "Other",
      lastName: "Person",
      subject: "subject-2",
      groupId: group.id,
    });

    expect(unwrapError(result)._tag).toBe("Conflict");
    expect(await users.getByGroup(group.id)).toHaveLength(1);
  });

  it("returns Conflict when the subject is already taken", async () => {
    const group = await groups.createGroup();
    unwrap(
      await users.createUser({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: group.id,
      }),
    );

    const result = await users.createUser({
      email: "other@example.com",
      firstName: "Other",
      lastName: "Person",
      subject: "subject-1",
      groupId: group.id,
    });

    expect(unwrapError(result)._tag).toBe("Conflict");
    expect(await users.getByGroup(group.id)).toHaveLength(1);
  });
});

describe("UserDrizzleRepository.updateUser", () => {
  it("updates and returns the user", async () => {
    const source = await groups.createGroup();
    const target = await groups.createGroup();
    const created = unwrap(
      await users.createUser({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: source.id,
      }),
    );

    const updated = unwrap(await users.updateUser(created.id, { groupId: target.id }));

    expect(updated).toEqual({ ...created, groupId: target.id });
    expect(unwrap(await users.getBySubject(created.subject)).groupId).toBe(target.id);
  });

  it("returns NotFound for an unknown id", async () => {
    expect(unwrapError(await users.updateUser(4242, { groupId: 1 }))).toEqual({
      _tag: "NotFound",
      resource: "user",
      id: "4242",
    });
  });
});
