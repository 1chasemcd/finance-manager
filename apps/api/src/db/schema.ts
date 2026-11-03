import { foreignKey, integer, snakeCase, text, unique } from "drizzle-orm/sqlite-core";
import { id, groupId, publicId } from "./utils";
import { sql } from "drizzle-orm";

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
  (table) => [unique("users_group_id_uq").on(table.groupId, table.id)],
);

export const groupInvites = table(
  "group_invites",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    userId: integer()
      .notNull()
      .references(() => users.id),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [unique("group_invites_group_user_uq").on(table.groupId, table.userId)],
);

export const fileFormats = table(
  "file_formats",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    name: text().notNull(),

    skipRows: integer().notNull(),
    rowPattern: text(),

    dateIndex: integer().notNull(),
    summaryIndex: integer().notNull(),
    amountIndex: integer().notNull(),

    dateFormat: text(),
    positiveIsSpending: integer({ mode: "boolean" }).notNull(),
  },
  (table) => [
    unique("file_formats_group_id_uq").on(table.groupId, table.id),
    unique("file_formats_group_name_uq").on(table.groupId, table.name),
  ],
);

export const sources = table(
  "sources",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    name: text().notNull(),
    description: text(),
    archived: integer({ mode: "boolean" }).notNull().default(false),
    ownerId: integer().notNull(),
    fileFormatId: integer(),
  },
  (table) => [
    unique("sources_group_id_uq").on(table.groupId, table.id),
    unique("sources_group_name_uq").on(table.groupId, table.name),
    foreignKey({
      name: "sources_group_owner_fk",
      columns: [table.groupId, table.ownerId],
      foreignColumns: [users.groupId, users.id],
    }),
    foreignKey({
      name: "sources_group_file_format_fk",
      columns: [table.groupId, table.fileFormatId],
      foreignColumns: [fileFormats.groupId, fileFormats.id],
    }),
  ],
);

export const categories = table(
  "categories",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    name: text().notNull(),
    description: text(),
    archived: integer({ mode: "boolean" }).notNull().default(false),
  },

  (table) => [
    unique("categories_group_id_uq").on(table.groupId, table.id),
    unique("categories_group_name_uq").on(table.groupId, table.name),
  ],
);

export const transactions = table(
  "transactions",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    date: integer({ mode: "timestamp" }).notNull(),
    amount: integer().notNull(),
    summary: text(),
    categoryId: integer().notNull(),
    sourceId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: "transactions_group_source_fk",
      columns: [table.groupId, table.sourceId],
      foreignColumns: [sources.groupId, sources.id],
    }),

    foreignKey({
      name: "transactions_group_category_fk",
      columns: [table.groupId, table.categoryId],
      foreignColumns: [categories.groupId, categories.id],
    }),
  ],
);

export const categoryRules = table(
  "category_rules",
  {
    ...id(),
    ...groupId(),
    ...publicId(),
    pattern: text().notNull(),
    categoryId: integer(),
  },
  (table) => [
    unique("category_rules_group_pattern_uq").on(table.groupId, table.pattern),
    foreignKey({
      name: "category_rules_group_category_fk",
      columns: [table.groupId, table.categoryId],
      foreignColumns: [categories.groupId, categories.id],
    }),
  ],
);
