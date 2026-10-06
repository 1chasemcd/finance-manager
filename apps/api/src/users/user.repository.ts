import type { Result } from "@finapp/result";
import type { NotFound, Conflict } from "../core/errors";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";

export interface UserRepository {
  findBySubject(subject: string): Promise<Result<User, NotFound>>;
  findByEmail(email: string): Promise<Result<User, NotFound>>;
  findByGroup(groupId: number): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<Result<User, Conflict>>;
  updateUser(id: number, input: UpdateUserInput): Promise<Result<User, NotFound>>;
}
