import type { Result } from "@finapp/result";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";
import type { CreateError, UpdateError } from "@/core/errors";

export interface UserRepository {
  bySubject(subject: string): Promise<User | null>;
  byEmail(email: string): Promise<User | null>;
  byGroup(groupId: number): Promise<User[]>;
  byGroupAndEmail(groupId: number, email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<Result<User, CreateError>>;
  update(id: number, input: UpdateUserInput): Promise<Result<void, UpdateError>>;
}
