import { describe, expect, it } from "vitest";
import { DrizzleQueryError } from "drizzle-orm";
import { handleSqliteConstraintError, parseSqliteConstraintError } from "@/db/errors";

const notNullErrorMessage =
  "D1_ERROR: NOT NULL constraint failed: sources.owner_id: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_NOTNULL)";

const foreignKeyErrorMessage =
  "D1_ERROR: FOREIGN KEY constraint failed: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_FOREIGNKEY)";

const uniqueErrorMessage =
  "D1_ERROR: UNIQUE constraint failed: sources.group_id, sources.name: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_UNIQUE)";

function buildDrizzleError(message: string) {
  return new DrizzleQueryError("", [], new Error(message));
}

describe("parseSqliteConstraintError", () => {
  it("parses not null constraint error", () => {
    const error = buildDrizzleError(notNullErrorMessage);
    const result = parseSqliteConstraintError(error);
    expect(result).toBeDefined();
    expect(result?._tag).toBe("SqliteConstraintNotNullError");
    expect(result && "column" in result && result.column).toBe("owner_id");
  });

  it("parses unique constraint error", () => {
    const error = buildDrizzleError(uniqueErrorMessage);
    const result = parseSqliteConstraintError(error);
    expect(result).toBeDefined();
    expect(result?._tag).toBe("SqliteConstraintUniqueError");
    expect(result && "columns" in result && result.columns).toEqual(["group_id", "name"]);
  });

  it("parses foreign key constraint error", () => {
    const error = buildDrizzleError(foreignKeyErrorMessage);
    const result = parseSqliteConstraintError(error);
    expect(result).toBeDefined();
    expect(result?._tag).toBe("SqliteConstraintForeignKeyError");
  });

  it("returns undefined for other errors", () => {
    const error = buildDrizzleError("The database exploded.");
    const result = parseSqliteConstraintError(error);
    expect(result).toBeUndefined();
  });
});

describe("handleSqliteConstraintError", () => {
  it("returns handled error as result", async () => {
    const error = buildDrizzleError(foreignKeyErrorMessage);
    const result = await handleSqliteConstraintError(() => {
      throw error;
    });
    expect(result.isErr).toBe(true);
    expect(result.isErr && result.error._tag).toBe("SqliteConstraintForeignKeyError");
  });

  it("throws other errors", async () => {
    const error = new Error("The database is tired.");
    await expect(
      handleSqliteConstraintError(() => {
        throw error;
      }),
    ).rejects.toThrow(error);
  });
});
