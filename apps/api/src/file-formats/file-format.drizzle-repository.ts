import { err, ok, type Result } from "@finapp/result";
import type { FileFormatRepository } from "./file-format.repository";
import type { CreateFileFormatInput, FileFormat, UpdateFileFormatInput } from "./file-format.types";
import type { Db } from "@/db/client";
import { fileFormats } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export class FileFormatDrizzleRepository implements FileFormatRepository {
  constructor(private readonly db: Db) {}

  async byPublicId(groupId: number, publicId: string): Promise<FileFormat | null> {
    const [result] = await this.db
      .select(this.columns())
      .from(fileFormats)
      .where(and(eq(fileFormats.groupId, groupId), eq(fileFormats.publicId, publicId)))
      .limit(1);
    return result ?? null;
  }

  all(groupId: number): Promise<FileFormat[]> {
    return this.db.select(this.columns()).from(fileFormats).where(eq(fileFormats.groupId, groupId));
  }
  async create(groupId: number, input: CreateFileFormatInput): Promise<Result<FileFormat>> {
    const [newRow] = await this.db
      .insert(fileFormats)
      .values({ groupId, ...input })
      .returning(this.columns());

    if (!newRow) return err();
    return ok(newRow);
  }
  async update(groupId: number, publicId: string, input: UpdateFileFormatInput): Promise<Result> {
    const response = await this.db
      .update(fileFormats)
      .set({ groupId, ...input })
      .where(and(eq(fileFormats.groupId, groupId), eq(fileFormats.publicId, publicId)));
    if (response.meta.changes != 1) return err();
    return ok();
  }
  async delete(groupId: number, publicId: string): Promise<Result> {
    const response = await this.db
      .delete(fileFormats)
      .where(and(eq(fileFormats.groupId, groupId), eq(fileFormats.publicId, publicId)));
    if (response.meta.changes != 1) return err();
    return ok();
  }

  private columns() {
    return {
      publicId: fileFormats.publicId,
      name: fileFormats.name,
      skipRows: fileFormats.skipRows,
      rowPattern: fileFormats.rowPattern,
      dateIndex: fileFormats.dateIndex,
      summaryIndex: fileFormats.summaryIndex,
      amountIndex: fileFormats.amountIndex,
      dateFormat: fileFormats.dateFormat,
      positiveIsSpending: fileFormats.positiveIsSpending,
    };
  }
}
