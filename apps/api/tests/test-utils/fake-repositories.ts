import { randomUUID } from "node:crypto";
import { ok, type Result } from "@finapp/result";
import { conflict, notFound, type Conflict, type NotFound } from "../../src/core/errors";
import type { CurrentTime } from "../../src/types/current-time";
import type { GroupInviteRepository } from "../../src/group-invites/group-invite.repository";
import type { GroupInvite } from "../../src/group-invites/group-invites.types";
import type { GroupRepository } from "../../src/groups/group.repository";
import type { Group } from "../../src/groups/group.types";
import type { CreateUserInput, UpdateUserInput, User } from "../../src/users/user.types";
import type { UserRepository } from "../../src/users/user.repository";

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];
  private nextId = 1;

  getBySubject(subject: string): Promise<Result<User, NotFound>> {
    return Promise.resolve(this.find((user) => user.subject === subject, subject));
  }

  getByEmail(email: string): Promise<Result<User, NotFound>> {
    return Promise.resolve(this.find((user) => user.email === email, email));
  }

  getByGroup(groupId: number): Promise<User[]> {
    return Promise.resolve(this.users.filter((user) => user.groupId === groupId));
  }

  createUser(input: CreateUserInput): Promise<Result<User, Conflict>> {
    const existing = this.users.find(
      (user) => user.email === input.email || user.subject === input.subject,
    );
    if (existing !== undefined) return Promise.resolve(conflict());

    return Promise.resolve(ok(this.add(input)));
  }

  updateUser(id: number, input: UpdateUserInput): Promise<Result<User, NotFound>> {
    const user = this.users.find((candidate) => candidate.id === id);
    if (user === undefined) return Promise.resolve(notFound("user", id));

    if (input.groupId !== undefined) user.groupId = input.groupId;
    return Promise.resolve(ok({ ...user }));
  }

  add(input: Omit<User, "id">): User {
    const user: User = { id: this.nextId, ...input };
    this.nextId += 1;
    this.users.push(user);
    return user;
  }

  private find(predicate: (user: User) => boolean, subject: string): Result<User, NotFound> {
    const user = this.users.find(predicate);
    if (user === undefined) return notFound("user", subject);
    return ok(user);
  }
}

export class InMemoryGroupRepository implements GroupRepository {
  readonly groups: Group[] = [];
  private nextId = 1;

  createGroup(): Promise<Group> {
    const group: Group = { id: this.nextId };
    this.nextId += 1;
    this.groups.push(group);
    return Promise.resolve(group);
  }
}

export class InMemoryGroupInviteRepository implements GroupInviteRepository {
  readonly invites: GroupInvite[] = [];
  private nextId = 1;
  private readonly currentTime: CurrentTime;

  constructor(currentTime: CurrentTime = () => new Date()) {
    this.currentTime = currentTime;
  }

  createInvite(groupId: number, userId: number): Promise<Result<void, Conflict>> {
    const existing = this.invites.find(
      (invite) => invite.groupId === groupId && invite.userId === userId,
    );
    if (existing !== undefined) return Promise.resolve(conflict());

    this.invites.push({
      id: this.nextId,
      publicId: randomUUID(),
      groupId,
      userId,
      createdAt: this.currentTime(),
    });
    this.nextId += 1;
    return Promise.resolve(ok());
  }

  getInvitesByUser(userId: number): Promise<GroupInvite[]> {
    return Promise.resolve(this.invites.filter((invite) => invite.userId === userId));
  }

  deleteInvite(id: number): Promise<Result<void, NotFound>> {
    const index = this.invites.findIndex((invite) => invite.id === id);
    if (index === -1) return Promise.resolve(notFound("groupInvite", id));
    this.invites.splice(index, 1);
    return Promise.resolve(ok());
  }

  deleteInvitesOlderThan(oldestDate: Date): Promise<void> {
    const remaining = this.invites.filter((invite) => invite.createdAt >= oldestDate);
    this.invites.splice(0, this.invites.length, ...remaining);
    return Promise.resolve();
  }

  add(
    input: Omit<GroupInvite, "id" | "publicId" | "createdAt"> & { createdAt?: Date },
  ): GroupInvite {
    const invite: GroupInvite = {
      id: this.nextId,
      publicId: randomUUID(),
      createdAt: input.createdAt ?? this.currentTime(),
      groupId: input.groupId,
      userId: input.userId,
    };
    this.nextId += 1;
    this.invites.push(invite);
    return invite;
  }
}

export interface FakeClock {
  readonly currentTime: CurrentTime;
  advance(ms: number): void;
}

export function createFakeClock(start: Date): FakeClock {
  let now = start;
  return {
    currentTime: () => now,
    advance(ms: number): void {
      now = new Date(now.getTime() + ms);
    },
  };
}
