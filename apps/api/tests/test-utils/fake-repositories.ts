/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "@finapp/result";
import type { GroupInviteRepository } from "@/group-invites/group-invite.repository";
import type { GroupInvite } from "@/group-invites/group-invites.types";
import type { GroupRepository } from "@/groups/group.repository";
import type { Group } from "@/groups/group.types";
import type { CreateUserInput, UpdateUserInput, User } from "@/users/user.types";
import type { UserRepository } from "@/users/user.repository";
import type { CreateSourceInput, Source, UpdateSourceInput } from "@/sources/source.types";
import type { SourceRepository } from "@/sources/source.repository";
import type { FileFormatRepository } from "@/file-formats/file-format.repository";
import type { FileFormat, WriteFileFormatInput } from "@/file-formats/file-format.types";

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];
  private nextId = 1;

  bySubject(subject: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.subject === subject));
  }

  byEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.email === email));
  }

  byGroup(groupId: number): Promise<User[]> {
    return Promise.resolve(this.users.filter((user) => user.groupId === groupId));
  }

  byGroupAndEmail(groupId: number, email: string): Promise<User | undefined> {
    return Promise.resolve(
      this.users.find((user) => user.groupId === groupId && user.email === email),
    );
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

interface Entity {
  id: number;
  publicId: string;
}

type WithGroup<T> = T & { groupId: number };
type OmitEntity<T> = Omit<T, "id" | "groupId" | "publicId">;

function omitGroup<T>(data: WithGroup<T>): T {
  const { groupId: _, ...rest } = data;
  return rest as T;
}

function byPublicIdCapability<T extends Entity>(
  records: WithGroup<T>[],
): (groupId: number, publicId: string) => Promise<T | undefined>;
function byPublicIdCapability<T extends Entity, U>(
  records: WithGroup<T>[],
  mapper?: (record: T) => U,
): (groupId: number, publicId: string) => Promise<U | undefined>;
function byPublicIdCapability<T extends Entity, U>(
  records: WithGroup<T>[],
  mapper?: (record: T) => U,
) {
  return (groupId: number, publicId: string) => {
    const found = records.find((x) => x.groupId === groupId && x.publicId === publicId);
    return mapper
      ? Promise.resolve(found && mapper(omitGroup(found)))
      : Promise.resolve(found && omitGroup(found));
  };
}

function allCapability<T extends Entity>(records: WithGroup<T>[]) {
  return (groupId: number): Promise<T[]> => {
    return Promise.resolve(records.filter((x) => x.groupId === groupId).map(omitGroup));
  };
}

function createCapability<T extends Entity, CreateType>(
  records: WithGroup<T>[],
  mapper: (input: CreateType) => OmitEntity<T>,
) {
  let nextId = 1;
  return (groupId: number, input: CreateType): Promise<Result<T>> => {
    const toInsert = {
      ...mapper(input),
      id: nextId++,
      groupId,
      publicId: crypto.randomUUID(),
    } as WithGroup<T>;
    records.push(toInsert);
    return Promise.resolve(ok(omitGroup(toInsert)));
  };
}

function updateCapability<T extends Entity, UpdateType>(
  records: WithGroup<T>[],
  mapper: (input: UpdateType) => OmitEntity<T>,
) {
  return (groupId: number, id: number, input: UpdateType): Promise<Result> => {
    const toUpdate = records.find((x) => x.groupId === groupId && x.id === id);
    if (!toUpdate) return Promise.resolve(err());

    Object.assign(toUpdate, mapper(input));
    return Promise.resolve(ok());
  };
}

function deleteCapability<T extends Entity>(records: WithGroup<T>[]) {
  return (groupId: number, id: number): Promise<Result> => {
    const index = records.findIndex((x) => x.groupId === groupId && x.id === id);
    if (index === -1) return Promise.resolve(err());
    records.splice(index, 1);
    return Promise.resolve(ok());
  };
}

interface InMemoryFileFormatRepository extends FileFormatRepository {
  records: WithGroup<FileFormat>[];
}

export function createInMemoryFileFormatRepository(): InMemoryFileFormatRepository {
  const records: WithGroup<FileFormat>[] = [];

  const mapper = (input: WriteFileFormatInput) => ({
    ...input,
    rowPattern: input.rowPattern ?? null,
    dateFormat: input.dateFormat ?? null,
  });

  return {
    records,
    byPublicId: byPublicIdCapability(records),
    all: allCapability(records),
    create: createCapability(records, mapper),
    update: updateCapability(records, mapper),
    delete: deleteCapability(records),
  };
}

interface InMemorySourceRepository extends SourceRepository {
  records: WithGroup<Source>[];
}

export function createInMemorySourceRepository(
  users: InMemoryUserRepository,
  fileFormats: InMemoryFileFormatRepository,
): InMemorySourceRepository {
  const records: WithGroup<Source>[] = [];

  const mapper = (rec: Source) => {
    const { ownerId, fileFormatId, ...rest } = rec;
    const owner = users.users.find((x) => x.id === ownerId)!;
    const fileFormat =
      fileFormats.records.map(omitGroup).find((x) => x.id === fileFormatId) ?? null;

    return { owner, fileFormat, ...rest };
  };

  const writeMapper = (input: CreateSourceInput | UpdateSourceInput) => ({
    ...input,
    description: input.description ?? null,
    fileFormatId: input.fileFormatId ?? null,
    archived: "archived" in input ? input.archived : false,
  });

  return {
    records,
    byFileFormat: (groupId, fileFormatId) =>
      Promise.resolve(
        records
          .filter((x) => x.groupId === groupId && x.fileFormatId === fileFormatId)
          .map(omitGroup),
      ),
    byPublicId: byPublicIdCapability(records, mapper),
    all: allCapability(records),
    create: createCapability(records, writeMapper),
    update: updateCapability(records, writeMapper),
    delete: deleteCapability(records),
  };
}
