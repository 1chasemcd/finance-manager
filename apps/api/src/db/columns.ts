import { int } from "drizzle-orm/sqlite-core";

export const id = int().primaryKey({ autoIncrement: true });
