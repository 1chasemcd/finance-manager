import { err, ok, type Result } from "@finapp/result";
import type { Source } from "./source.types";
import type { Db } from "@/db/client";
import { sources } from "@/db/schema";
import { and, eq, getColumns } from "drizzle-orm";
import { handleSqliteConstraintError } from "@/db/errors";
import type { SourceRepository } from "./source.repository";
import type { CreateSourceRequest, UpdateSourceRequest } from "@finapp/schema";

export class SourceDrizzleRepository implements SourceRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<Source | undefined> {
    return this.db.query.sources.findFirst({
      columns: { groupId: false },
      where: { groupId, id },
    });
  }

  byFileFormat(groupId: number, fileFormatId: number): Promise<Source[]> {
    return this.db.query.sources.findMany({
      columns: { groupId: false },
      where: { groupId, fileFormatId },
    });
  }

  all(groupId: number): Promise<Source[]> {
    return this.db.query.sources.findMany({
      columns: { groupId: false },
      where: { groupId },
    });
  }

  async create(groupId: number, input: CreateSourceRequest): Promise<Result<Source>> {
    const { groupId: _, ...returningColumns } = getColumns(sources);

    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(sources)
        .values({ groupId, ...input })
        .returning(returningColumns),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: UpdateSourceRequest): Promise<Result> {
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
