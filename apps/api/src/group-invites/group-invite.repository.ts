import type { Result } from "@finapp/result";
import type { GroupInvite } from "./group-invites.types";

export interface GroupInviteRepository {
  byUser(userId: number): Promise<GroupInvite[]>;
  create(groupId: number, userId: number): Promise<Result<GroupInvite>>;
  delete(id: number): Promise<Result>;
  deleteExpired(expirationDate: Date): Promise<void>;
}
