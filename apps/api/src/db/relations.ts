import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    group: r.one.groups({
      from: r.users.groupId,
      to: r.groups.id,
    }),
  },
  groups: {
    members: r.many.users(),
  },
  groupInvites: {
    group: r.one.groups({
      from: r.groupInvites.groupId,
      to: r.groups.id,
    }),
    user: r.one.users({
      from: r.groupInvites.userId,
      to: r.users.id,
    }),
  },
}));
