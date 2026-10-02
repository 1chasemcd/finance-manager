import type { AppResult } from "../core/result";
import { CreateUser, UpdateUser, User } from "./user.schemas";

export interface UserRepository {
  lookup(id: number): Promise<AppResult<User>>;
  getall(): Promise<AppResult<User[]>>;
  create(request: CreateUser): Promise<AppResult<User>>;
  update(id: number, request: UpdateUser): Promise<AppResult<User>>;
  delete(id: number): Promise<AppResult>;
}
