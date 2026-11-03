import { Err, ok, type Result } from "@finapp/result";

type SqliteConstraintError =
  SqliteConstraintForeignKeyError | SqliteConstraintUniqueError | SqliteConstraintNotNullError;

interface SqliteConstraintForeignKeyError {
  _tag: "SqliteConstraintForeignKeyError";
}
interface SqliteConstraintUniqueError {
  _tag: "SqliteConstraintUniqueError";
  columns: string[];
}

interface SqliteConstraintNotNullError {
  _tag: "SqliteConstraintNotNullError";
  column: string;
}

function parseForeignKeyError(message: string): SqliteConstraintForeignKeyError | undefined {
  if (
    /FOREIGN KEY constraint failed:\s*SQLITE_CONSTRAINT\b.*\bSQLITE_CONSTRAINT_FOREIGNKEY\b/.test(
      message,
    )
  ) {
    return {
      _tag: "SqliteConstraintForeignKeyError",
    };
  }
  return undefined;
}

function parseNotNullError(message: string): SqliteConstraintNotNullError | undefined {
  const notNullMatch = /NOT NULL constraint failed:\s*[^\s:]+\.([^\s:]+)/.exec(message);

  if (notNullMatch?.[1]) {
    return {
      _tag: "SqliteConstraintNotNullError",
      column: notNullMatch[1],
    };
  }

  return undefined;
}

function parseUniqueError(message: string): SqliteConstraintUniqueError | undefined {
  const uniqueMatch = /UNIQUE constraint failed:\s*([^:]+):\s*SQLITE_CONSTRAINT/.exec(message);

  if (uniqueMatch?.[1]) {
    const qualifiedColumns = uniqueMatch[1].split(",").map((column) => column.trim());

    const parsedColumns = qualifiedColumns.map((column) => {
      const separator = column.lastIndexOf(".");
      return separator === -1 ? column : column.slice(separator + 1);
    });

    return {
      _tag: "SqliteConstraintUniqueError",
      columns: parsedColumns,
    };
  }

  return undefined;
}

export function parseSqliteConstraintError(error: unknown): SqliteConstraintError | undefined {
  if (!(error instanceof Error)) return undefined;
  const cause = (error as Error & { cause?: unknown }).cause;
  if (!(cause instanceof Error)) return undefined;

  const message = cause.message;

  const notNull = parseNotNullError(message);
  if (notNull) return notNull;

  const unique = parseUniqueError(message);
  if (unique) return unique;

  const foreignKey = parseForeignKeyError(message);
  if (foreignKey) return foreignKey;

  return undefined;
}

export async function handleSqliteConstraintError<T>(
  query: () => Promise<T>,
): Promise<Result<T, SqliteConstraintError>> {
  try {
    return ok(await query());
  } catch (error) {
    const sqliteError = parseSqliteConstraintError(error);
    if (!sqliteError) throw error;
    return new Err(sqliteError);
  }
}
