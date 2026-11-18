import type { CategoryRule } from "./category-rule.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, type Result } from "@finapp/result";
import type { CategoryRuleRepository } from "./category-rule.repository";
import type { WriteCategoryRuleRequest } from "@finapp/schema";

type NotFound = "NotFound";
type Conflict = "Conflict";

export class CategoryRuleService {
  constructor(
    private readonly categoryRules: CategoryRuleRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  all(): Promise<CategoryRule[]> {
    const { groupId } = this.currentUser.require();
    return this.categoryRules.all(groupId);
  }

  async get(id: number): Promise<CategoryRule | undefined> {
    const { groupId } = this.currentUser.require();
    return this.categoryRules.byId(groupId, id);
  }

  create(request: WriteCategoryRuleRequest): Promise<Result<CategoryRule>> {
    const { groupId } = this.currentUser.require();
    return this.categoryRules.create(groupId, request);
  }

  async update(
    id: number,
    request: WriteCategoryRuleRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toUpdate = await this.categoryRules.byId(groupId, id);
    if (!toUpdate) return err("NotFound");

    const result = await this.categoryRules.update(groupId, id, request);
    if (result.isErr) return err("Conflict");

    return result;
  }

  async delete(id: number): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toDelete = await this.categoryRules.byId(groupId, id);
    if (!toDelete) return err("NotFound");

    const result = await this.categoryRules.delete(groupId, id);
    if (result.isErr) return err("Conflict");
    return result;
  }
}
