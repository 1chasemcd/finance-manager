import { err, ok, type Result } from "@finapp/result";
import type { FileFormat } from "./file-format.types";
import type { Db } from "@/db/client";
import { fileFormats } from "@/db/schema";
import { and, eq, getColumns } from "drizzle-orm";
import type { FileFormatRepository } from "./file-format.repository";
import { handleSqliteConstraintError } from "@/db/errors";
import type { WriteFileFormatRequest } from "@finapp/schema";

export class FileFormatDrizzleRepository implements FileFormatRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<FileFormat | undefined> {
    return this.db.query.fileFormats.findFirst({
      columns: { groupId: false },
      where: { groupId, id },
    });
  }

  all(groupId: number): Promise<FileFormat[]> {
    return this.db.query.fileFormats.findMany({ columns: { groupId: false }, where: { groupId } });
  }

  async create(groupId: number, input: WriteFileFormatRequest): Promise<Result<FileFormat>> {
    const { groupId: _, ...returningColumns } = getColumns(fileFormats);

    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(fileFormats)
        .values({ groupId, ...input })
        .returning(returningColumns),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: WriteFileFormatRequest): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .update(fileFormats)
        .set(input)
        .where(and(eq(fileFormats.groupId, groupId), eq(fileFormats.id, id))),
    );

    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
  async delete(groupId: number, id: number): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .delete(fileFormats)
        .where(and(eq(fileFormats.groupId, groupId), eq(fileFormats.id, id))),
    );
    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
}
