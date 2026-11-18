import type { CategoryDetail, Category } from "./category.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, type Result } from "@finapp/result";
import type { CategoryRepository } from "./category.repository";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@finapp/schema";

type NotFound = "NotFound";
type Conflict = "Conflict";

export class CategoryService {
  constructor(
    private readonly categorys: CategoryRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  all(): Promise<Category[]> {
    const { groupId } = this.currentUser.require();
    return this.categorys.all(groupId);
  }

  async get(id: number): Promise<CategoryDetail | undefined> {
    const { groupId } = this.currentUser.require();
    const result = await this.categorys.byId(groupId, id);
    return result && { ...result, canDelete: await this.canDelete(result.id) };
  }

  create(request: CreateCategoryRequest): Promise<Result<Category>> {
    const { groupId } = this.currentUser.require();
    return this.categorys.create(groupId, request);
  }

  async update(
    id: number,
    request: UpdateCategoryRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toUpdate = await this.categorys.byId(groupId, id);
    if (!toUpdate) return err("NotFound");

    const result = await this.categorys.update(groupId, id, request);
    if (result.isErr) return err("Conflict");

    return result;
  }

  async delete(id: number): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toDelete = await this.categorys.byId(groupId, id);
    if (!toDelete) return err("NotFound");

    const canDelete = await this.canDelete(id);
    if (!canDelete) return err("Conflict");

    const result = await this.categorys.delete(groupId, id);
    if (result.isErr) return err("Conflict");
    return result;
  }

  private canDelete(_: number): Promise<boolean> {
    return Promise.resolve(true);
  }
}
