import { describe, expect, it } from "vitest";
import { unwrap } from "../test-utils/unwrap";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";

const repos = await createRepositoryContainer();
const { users, groups } = repos;
const { seedUser } = createDataSeeds(repos);

describe("UserDrizzleRepository.bySubject", () => {
  it("returns the user with that subject", async () => {
    const created = await seedUser();

    expect(await users.bySubject(created.subject)).toEqual(created);
  });

  it("returns null for an unknown subject", async () => {
    expect(await users.bySubject("missing")).toBeNull();
  });
});

describe("UserDrizzleRepository.byEmail", () => {
  it("returns the user with that email", async () => {
    const created = await seedUser();

    expect(await users.byEmail(created.email)).toEqual(created);
  });

  it("returns null for an unknown email", async () => {
    expect(await users.byEmail("missing@example.com")).toBeNull();
  });
});

describe("UserDrizzleRepository.byGroup", () => {
  it("returns only the members of the group", async () => {
    const first = await seedUser();
    const second = await seedUser();
    expect(second.groupId).not.toBe(first.groupId);

    const members = await users.byGroup(first.groupId);

    expect(members).toHaveLength(1);
    expect(members[0]?.subject).toBe(first.subject);
  });

  it("returns an empty list for an unknown group", async () => {
    expect(await users.byGroup(999)).toEqual([]);
  });
});

describe("UserDrizzleRepository.create", () => {
  it("persists the new user", async () => {
    const group = await groups.create();
    const created = unwrap(
      await users.create({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: group.id,
      }),
    );

    expect(created.id).toBeGreaterThan(0);
    expect(await users.bySubject("subject-1")).toEqual(created);
    expect(await users.byEmail("jane@example.com")).toEqual(created);
  });

  // it("returns CreateError when the email is already taken", async () => {
  //   const group = await groups.create();
  //   unwrap(
  //     await users.create({
  //       email: "jane@example.com",
  //       firstName: "Jane",
  //       lastName: "Doe",
  //       subject: "subject-1",
  //       groupId: group.id,
  //     }),
  //   );

  //   expect(
  //     async () =>
  //       await users.create({
  //         email: "jane@example.com",
  //         firstName: "Other",
  //         lastName: "Person",
  //         subject: "subject-2",
  //         groupId: group.id,
  //       }),
  //   ).toThrow();
  // });

  // it("returns CreateError when the subject is already taken", async () => {
  //   const group = await groups.create();
  //   unwrap(
  //     await users.create({
  //       email: "jane@example.com",
  //       firstName: "Jane",
  //       lastName: "Doe",
  //       subject: "subject-1",
  //       groupId: group.id,
  //     }),
  //   );

  //   expect(
  //     async () =>
  //       await users.create({
  //         email: "other@example.com",
  //         firstName: "Other",
  //         lastName: "Person",
  //         subject: "subject-1",
  //         groupId: group.id,
  //       }),
  //   ).toThrow();
  // });
});

describe("UserDrizzleRepository.update", () => {
  it("updates and returns the user", async () => {
    const source = await groups.create();
    const target = await groups.create();
    const created = unwrap(
      await users.create({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: source.id,
      }),
    );

    unwrap(await users.update(created.id, { groupId: target.id }));
    const updated = await users.bySubject(created.subject);
    expect(updated).toEqual({ ...created, groupId: target.id });
    expect((await users.bySubject(created.subject))?.groupId).toBe(target.id);
  });

  it("returns err for an unknown id", async () => {
    expect((await users.update(4242, { groupId: 1 })).isErr).toBe(true);
  });
});
