import { snakeCase, text } from "drizzle-orm/sqlite-core";
import { id } from "../columns";

export const users = snakeCase.table("users", {
  id,
  firstName: text().notNull(),
  lastName: text().notNull(),
});
