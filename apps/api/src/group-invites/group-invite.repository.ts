import type { Result } from "@finapp/result";
import type { Conflict, NotFound } from "../core/result";
import type { GroupInvite } from "./group-invites.types";

export interface GroupInviteRepository {
  createInvite(groupId: number, userId: number): Promise<Result<void, Conflict>>;
  getInvitesByUser(userId: number): Promise<GroupInvite[]>;
  deleteInvite(id: number): Promise<Result<void, NotFound>>;
  deleteInvitesOlderThan(oldestDate: Date): Promise<void>;
}
