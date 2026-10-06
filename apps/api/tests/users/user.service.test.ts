import { describe, expect, it } from "vitest";
import { UserService } from "../../src/users/user.service";
import { InMemoryGroupRepository, InMemoryUserRepository } from "../test-utils/fake-repositories";
import { unwrap, unwrapError } from "../test-utils/unwrap";

function setup() {
  const users = new InMemoryUserRepository();
  const groups = new InMemoryGroupRepository();
  return { service: new UserService(users, groups), users, groups };
}

describe("UserService.getUser", () => {
  it("returns the user with the matching subject", async () => {
    const { service, users } = setup();
    const user = users.add({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      subject: "subject-1",
      groupId: 1,
    });

    expect(unwrap(await service.getUser("subject-1"))).toEqual(user);
  });

  it("returns NotFound for an unknown subject", async () => {
    const { service } = setup();

    expect(unwrapError(await service.getUser("missing"))).toEqual({
      _tag: "NotFound",
      resource: "user",
      id: "missing",
    });
  });
});

describe("UserService.onboardUser", () => {
  it("creates a group and assigns the user to it", async () => {
    const { service, users, groups } = setup();

    const user = unwrap(
      await service.onboardUser({
        email: "jane@example.com",
        name: "Jane Doe",
        subject: "subject-1",
      }),
    );

    expect(groups.groups).toHaveLength(1);
    expect(user.groupId).toBe(groups.groups[0]?.id);
    expect(users.users).toEqual([user]);
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

  it("returns Conflict when the email already belongs to another user", async () => {
    const { service, users } = setup();
    users.add({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      subject: "other-subject",
      groupId: 1,
    });

    const result = await service.onboardUser({
      email: "jane@example.com",
      name: "Jane Doe",
      subject: "subject-1",
    });

    expect(unwrapError(result)).toEqual({
      _tag: "Conflict",
      message: "The operation conflicts with the current state of the resource.",
    });
  });

  it("returns Conflict when the subject already belongs to another user", async () => {
    const { service, users } = setup();
    users.add({
      email: "other@example.com",
      firstName: "Jane",
      lastName: "Doe",
      subject: "subject-1",
      groupId: 1,
    });

    const result = await service.onboardUser({
      email: "jane@example.com",
      name: "Jane Doe",
      subject: "subject-1",
    });

    expect(unwrapError(result)._tag).toBe("Conflict");
    expect(users.users).toHaveLength(1);
  });
});
