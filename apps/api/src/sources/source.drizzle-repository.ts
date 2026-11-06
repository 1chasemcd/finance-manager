import { err, ok, type Result } from "@finapp/result";
import type { CreateSourceInput, Source, SourceDetail, UpdateSourceInput } from "./source.types";
import type { Db } from "@/db/client";
import { sources } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { handleSqliteConstraintError } from "@/db/errors";
import type { SourceRepository } from "./source.repository";

export class SourceDrizzleRepository implements SourceRepository {
  constructor(private readonly db: Db) {}

  byPublicId(groupId: number, publicId: string): Promise<SourceDetail | undefined> {
    return this.db.query.sources.findFirst({
      columns: {
        ownerId: false,
        fileFormatId: false,
      },
      where: { groupId, publicId },
      with: { owner: true, fileFormat: true },
    });
  }

  byFileFormat(groupId: number, fileFormatId: number): Promise<Source[]> {
    return this.db.query.sources.findMany({
      where: { groupId, fileFormatId },
    });
  }

  all(groupId: number): Promise<Source[]> {
    return this.db.query.sources.findMany({ where: { groupId } });
  }

  async create(groupId: number, input: CreateSourceInput): Promise<Result<Source>> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(sources)
        .values({ groupId, ...input })
        .returning(),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: UpdateSourceInput): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .update(sources)
        .set(input)
        .where(and(eq(sources.groupId, groupId), eq(sources.id, id))),
    );

    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
  async delete(groupId: number, id: number): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db.delete(sources).where(and(eq(sources.groupId, groupId), eq(sources.id, id))),
    );
    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
}
