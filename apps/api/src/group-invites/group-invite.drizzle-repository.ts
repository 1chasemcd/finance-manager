import { err, ok, type Result } from "@finapp/result";
import { type CreateError, type DeleteError } from "@/core/errors";
import type { GroupInvite } from "./group-invites.types";
import type { GroupInviteRepository } from "./group-invite.repository";
import type { Db } from "@/db/client";
import { groupInvites } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

export class GroupInviteDrizzleRepository implements GroupInviteRepository {
  constructor(private readonly db: Db) {}

  async create(groupId: number, userId: number): Promise<Result<GroupInvite, CreateError>> {
    const [newRow] = await this.db.insert(groupInvites).values({ groupId, userId }).returning();
    if (!newRow) return err("CreateError");
    return ok(newRow);
  }
  async byUser(userId: number): Promise<GroupInvite[]> {
    return await this.db.select().from(groupInvites).where(eq(groupInvites.userId, userId));
  }
  async delete(id: number): Promise<Result<void, DeleteError>> {
    const res = await this.db.delete(groupInvites).where(eq(groupInvites.id, id));
    if (res.meta.changes !== 1) return err("DeleteError");
    return ok();
  }
  async deleteExpired(expirationDate: Date): Promise<void> {
    await this.db.delete(groupInvites).where(lt(groupInvites.createdAt, expirationDate));
  }
}
