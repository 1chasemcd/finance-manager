import { foreignKey, integer, snakeCase, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, groupId } from "./utils";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const table = snakeCase.table;

export const groups = table("groups", {
  ...id(),
});

export const users = table(
  "users",
  {
    ...id(),
    ...groupId(),
    subject: text().notNull().unique(),
    email: text().notNull().unique(),
    firstName: text().notNull(),
    lastName: text().notNull(),
  },
  (table) => [uniqueIndex("users_id_group_id_uq").on(table.id, table.groupId)],
);

export const groupInvites = table("group_invites", {
  ...id(),
  ...groupId(),
  publicId: text()
    .$defaultFn(() => randomUUID())
    .notNull()
    .unique(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const fileFormats = table(
  "file_formats",
  {
    ...id(),
    ...groupId(),
    name: text().notNull(),

    skipRows: integer().notNull(),
    rowPattern: text(),

    dateIndex: integer().notNull(),
    summaryIndex: integer().notNull(),
    amountIndex: integer().notNull(),

    dateFormat: text(),
    positiveIsSpending: integer({ mode: "boolean" }).notNull(),
  },
  (table) => [uniqueIndex("file_formats_id_group_id_uq").on(table.id, table.groupId)],
);

export const sources = table(
  "sources",
  {
    ...id(),
    ...groupId(),
    name: text().notNull(),
    description: text(),
    archived: integer({ mode: "boolean" }).notNull().default(false),
    ownerId: integer(),
    fileFormatId: integer(),
  },
  (table) => [
    uniqueIndex("sources_id_group_id_uq").on(table.id, table.groupId),
    foreignKey({
      name: "sources_owner_group_fk",
      columns: [table.ownerId, table.groupId],
      foreignColumns: [users.id, users.groupId],
    }),
    foreignKey({
      name: "sources_file_format_group_fk",
      columns: [table.ownerId, table.groupId],
      foreignColumns: [fileFormats.id, fileFormats.groupId],
    }),
  ],
);

export const categories = table(
  "categories",
  {
    ...id(),
    ...groupId(),
    name: text().notNull(),
    description: text(),
    archived: integer({ mode: "boolean" }).notNull().default(false),
  },

  (table) => [uniqueIndex("categories_id_group_id_uq").on(table.id, table.groupId)],
);

export const transactions = table(
  "transactions",
  {
    ...id(),
    ...groupId(),
    date: integer({ mode: "timestamp" }).notNull(),
    amount: integer().notNull(),
    summary: text(),
    categoryId: integer().notNull(),
    sourceId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: "transactions_source_group_fk",
      columns: [table.sourceId, table.groupId],
      foreignColumns: [sources.id, sources.groupId],
    }),

    foreignKey({
      name: "transactions_category_group_fk",
      columns: [table.categoryId, table.groupId],
      foreignColumns: [categories.id, categories.groupId],
    }),
  ],
);

export const categoryRules = table(
  "category_rules",
  {
    ...id(),
    ...groupId(),
    pattern: text().notNull(),
    categoryId: integer(),
  },
  (table) => [
    foreignKey({
      name: "category_rules_category_group_fk",
      columns: [table.categoryId, table.groupId],
      foreignColumns: [categories.id, categories.groupId],
    }),
  ],
);
