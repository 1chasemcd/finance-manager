import { DatabaseSync } from "node:sqlite";

export type SqlParam = null | number | bigint | string | Uint8Array;

interface FakeD1Result {
  readonly success: true;
  readonly results: Record<string, unknown>[];
  readonly meta: {
    readonly changes: number;
    readonly last_row_id: number;
    readonly duration: number;
    readonly rows_read: number;
    readonly rows_written: number;
    readonly changed_db: boolean;
    readonly size_after: number;
    readonly tables_scanned: number;
  };
}

interface FakeStatement {
  readonly sql: string;
  readonly params: SqlParam[];
  bind(...values: unknown[]): FakeStatement;
  run(): Promise<FakeD1Result>;
  all(): Promise<FakeD1Result>;
  first(columnName?: string): Promise<unknown>;
  raw(options?: { columnNames?: boolean }): Promise<unknown[]>;
}

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

function meta(changes: number, lastRowId: number): FakeD1Result["meta"] {
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

function createStatement(database: DatabaseSync, sql: string, params: SqlParam[]): FakeStatement {
  const stmt = database.prepare(sql);

  return {
    sql,
    params,
    bind(...values: unknown[]): FakeStatement {
      return createStatement(database, sql, values.map(toSqlParam));
    },
    run(): Promise<FakeD1Result> {
      if (returnsRows(sql)) {
        const rows = stmt.all(...params);
        return Promise.resolve({ success: true, results: rows, meta: meta(0, 0) });
      }
      const info = stmt.run(...params);
      return Promise.resolve({
        success: true,
        results: [],
        meta: meta(Number(info.changes), Number(info.lastInsertRowid)),
      });
    },
    all(): Promise<FakeD1Result> {
      const rows = stmt.all(...params);
      return Promise.resolve({ success: true, results: rows, meta: meta(0, 0) });
    },
    first(columnName?: string): Promise<unknown> {
      const row = stmt.get(...params);
      if (row === undefined) return Promise.resolve(null);
      if (columnName === undefined) return Promise.resolve(row);
      return Promise.resolve(row[columnName] ?? null);
    },
    raw(options?: { columnNames?: boolean }): Promise<unknown[]> {
      const rows = stmt.all(...params);
      const arrays = rows.map((row) => Object.values(row));
      if (options?.columnNames === true) {
        const first = rows[0];
        return Promise.resolve([first === undefined ? [] : Object.keys(first), ...arrays]);
      }
      return Promise.resolve(arrays);
    },
  };
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

  const d1 = {
    prepare(query: string): FakeStatement {
      return createStatement(database, query, []);
    },
    async batch(statements: FakeStatement[]): Promise<FakeD1Result[]> {
      const results: FakeD1Result[] = [];
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
