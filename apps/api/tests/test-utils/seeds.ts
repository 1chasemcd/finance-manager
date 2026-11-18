import type { Group } from "@/groups/group.types";
import type { RepositoryContainer } from "./repository-container";
import { beforeEach } from "vitest";
import { unwrap } from "./unwrap";
import type { CreateUserInput, User } from "@/users/user.types";
import type { FileFormat } from "@/file-formats/file-format.types";
import type { Category } from "@/categories/category.types";
import type { Source } from "@/sources/source.types";
import type { CreateTransactionInput } from "@/transactions/transaction.types";
import type {
  CreateCategoryRequest,
  CreateSourceRequest,
  WriteCategoryRuleRequest,
  WriteFileFormatRequest,
} from "@finapp/schema";

export type Seeds = ReturnType<typeof createDataSeeds>;

export function createDataSeeds(repos: RepositoryContainer) {
  let counter = 0;
  beforeEach(() => {
    counter = 0;
  });
  const seeds = {
    seedGroup: () => repos.groups.create(),
    seedUser: async (data: { group?: Group } & Partial<Omit<CreateUserInput, "groupId">> = {}) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      return unwrap(
        await repos.users.create({
          email: data.email ?? `user-${index}@example.com`,
          firstName: data.firstName ?? "First",
          lastName: data.lastName ?? "Last",
          subject: data.subject ?? `subject-${index}`,
          groupId: data.group.id,
        }),
      );
    },
    seedGroupInvite: async (data: { group?: Group; user?: User } = {}) => {
      data.group ??= await seeds.seedGroup();
      data.user ??= await seeds.seedUser();
      unwrap(await repos.groupInvites.create(data.group.id, data.user.id));
    },
    seedFileFormat: async (data: { group?: Group } & Partial<WriteFileFormatRequest> = {}) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      return unwrap(
        await repos.fileFormats.create(data.group.id, {
          name: data.name ?? `format-${index}`,
          skipRows: data.skipRows ?? 0,
          dateIndex: data.dateIndex ?? 0,
          summaryIndex: data.summaryIndex ?? 0,
          amountIndex: data.amountIndex ?? 0,
          positiveIsSpending: data.positiveIsSpending ?? false,
          dateFormat: data.dateFormat,
          rowPattern: data.rowPattern,
        }),
      );
    },
    seedSource: async (
      data: ({ group?: Group } | { user?: User; fileFormat?: FileFormat }) &
        Partial<Omit<CreateSourceRequest, "ownerId" | "fileFormatId">> & {
          archived?: boolean;
        } = {},
    ) => {
      const user = "user" in data ? data.user : await seeds.seedUser("group" in data ? data : {});
      const fileFormat = "fileFormat" in data ? data.fileFormat : undefined;

      const index = String(counter++);
      const result = unwrap(
        await repos.sources.create(user.groupId, {
          name: data.name ?? `source-${index}`,
          description: data.description,
          ownerId: user.id,
          fileFormatId: fileFormat?.id,
        }),
      );

      if (data.archived === true)
        await repos.sources.update(user.groupId, result.id, { ...result, archived: true });

      return result;
    },
    seedCategory: async (
      data: { group?: Group } & Partial<CreateCategoryRequest> & {
          archived?: boolean;
        } = {},
    ) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      const result = unwrap(
        await repos.categories.create(data.group.id, {
          name: data.name ?? `category-${index}`,
          description: data.description,
        }),
      );

      if (data.archived === true) {
        unwrap(
          await repos.categories.update(data.group.id, result.id, {
            name: result.name,
            description: result.description,
            archived: true,
          }),
        );
        return { ...result, archived: true };
      }

      return result;
    },
    seedCategoryRule: async (
      data: { group?: Group; category?: Category } & Partial<
        Omit<WriteCategoryRuleRequest, "categoryId">
      > = {},
    ) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      return unwrap(
        await repos.categoryRules.create(data.group.id, {
          pattern: data.pattern ?? `pattern-${index}`,
          categoryId: "category" in data ? data.category.id : null,
        }),
      );
    },
    seedTransaction: async (
      data: {
        group?: Group;
        source?: Source;
        category?: Category;
      } & Partial<Omit<CreateTransactionInput, "sourceId" | "categoryId">> = {},
    ) => {
      data.group ??= await seeds.seedGroup();
      const source = data.source ?? (await seeds.seedSource({ group: data.group }));
      const category = data.category ?? (await seeds.seedCategory({ group: data.group }));

      return unwrap(
        await repos.transactions.create(data.group.id, {
          date: data.date ?? "2026-01-01",
          amount: data.amount ?? 0,
          summary: data.summary,
          categoryId: category.id,
          sourceId: source.id,
        }),
      );
    },
  };

  return seeds;
}
