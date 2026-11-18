import { err, ok, type Result } from "@finapp/result";
import type { Category } from "./category.types";
import type { Db } from "@/db/client";
import { categories } from "@/db/schema";
import { and, eq, getColumns } from "drizzle-orm";
import type { CategoryRepository } from "./category.repository";
import { handleSqliteConstraintError } from "@/db/errors";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@finapp/schema";

export class CategoryDrizzleRepository implements CategoryRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<Category | undefined> {
    return this.db.query.categories.findFirst({
      columns: { groupId: false },
      where: { groupId, id },
    });
  }

  all(groupId: number): Promise<Category[]> {
    return this.db.query.categories.findMany({ columns: { groupId: false }, where: { groupId } });
  }

  async create(groupId: number, input: CreateCategoryRequest): Promise<Result<Category>> {
    const { groupId: _, ...returningColumns } = getColumns(categories);

    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(categories)
        .values({ groupId, ...input })
        .returning(returningColumns),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: UpdateCategoryRequest): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .update(categories)
        .set(input)
        .where(and(eq(categories.groupId, groupId), eq(categories.id, id))),
    );

    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
  async delete(groupId: number, id: number): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db.delete(categories).where(and(eq(categories.groupId, groupId), eq(categories.id, id))),
    );
    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
}
