import { integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { id } from "./utils";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const groups = snakeCase.table("groups", {
  id,
});

export const users = snakeCase.table("users", {
  id,
  subject: text().notNull().unique(),
  email: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  groupId: integer()
    .notNull()
    .references(() => groups.id),
});

export const groupInvites = snakeCase.table("group_invites", {
  id,
  publicId: text()
    .$defaultFn(() => randomUUID())
    .notNull()
    .unique(),
  groupId: integer()
    .notNull()
    .references(() => groups.id),
  userId: integer()
    .notNull()
    .references(() => users.id),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
