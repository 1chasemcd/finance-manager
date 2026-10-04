import { integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { id } from "./columns";

export const accounts = snakeCase.table("accounts", {
  id,
});

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
