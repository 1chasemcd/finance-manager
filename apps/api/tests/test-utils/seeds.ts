import type { Group } from "@/groups/group.types";
import type { RepositoryContainer } from "./repository-container";
import { beforeEach } from "vitest";
import { unwrap } from "./unwrap";
import type { CreateUserInput, User } from "@/users/user.types";
import type { FileFormat, WriteFileFormatInput } from "@/file-formats/file-format.types";
import type { CreateSourceRequest } from "@finapp/schema";

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
    seedFileFormat: async (data: { group?: Group } & Partial<WriteFileFormatInput> = {}) => {
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
  };

  return seeds;
}
