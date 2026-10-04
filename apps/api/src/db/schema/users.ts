import { integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { id } from "../columns";
import { accounts } from "./accounts";

export const users = snakeCase.table("users", {
  id,
  subject: text().notNull().unique(),
  email: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  accountId: integer()
    .notNull()
    .references(() => accounts.id),
});
