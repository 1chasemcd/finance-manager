import { err, ok, type Result } from "@finapp/result";
import type { WriteFileFormatInput, FileFormat } from "./file-format.types";
import type { Db } from "@/db/client";
import { fileFormats } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { FileFormatRepository } from "./file-format.repository";
import { handleSqliteConstraintError } from "@/db/errors";

export class FileFormatDrizzleRepository implements FileFormatRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<FileFormat | undefined> {
    return this.db.query.fileFormats.findFirst({ where: { groupId, id } });
  }

  all(groupId: number): Promise<FileFormat[]> {
    return this.db.query.fileFormats.findMany({ where: { groupId } });
  }

  async create(groupId: number, input: WriteFileFormatInput): Promise<Result<FileFormat>> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(fileFormats)
        .values({ groupId, ...input })
        .returning(),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: WriteFileFormatInput): Promise<Result> {
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
