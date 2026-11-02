import { createDb } from "@/db/client";
import { SourceDrizzleRepository } from "@/sources/source.drizzle-repository";
import { FileFormatDrizzleRepository } from "@/file-formats/file-format.drizzle-repository";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { beforeEach } from "vitest";
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
import { createTestD1 } from "./d1";

export interface RepositoryContainer {
  groups: GroupRepository;
  users: UserRepository;
  groupInvites: GroupInviteRepository;
  fileFormats: FileFormatRepository;
  sources: SourceRepository;
}

export async function createRepositoryContainer(d1?: D1Database): Promise<RepositoryContainer> {
  d1 ??= await createTestD1();
  const db = createDb(d1);

  return {
    groups: new GroupDrizzleRepository(db),
    groupInvites: new GroupInviteDrizzleRepository(db),
    users: new UserDrizzleRepository(db),
    fileFormats: new FileFormatDrizzleRepository(db),
    sources: new SourceDrizzleRepository(db),
  };
}

export function createFakeRepositoryContainer(): RepositoryContainer {
  const repos = {} as RepositoryContainer;

  beforeEach(() => {
    repos.groups = new InMemoryGroupRepository();
    repos.groupInvites = new InMemoryGroupInviteRepository();
    repos.users = new InMemoryUserRepository();
    // fileFormats = new InMemoryFileFormatRepository();
    // sources = new InMemorySourceRepository();
  });

  return repos;
}
