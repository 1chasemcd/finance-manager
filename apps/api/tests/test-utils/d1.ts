import path from "path";
import { beforeEach } from "vitest";
import { readD1Migrations, type D1Migration } from "@cloudflare/vitest-plugin";
import { Miniflare } from "miniflare";

let migrations: D1Migration[] | undefined;
let tables: string[] | undefined;

export async function createTestD1(): Promise<D1Database> {
  const miniflare = new Miniflare({
    modules: true,
    script: "",
    d1Databases: ["DB"],
  });

  const d1 = await miniflare.getD1Database("DB");

  migrations ??= await loadMigrations();
  await applyMigrations(d1, migrations);

  beforeEach(async () => {
    await clearD1(d1);
  });

  return d1;
}

function loadMigrations() {
  const migrationsDir = path.join(__PACKAGE_ROOT__, "drizzle");
  const migrationsPattern = `${migrationsDir}/*/migration.sql`;
  return readD1Migrations({ migrationsDir, migrationsPattern });
}

async function applyMigrations(d1: D1Database, migrations: D1Migration[]) {
  for (const migration of migrations) {
    const queries = migration.queries.map((query) => d1.prepare(query));
    await d1.batch(queries);
  }
}

export async function clearD1(d1: D1Database) {
  tables ??= (
    await d1
      .prepare(
        `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_cf_%'

    `,
      )
      .all<{ name: string }>()
  ).results.map((r) => r.name);

  const foreignKeyStmt = d1.prepare("PRAGMA defer_foreign_keys = ON;");
  const stmts = [];

  for (const table of tables) {
    const escapedName = table.replaceAll('"', '""');
    stmts.push(d1.prepare(`DELETE FROM "${escapedName}";`));
  }

  await d1.batch([foreignKeyStmt, ...stmts]);
}
