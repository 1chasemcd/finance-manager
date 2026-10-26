import { integer, text } from "drizzle-orm/sqlite-core";
import { groups } from "./schema";
import { randomUUID } from "crypto";

export const id = () => ({ id: integer().primaryKey({ autoIncrement: true }) });
export const groupId = () => ({
  groupId: integer()
    .notNull()
    .references(() => groups.id),
});
export const publicId = () => ({
  publicId: text()
    .$defaultFn(() => randomUUID())
    .notNull()
    .unique(),
});
