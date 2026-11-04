import type { Result } from "@finapp/result";

export type Optional<T> = {
  [K in keyof T]?: T[K] | undefined;
};

export interface DefaultRepository<Entity, Create, Update> {
  get(groupId: number, publicId: string): Promise<Entity | null>;
  all(groupId: number): Promise<Entity[]>;

  create(groupId: number, input: Create): Promise<Result<Entity>>;
  update(groupId: number, publicId: string, input: Update): Promise<Result>;
  delete(groupId: number, publicId: string): Promise<Result>;
}
