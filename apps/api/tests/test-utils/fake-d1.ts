import { DatabaseSync } from "node:sqlite";
import { applyMigrations } from "./migrations";

export type SqlParam = null | number | bigint | string | Uint8Array;

// interface FakeStatement {
//   readonly sql: string;
//   readonly params: SqlParam[];
//   bind(...values: unknown[]): FakeStatement;
//   run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
//   all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
//   first<T>(columnName?: string): Promise<T | null>;
//   raw(options?: { columnNames?: boolean }): Promise<unknown[]>;
// }

function toSqlParam(value: unknown): SqlParam {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return value;
  }
  if (value instanceof Uint8Array) return value;
  throw new TypeError(`Unsupported SQL parameter type: ${typeof value}`);
}

function returnsRows(sql: string): boolean {
  return /^\s*(?:select|with|pragma|explain|values)\b/i.test(sql);
}

function meta(changes: number, lastRowId: number): D1Result["meta"] {
  return {
    changes,
    last_row_id: lastRowId,
    duration: 0,
    rows_read: 0,
    rows_written: changes,
    changed_db: changes > 0,
    size_after: 0,
    tables_scanned: 0,
  };
}

function createStatement(
  database: DatabaseSync,
  sql: string,
  params: SqlParam[],
): D1PreparedStatement {
  const stmt = database.prepare(sql);

  return {
    sql,
    params,
    bind(...values: unknown[]): D1PreparedStatement {
      return createStatement(database, sql, values.map(toSqlParam));
    },
    run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
      if (returnsRows(sql)) {
        const rows = stmt.all(...params);
        return Promise.resolve({ success: true, results: rows as T[], meta: meta(0, 0) });
      }
      const info = stmt.run(...params);
      return Promise.resolve({
        success: true,
        results: [],
        meta: meta(Number(info.changes), Number(info.lastInsertRowid)),
      });
    },
    all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
      const rows = stmt.all(...params);
      return Promise.resolve({ success: true, results: rows as T[], meta: meta(0, 0) });
    },
    first(columnName?: string): Promise<unknown> {
      const row = stmt.get(...params);
      if (row === undefined) return Promise.resolve(null);
      if (columnName === undefined) return Promise.resolve(row);
      return Promise.resolve(row[columnName] ?? null);
    },
    raw<T = unknown[]>(options?: {
      columnNames?: boolean;
    }): Promise<T[]> | Promise<[string[], ...T[]]> {
      const rows = stmt.all(...params);
      const arrays = rows.map((row) => Object.values(row));
      if (options?.columnNames) {
        const first = rows[0];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return Promise.resolve([
          first === undefined ? [] : Object.keys(first),
          ...(arrays as T[]),
        ]) as Promise<[string[], ...T[]]>;
      }
      return Promise.resolve(arrays as T[]);
    },
  } as D1PreparedStatement;
}

export interface TestDatabase {
  readonly d1: D1Database;
  exec(sql: string): void;
  all<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): T[];
  run(sql: string, params?: readonly unknown[]): number;
  close(): void;
}

export function createTestDatabase(): TestDatabase {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  applyMigrations(database);

  const d1 = {
    prepare(query: string): D1PreparedStatement {
      return createStatement(database, query, []);
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      const results: D1Result<T>[] = [];
      for (const statement of statements) {
        results.push(await statement.run());
      }
      return results;
    },
    exec(): Promise<{ count: number; duration: number }> {
      return Promise.reject(new Error("Use TestDatabase.exec to run raw SQL."));
    },
    withSession(): Promise<never> {
      return Promise.reject(new Error("D1 sessions are not supported by the test database."));
    },
    dump(): Promise<ArrayBuffer> {
      return Promise.reject(new Error("D1 dump is not supported by the test database."));
    },
  };

  return {
    d1: d1 as unknown as D1Database,
    exec(sql: string): void {
      database.exec(sql);
    },
    all<T = Record<string, unknown>>(sql: string, params: readonly unknown[] = []): T[] {
      const rows = database.prepare(sql).all(...(params as SqlParam[]));
      return rows as unknown as T[];
    },
    run(sql: string, params: readonly unknown[] = []): number {
      const info = database.prepare(sql).run(...(params as SqlParam[]));
      return Number(info.changes);
    },
    close(): void {
      database.close();
    },
  };
}
