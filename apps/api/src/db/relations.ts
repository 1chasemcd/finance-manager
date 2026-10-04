import { defineRelations } from "drizzle-orm";
import { users } from "./schema/users";
import { accounts } from "./schema/accounts";

export const relations = defineRelations({ users, accounts }, (r) => ({
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
