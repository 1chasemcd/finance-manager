import { createDb, type Db } from "@/db/client";
import { createTestDatabase, type TestDatabase } from "./fake-d1";
import { SourceDrizzleRepository } from "@/sources/source.drizzle-repository";
import { FileFormatDrizzleRepository } from "@/file-formats/file-format.drizzle-repository";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { afterEach, beforeEach } from "vitest";
import type { SourceRepository } from "@/sources/source.repository";
import type { FileFormatRepository } from "@/file-formats/file-format.repository";
import type { UserRepository } from "@/users/user.repository";
import type { GroupRepository } from "@/groups/group.repository";
import type { GroupInviteRepository } from "@/group-invites/group-invite.repository";
import { GroupInviteDrizzleRepository } from "@/group-invites/group-invite.drizzle-repository";
import {
  InMemoryGroupInviteRepository,
  InMemoryGroupRepository,
  InMemoryUserRepository,
} from "./fake-repositories";

export interface RepositoryContainer {
  groups: GroupRepository;
  users: UserRepository;
  groupInvites: GroupInviteRepository;
  fileFormats: FileFormatRepository;
  sources: SourceRepository;
}

export function createRepositoryContainer(): RepositoryContainer {
  let database: TestDatabase;
  let db: Db;
  const repos = {} as RepositoryContainer;

  beforeEach(() => {
    database = createTestDatabase();
    db = createDb(database.d1);
    repos.groups = new GroupDrizzleRepository(db);
    repos.groupInvites = new GroupInviteDrizzleRepository(db);
    repos.users = new UserDrizzleRepository(db);
    repos.fileFormats = new FileFormatDrizzleRepository(db);
    repos.sources = new SourceDrizzleRepository(db);
  });

  afterEach(() => {
    database.close();
  });

  return repos;
}

export function createFakeRepositoryContainer(): RepositoryContainer {
  let groups = {} as GroupRepository;
  let users = {} as UserRepository;
  let groupInvites = {} as GroupInviteRepository;
  const fileFormats = {} as FileFormatRepository;
  const sources = {} as SourceRepository;

  beforeEach(() => {
    groups = new InMemoryGroupRepository();
    groupInvites = new InMemoryGroupInviteRepository();
    users = new InMemoryUserRepository();
    // fileFormats = new InMemoryFileFormatRepository();
    // sources = new InMemorySourceRepository();
  });

  return {
    groups,
    users,
    groupInvites,
    fileFormats,
    sources,
  };
}
