import type { Result } from "@finapp/result";
import type { NotFound, Conflict } from "../core/errors";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";

export interface UserRepository {
  getBySubject(subject: string): Promise<Result<User, NotFound>>;
  getByEmail(email: string): Promise<Result<User, NotFound>>;
  getByGroup(groupId: number): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<Result<User, Conflict>>;
  updateUser(id: number, input: UpdateUserInput): Promise<Result<User, NotFound>>;
}
