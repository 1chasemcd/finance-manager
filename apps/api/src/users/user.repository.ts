import type { Result } from "@finapp/result";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";

export interface UserRepository {
  bySubject(subject: string): Promise<User | null>;
  byEmail(email: string): Promise<User | null>;
  byGroup(groupId: number): Promise<User[]>;
  byGroupAndEmail(groupId: number, email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<Result<User>>;
  update(id: number, input: UpdateUserInput): Promise<Result>;
}
