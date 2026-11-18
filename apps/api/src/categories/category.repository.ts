import type { Result } from "@finapp/result";
import type { Category } from "./category.types";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@finapp/schema";

export interface CategoryRepository {
  all(groupId: number): Promise<Category[]>;
  byId(groupId: number, id: number): Promise<Category | undefined>;
  create(groupId: number, input: CreateCategoryRequest): Promise<Result<Category>>;
  update(groupId: number, id: number, input: UpdateCategoryRequest): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
