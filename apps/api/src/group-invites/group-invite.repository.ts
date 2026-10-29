import type { Result } from "@finapp/result";
import type { GroupInvite } from "./group-invites.types";
import type { CreateError, DeleteError } from "@/core/errors";

export interface GroupInviteRepository {
  byUser(userId: number): Promise<GroupInvite[]>;
  create(groupId: number, userId: number): Promise<Result<GroupInvite, CreateError>>;
  delete(id: number): Promise<Result<void, DeleteError>>;
  deleteExpired(expirationDate: Date): Promise<void>;
}
