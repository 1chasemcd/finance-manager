import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "@finapp/result";
import type { GroupInviteRepository } from "@/group-invites/group-invite.repository";
import type { GroupInvite } from "@/group-invites/group-invites.types";
import type { GroupRepository } from "@/groups/group.repository";
import type { Group } from "@/groups/group.types";
import type { CreateUserInput, UpdateUserInput, User } from "@/users/user.types";
import type { UserRepository } from "@/users/user.repository";
import type { Optional } from "@/core/types";
import type { Source } from "@/sources/source.types";
import type { CreateSourceInput, UpdateSourceInput } from "@finapp/schema";
import type { SourceRepository } from "@/sources/source.repository";

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];
  private nextId = 1;

  bySubject(subject: string): Promise<User | null> {
    return Promise.resolve(this.find((user) => user.subject === subject));
  }

  byEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.find((user) => user.email === email));
  }

  byGroup(groupId: number): Promise<User[]> {
    return Promise.resolve(this.users.filter((user) => user.groupId === groupId));
  }

  byGroupAndEmail(groupId: number, email: string): Promise<User | null> {
    return Promise.resolve(this.find((user) => user.groupId === groupId && user.email === email));
  }

  create(input: CreateUserInput): Promise<Result<User>> {
    const existing = this.users.find(
      (user) => user.email === input.email || user.subject === input.subject,
    );
    if (existing !== undefined) return Promise.resolve(err());

    return Promise.resolve(ok(this.add(input)));
  }

  update(id: number, input: UpdateUserInput): Promise<Result> {
    const user = this.users.find((candidate) => candidate.id === id);
    if (user === undefined) return Promise.resolve(err());

    if (input.groupId !== undefined) user.groupId = input.groupId;
    return Promise.resolve(ok());
  }

  add(input: Omit<User, "id">): User {
    const user: User = { id: this.nextId, ...input };
    this.nextId += 1;
    this.users.push(user);
    return user;
  }

  private find(predicate: (user: User) => boolean): User | null {
    return this.users.find(predicate) ?? null;
  }
}

export class InMemoryGroupRepository implements GroupRepository {
  readonly groups: Group[] = [];
  private nextId = 1;

  create(): Promise<Group> {
    const group: Group = { id: this.nextId };
    this.nextId += 1;
    this.groups.push(group);
    return Promise.resolve(group);
  }
}

export class InMemoryGroupInviteRepository implements GroupInviteRepository {
  readonly invites: GroupInvite[] = [];
  private nextId = 1;
  private readonly currentTime: () => Date;

  constructor(currentTime = () => new Date()) {
    this.currentTime = currentTime;
  }

  create(groupId: number, userId: number): Promise<Result<GroupInvite>> {
    const existing = this.invites.find(
      (invite) => invite.groupId === groupId && invite.userId === userId,
    );
    if (existing !== undefined) return Promise.resolve(err());

    const newRow = {
      id: this.nextId,
      publicId: randomUUID(),
      groupId,
      userId,
      createdAt: this.currentTime(),
    };
    this.invites.push(newRow);
    this.nextId += 1;
    return Promise.resolve(ok(newRow));
  }

  byUser(userId: number): Promise<GroupInvite[]> {
    return Promise.resolve(this.invites.filter((invite) => invite.userId === userId));
  }

  delete(id: number): Promise<Result> {
    const index = this.invites.findIndex((invite) => invite.id === id);
    if (index === -1) return Promise.resolve(err());
    this.invites.splice(index, 1);
    return Promise.resolve(ok());
  }

  deleteExpired(oldestDate: Date): Promise<void> {
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

type NullsOptional<T> = {
  [K in keyof T as null extends T[K] ? K : never]?: T[K] | undefined;
} & {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
};

function undefinedToNull<T extends object>(obj: NullsOptional<T>): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === undefined ? null : value]),
  ) as T;
}

interface Entity {
  publicId: string;
}

type WithGroup<T> = T & { groupId: number };

function withoutGroupId<T>(entity: WithGroup<T>): T {
  const { groupId: _, ...rest } = entity;
  return rest as T;
}

function getCapability<T extends Entity>(records: WithGroup<T>[]) {
  return (groupId: number, publicId: string): Promise<T | null> => {
    const found = records.find((x) => x.groupId === groupId && x.publicId === publicId);
    return Promise.resolve(found ? withoutGroupId(found) : null);
  };
}

function allCapability<T extends Entity>(records: WithGroup<T>[]) {
  return (groupId: number): Promise<T[]> => {
    return Promise.resolve(records.filter((x) => x.groupId === groupId).map(withoutGroupId));
  };
}

function createCapability<T extends Entity, CreateType>(
  records: WithGroup<T>[],
  mapper: (input: CreateType) => NullsOptional<Omit<T, "publicId">>,
) {
  return (groupId: number, input: CreateType): Promise<Result<T>> => {
    const toInsert = {
      publicId: crypto.randomUUID(),
      groupId,
      ...undefinedToNull(mapper(input)),
    } as WithGroup<T>;
    records.push(toInsert);
    return Promise.resolve(ok(toInsert));
  };
}

function updateCapability<T extends Entity, UpdateType>(
  records: WithGroup<T>[],
  mapper: (input: UpdateType) => Optional<Omit<T, "publicId">>,
) {
  return (groupId: number, publicId: string, input: UpdateType): Promise<Result> => {
    const toUpdate = records.find((x) => x.groupId === groupId && x.publicId === publicId);
    if (!toUpdate) return Promise.resolve(err());
    Object.assign(toUpdate, mapper(input));
    return Promise.resolve(ok());
  };
}

function deleteCapability<T extends Entity>(records: WithGroup<T>[]) {
  return (groupId: number, publicId: string): Promise<Result> => {
    const toDelete = records.findIndex((x) => x.groupId === groupId && x.publicId === publicId);
    if (toDelete === -1) return Promise.resolve(err());
    records.splice(toDelete, 1);
    return Promise.resolve(ok());
  };
}

export function createInMemorySourceRepository(): SourceRepository {
  const records: WithGroup<Source>[] = [];
  return {
    getByFileFormat: (groupId, fileFormatPublicId) =>
      Promise.resolve(
        records
          .filter((x) => x.groupId === groupId && x.fileFormatPublicId === fileFormatPublicId)
          .map(withoutGroupId),
      ),
    get: getCapability(records),
    all: allCapability(records),
    create: createCapability(records, (input: CreateSourceInput) => ({
      ...input,
      archived: false,
    })),
    update: updateCapability(records, (source: UpdateSourceInput) => source),
    delete: deleteCapability(records),
  };
}
