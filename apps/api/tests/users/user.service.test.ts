import { describe, expect, it } from "vitest";
import { UserService } from "@/users/user.service";
import { CurrentUser } from "@/identity/current-user";
import { unwrap } from "../test-utils/unwrap";
import type { User } from "@/users/user.types";
import {
  createFakeGroupRepository,
  createFakeUserRepository,
} from "../test-utils/fake-repositories";

function setup() {
  let user: User;
  const groups = createFakeGroupRepository();
  const users = createFakeUserRepository();
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    service: new UserService(users, groups, currentUser),
    users,
    groups,
    setCurrentUser: (newUser: User) => {
      user = newUser;
    },
  };
}

describe("UserService.getUser", () => {
  it("returns the user with the matching subject", async () => {
    const { service, users } = setup();
    const user = await unwrap(
      users.create({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: 1,
      }),
    );

    expect(unwrap(await service.getUser("subject-1"))).toEqual(user);
  });

  it("returns err for an unknown subject", async () => {
    const { service } = setup();

    expect((await service.getUser("missing")).isErr).toBe(true);
  });
});

describe("UserService.all", () => {
  it("returns the user with the matching subject", async () => {
    const { service, users, setCurrentUser } = setup();
    const user = await unwrap(
      users.create({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: 1,
      }),
    );
    setCurrentUser(user);

    expect(await service.all()).toEqual([user]);
  });
});

describe("UserService.onboardUser", () => {
  it("creates a group and assigns the user to it", async () => {
    const { service, users, groups } = setup();

    const user = await unwrap(
      service.onboardUser({
        email: "jane@example.com",
        name: "Jane Doe",
        subject: "subject-1",
      }),
    );

    expect(groups.records).toHaveLength(1);
    expect(user.groupId).toBe(groups.records[0]?.id);
    expect(users.records).toEqual([user]);
  });

  it("splits a full name into first and last name", async () => {
    const { service } = setup();

    const user = unwrap(
      await service.onboardUser({ email: "j@e.com", name: "Jane Doe", subject: "s" }),
    );

    expect(user.firstName).toBe("Jane");
    expect(user.lastName).toBe("Doe");
  });

  it("keeps every word after the first as the last name", async () => {
    const { service } = setup();

    const user = unwrap(
      await service.onboardUser({ email: "j@e.com", name: "Mary Jane Watson", subject: "s" }),
    );

    expect(user.firstName).toBe("Mary");
    expect(user.lastName).toBe("Jane Watson");
  });

  it("ignores surrounding and repeated whitespace", async () => {
    const { service } = setup();

    const user = unwrap(
      await service.onboardUser({ email: "j@e.com", name: "  Jane   Doe  ", subject: "s" }),
    );

    expect(user.firstName).toBe("Jane");
    expect(user.lastName).toBe("Doe");
  });

  it("handles a single-word name", async () => {
    const { service } = setup();

    const user = unwrap(
      await service.onboardUser({ email: "j@e.com", name: "Cher", subject: "s" }),
    );

    expect(user.firstName).toBe("Cher");
    expect(user.lastName).toBe("");
  });

  it("handles an empty name", async () => {
    const { service } = setup();

    const user = unwrap(await service.onboardUser({ email: "j@e.com", name: "", subject: "s" }));

    expect(user.firstName).toBe("");
    expect(user.lastName).toBe("");
  });

  it("passes through email and subject", async () => {
    const { service } = setup();

    const user = unwrap(
      await service.onboardUser({
        email: "jane@example.com",
        name: "Jane Doe",
        subject: "subject-1",
      }),
    );

    expect(user.email).toBe("jane@example.com");
    expect(user.subject).toBe("subject-1");
  });

  it("returns err when the email already belongs to another user", async () => {
    const { service, users } = setup();
    await unwrap(
      users.create({
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "other-subject",
        groupId: 1,
      }),
    );

    const result = await service.onboardUser({
      email: "jane@example.com",
      name: "Jane Doe",
      subject: "subject-1",
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when the subject already belongs to another user", async () => {
    const { service, users } = setup();
    await unwrap(
      users.create({
        email: "other@example.com",
        firstName: "Jane",
        lastName: "Doe",
        subject: "subject-1",
        groupId: 1,
      }),
    );

    const result = await service.onboardUser({
      email: "jane@example.com",
      name: "Jane Doe",
      subject: "subject-1",
    });

    expect(result.isErr).toBe(true);
    expect(users.records).toHaveLength(1);
  });
});
