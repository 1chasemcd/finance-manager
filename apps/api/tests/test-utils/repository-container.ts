import { createDb } from "@/db/client";
import { SourceDrizzleRepository } from "@/sources/source.drizzle-repository";
import { CategoryDrizzleRepository } from "@/categories/category.drizzle-repository";
import { CategoryRuleDrizzleRepository } from "@/category-rules/category-rule.drizzle-repository";
import { FileFormatDrizzleRepository } from "@/file-formats/file-format.drizzle-repository";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { beforeEach } from "vitest";
import type { UserRepository } from "@/users/user.repository";
import type { GroupRepository } from "@/groups/group.repository";
import type { GroupInviteRepository } from "@/group-invites/group-invite.repository";
import { GroupInviteDrizzleRepository } from "@/group-invites/group-invite.drizzle-repository";
import {
  createFakeCategoryRepository,
  createFakeCategoryRuleRepository,
  createFakeFileFormatRepository,
  createFakeSourceRepository,
  createFakeGroupInviteRepository,
  createFakeGroupRepository,
  createFakeUserRepository,
} from "./fake-repositories";
import { createFakeD1 } from "./d1";
import type { FileFormatRepository } from "@/file-formats/file-format.repository";
import type { SourceRepository } from "@/sources/source.repository";
import type { CategoryRepository } from "@/categories/category.repository";
import type { CategoryRuleRepository } from "@/category-rules/category-rule.repository";

export interface RepositoryContainer {
  groups: GroupRepository;
  users: UserRepository;
  groupInvites: GroupInviteRepository;
  fileFormats: FileFormatRepository;
  sources: SourceRepository;
  categories: CategoryRepository;
  categoryRules: CategoryRuleRepository;
}

export async function createRepositoryContainer(d1?: D1Database): Promise<RepositoryContainer> {
  d1 ??= await createFakeD1();
  const db = createDb(d1);

  return {
    groups: new GroupDrizzleRepository(db),
    groupInvites: new GroupInviteDrizzleRepository(db),
    users: new UserDrizzleRepository(db),
    fileFormats: new FileFormatDrizzleRepository(db),
    sources: new SourceDrizzleRepository(db),
    categories: new CategoryDrizzleRepository(db),
    categoryRules: new CategoryRuleDrizzleRepository(db),
  };
}

export function createFakeRepositoryContainer(): RepositoryContainer {
  const repositories: RepositoryContainer & Record<string, { records: unknown[] }> = {
    groups: createFakeGroupRepository(),
    groupInvites: createFakeGroupInviteRepository(),
    users: createFakeUserRepository(),
    fileFormats: createFakeFileFormatRepository(),
    sources: createFakeSourceRepository(),
    categories: createFakeCategoryRepository(),
    categoryRules: createFakeCategoryRuleRepository(),
  };

  beforeEach(() => {
    Object.values(repositories).forEach((x) => (x.records.length = 0));
  });

  return repositories;
}
