import type { Result } from "@finapp/result";
import type { NotFound, Conflict } from "../core/result";
import type { CreateUserInput, User } from "./user.types";

export interface UserRepository {
  findBySubject(subject: string): Promise<Result<User, NotFound>>;
  findByAccount(accountId: number): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<Result<User, Conflict>>;
}
