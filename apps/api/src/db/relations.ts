import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    account: r.one.accounts({
      from: r.users.accountId,
      to: r.accounts.id,
    }),
  },
  accounts: {
    members: r.many.users(),
  },
}));
