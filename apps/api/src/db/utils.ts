import { integer } from "drizzle-orm/sqlite-core";
import { groups } from "./schema";

export const id = () => ({ id: integer().primaryKey({ autoIncrement: true }) });
export const groupId = () => ({
  groupId: integer()
    .notNull()
    .references(() => groups.id),
});
