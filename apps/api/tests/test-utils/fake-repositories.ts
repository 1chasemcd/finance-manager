import { Err, err, Ok, ok, type Result } from "@finapp/result";
import type { GroupInviteRepository } from "@/group-invites/group-invite.repository";
import type { GroupInvite } from "@/group-invites/group-invites.types";
import type { GroupRepository } from "@/groups/group.repository";
import type { Group } from "@/groups/group.types";
import type { User } from "@/users/user.types";
import type { UserRepository } from "@/users/user.repository";
import type { Source } from "@/sources/source.types";
import type { SourceRepository } from "@/sources/source.repository";
import type { FileFormatRepository } from "@/file-formats/file-format.repository";
import type { FileFormat } from "@/file-formats/file-format.types";
import type {
  CreateSourceRequest,
  UpdateSourceRequest,
  WriteFileFormatRequest,
} from "@finapp/schema";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface FakeRepository<T> {
  records: T[];
}

interface Entity {
  id: number;
}

type WithGroup<T> = T & { groupId: number };
type OmitEntity<T> = Omit<T, "id" | "groupId">;

// ----------------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------------

function omitGroup<T>(data: WithGroup<T>): T {
  const { groupId: _, ...rest } = data;
  return rest as T;
}

function errorOn<T>(records: T[], predicate: (x: T) => boolean): Promise<Err<void>> | false {
  return records.find(predicate) === undefined ? false : Promise.resolve(err());
}

function push<T>(records: T[], value: T): Promise<Ok<T>> {
  records.push(value);
  return Promise.resolve(ok(value));
}

// ----------------------------------------------------------------------------
// Repository Capabilities
// ----------------------------------------------------------------------------

function byIdCapability<T extends Entity>(
  records: WithGroup<T>[],
): (groupId: number, id: number) => Promise<T | undefined>;
function byIdCapability<T extends Entity, U>(
  records: WithGroup<T>[],
  mapper?: (record: T) => U,
): (groupId: number, id: number) => Promise<U | undefined>;
function byIdCapability<T extends Entity, U>(records: WithGroup<T>[], mapper?: (record: T) => U) {
  return (groupId: number, id: number) => {
    const found = records.find((x) => x.groupId === groupId && x.id === id);
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

// ----------------------------------------------------------------------------
// Repositories
// ----------------------------------------------------------------------------

type FakeUserRepository = UserRepository & FakeRepository<User>;

export function createFakeUserRepository(): FakeUserRepository {
  const records: User[] = [];
  let nextId = 1;

  return {
    records,
    bySubject: (subject) => Promise.resolve(records.find((x) => x.subject === subject)),
    byEmail: (email) => Promise.resolve(records.find((x) => x.email === email)),
    byGroup: (groupId) => Promise.resolve(records.filter((x) => x.groupId === groupId)),
    byGroupAndEmail: (groupId, email) =>
      Promise.resolve(records.find((x) => x.groupId === groupId && x.email === email)),
    create: (input) =>
      errorOn(records, (x) => x.email === input.email || x.subject === input.subject) ||
      push(records, { id: nextId++, ...input }),
    update: (id, input) => {
      const user = records.find((user) => user.id === id);
      if (!user) return Promise.resolve(err());
      user.groupId = input.groupId;
      return Promise.resolve(ok());
    },
  };
}

type FakeGroupRepository = GroupRepository & FakeRepository<Group>;

export function createFakeGroupRepository(): FakeGroupRepository {
  const records: Group[] = [];
  let id = 0;

  return {
    records,
    create: () => Promise.resolve((id++, records.push({ id }), { id })),
  };
}

type FakeGroupInviteRepository = GroupInviteRepository & FakeRepository<GroupInvite>;

export function createFakeGroupInviteRepository(
  currentTime: () => Date = () => new Date(),
): FakeGroupInviteRepository {
  const records: GroupInvite[] = [];
  let nextId = 1;

  return {
    records,
    create: (groupId, userId) =>
      errorOn(records, (x) => x.groupId === groupId && x.userId === userId) ||
      push(records, { id: nextId++, groupId, userId, createdAt: currentTime() }),
    byUser: (userId) => Promise.resolve(records.filter((x) => x.userId === userId)),
    delete: (id) => {
      const index = records.findIndex((invite) => invite.id === id);
      if (index === -1) return Promise.resolve(err());
      records.splice(index, 1);
      return Promise.resolve(ok());
    },
    deleteExpired(oldestDate: Date): Promise<void> {
      const remaining = records.filter((x) => x.createdAt >= oldestDate);
      records.splice(0, records.length, ...remaining);
      return Promise.resolve();
    },
  };
}

type FakeFileFormatRepository = FileFormatRepository & FakeRepository<WithGroup<FileFormat>>;

export function createFakeFileFormatRepository(): FakeFileFormatRepository {
  const records: WithGroup<FileFormat>[] = [];

  const mapper = (input: WriteFileFormatRequest) => ({
    ...input,
    rowPattern: input.rowPattern ?? null,
    dateFormat: input.dateFormat ?? null,
  });

  return {
    records,
    byId: byIdCapability(records),
    all: allCapability(records),
    create: createCapability(records, mapper),
    update: updateCapability(records, mapper),
    delete: deleteCapability(records),
  };
}

type FakeSourceRepository = SourceRepository & FakeRepository<WithGroup<Source>>;

export function createFakeSourceRepository(): FakeSourceRepository {
  const records: WithGroup<Source>[] = [];

  const mapper = (input: CreateSourceRequest | UpdateSourceRequest) => ({
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
    byId: byIdCapability(records),
    all: allCapability(records),
    create: createCapability(records, mapper),
    update: updateCapability(records, mapper),
    delete: deleteCapability(records),
  };
}
