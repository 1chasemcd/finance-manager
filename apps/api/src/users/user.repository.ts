import { User } from "./user.schemas";
import { Result } from "@finance-manager/result";

export interface UserRepository {
  lookup(id: number): Promise<Result<User>>;
  // list(): Promise<Result<User[]>>;
  // create(request: CreateUser): Promise<Result<User>>;
  // update(request: UpdateUser): Promise<Result<User>>;
}
