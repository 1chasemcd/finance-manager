import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { TestDatabase } from "./fake-d1";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "drizzle");

export interface Migration {
  readonly name: string;
  readonly sql: string;
}

export function listMigrations(): Migration[] {
  const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(join(MIGRATIONS_DIR, name, "migration.sql"), "utf8"),
    }));
}

export function applyMigration(db: TestDatabase, migration: Migration): void {
  for (const statement of migration.sql.split("--> statement-breakpoint")) {
    const sql = statement.trim();
    if (sql.length > 0) db.exec(sql);
  }
}

export function applyMigrations(db: TestDatabase, count = listMigrations().length): void {
  for (const migration of listMigrations().slice(0, count)) {
    applyMigration(db, migration);
  }
}
