import type { Group } from "@/groups/group.types";
import type { RepositoryContainer } from "./repository-container";
import { beforeEach } from "vitest";
import { unwrap } from "./unwrap";
import type { User } from "@/users/user.types";
import type { FileFormat } from "@/file-formats/file-format.types";

export function createDataSeeds(repos: RepositoryContainer) {
  let counter = 0;
  beforeEach(() => {
    counter = 0;
  });
  const seeds = {
    seedGroup: () => repos.groups.create(),
    seedUser: async (data: { group?: Group } = {}) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      return unwrap(
        await repos.users.create({
          email: `user-${index}@example.com`,
          firstName: "First",
          lastName: "Last",
          subject: `subject-${index}`,
          groupId: data.group.id,
        }),
      );
    },
    seedGroupInvite: async (data: { group?: Group; user?: User } = {}) => {
      data.group ??= await seeds.seedGroup();
      data.user ??= await seeds.seedUser();
      unwrap(await repos.groupInvites.create(data.group.id, data.user.id));
    },
    seedFileFormat: async (data: { group?: Group } = {}) => {
      data.group ??= await seeds.seedGroup();
      const index = String(counter++);
      return unwrap(
        await repos.fileFormats.create(data.group.id, {
          name: `formatter-${index}`,
          skipRows: 0,
          dateIndex: 0,
          summaryIndex: 0,
          amountIndex: 0,
          positiveIsSpending: false,
        }),
      );
    },
    seedSource: async (data: { group?: Group; user?: User; fileFormat?: FileFormat } = {}) => {
      data.group ??= await seeds.seedGroup();
      data.user ??= await seeds.seedUser(data);
      data.fileFormat ??= await seeds.seedFileFormat(data);

      const index = String(counter++);
      return unwrap(
        await repos.sources.create(data.group.id, {
          name: `formatter-${index}`,
          ownerEmail: data.user.email,
          fileFormatPublicId: data.fileFormat.publicId,
        }),
      );
    },
  };

  return seeds;
}
