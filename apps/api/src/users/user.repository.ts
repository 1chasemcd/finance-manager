import type { Result } from "@finapp/result";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";

export interface UserRepository {
  bySubject(subject: string): Promise<User | undefined>;
  byEmail(email: string): Promise<User | undefined>;
  byGroupAndEmail(groupId: number, email: string): Promise<User | undefined>;
  byGroup(groupId: number): Promise<User[]>;
  create(input: CreateUserInput): Promise<Result<User>>;
  update(id: number, input: UpdateUserInput): Promise<Result>;
}
