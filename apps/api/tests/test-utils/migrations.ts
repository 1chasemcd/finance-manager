import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "drizzle");

export interface Migration {
  readonly name: string;
  readonly sql: string;
}

function listMigrations(): Migration[] {
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

function applyMigration(db: DatabaseSync, migration: Migration): void {
  for (const statement of migration.sql.split("--> statement-breakpoint")) {
    const sql = statement.trim();
    if (sql.length > 0) db.exec(sql);
  }
}

export function applyMigrations(db: DatabaseSync): void {
  for (const migration of listMigrations()) {
    applyMigration(db, migration);
  }
}
