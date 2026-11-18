import type { Result } from "@finapp/result";
import type { CategoryRule } from "./category-rule.types";
import type { WriteCategoryRuleRequest } from "@finapp/schema";

export interface CategoryRuleRepository {
  all(groupId: number): Promise<CategoryRule[]>;
  byId(groupId: number, id: number): Promise<CategoryRule | undefined>;
  create(groupId: number, input: WriteCategoryRuleRequest): Promise<Result<CategoryRule>>;
  update(groupId: number, id: number, input: WriteCategoryRuleRequest): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
