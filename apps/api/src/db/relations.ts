import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    group: r.one.groups({
      optional: false,
      from: r.users.groupId,
      to: r.groups.id,
    }),
  },
  groups: {
    members: r.many.users(),
  },
  groupInvites: {
    group: r.one.groups({
      optional: false,
      from: r.groupInvites.groupId,
      to: r.groups.id,
    }),
    user: r.one.users({
      optional: false,
      from: r.groupInvites.userId,
      to: r.users.id,
    }),
  },
  sources: {
    owner: r.one.users({ optional: false, from: r.sources.ownerId, to: r.users.id }),
    fileFormat: r.one.fileFormats({
      from: r.sources.fileFormatId,
      to: r.fileFormats.id,
    }),
  },
}));
