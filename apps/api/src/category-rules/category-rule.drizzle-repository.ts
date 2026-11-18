import { err, ok, type Result } from "@finapp/result";
import type { CategoryRule } from "./category-rule.types";
import type { Db } from "@/db/client";
import { categoryRules } from "@/db/schema";
import { and, eq, getColumns } from "drizzle-orm";
import type { CategoryRuleRepository } from "./category-rule.repository";
import { handleSqliteConstraintError } from "@/db/errors";
import type { WriteCategoryRuleRequest } from "@finapp/schema";

export class CategoryRuleDrizzleRepository implements CategoryRuleRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<CategoryRule | undefined> {
    return this.db.query.categoryRules.findFirst({
      columns: { groupId: false },
      where: { groupId, id },
    });
  }

  all(groupId: number): Promise<CategoryRule[]> {
    return this.db.query.categoryRules.findMany({
      columns: { groupId: false },
      where: { groupId },
    });
  }

  async create(groupId: number, input: WriteCategoryRuleRequest): Promise<Result<CategoryRule>> {
    const { groupId: _, ...returningColumns } = getColumns(categoryRules);

    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(categoryRules)
        .values({ groupId, ...input })
        .returning(returningColumns),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(groupId: number, id: number, input: WriteCategoryRuleRequest): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .update(categoryRules)
        .set(input)
        .where(and(eq(categoryRules.groupId, groupId), eq(categoryRules.id, id))),
    );

    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
  async delete(groupId: number, id: number): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db
        .delete(categoryRules)
        .where(and(eq(categoryRules.groupId, groupId), eq(categoryRules.id, id))),
    );
    if (result.isErr || result.data.meta.changes != 1) return err();
    return ok();
  }
}
