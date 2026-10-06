import { ok, type Result } from "@finapp/result";
import { conflict, notFound, type Conflict, type NotFound } from "../core/errors";
import type { GroupInvite } from "./group-invites.types";
import type { GroupInviteRepository } from "./group-invite.repository";
import type { Db } from "../db/client";
import { groupInvites } from "../db/schema";
import { and, eq, lt } from "drizzle-orm";

export class GroupInviteDrizzleRepository implements GroupInviteRepository {
  constructor(private readonly db: Db) {}

  async createInvite(groupId: number, userId: number): Promise<Result<void, Conflict>> {
    const existing = await this.db
      .select({ id: groupInvites.id })
      .from(groupInvites)
      .where(and(eq(groupInvites.groupId, groupId), eq(groupInvites.userId, userId)));
    if (existing.length > 0) return conflict();

    await this.db.insert(groupInvites).values({ groupId, userId });
    return ok();
  }
  async getInvitesByUser(userId: number): Promise<GroupInvite[]> {
    return await this.db.select().from(groupInvites).where(eq(groupInvites.userId, userId));
  }
  async deleteInvite(id: number): Promise<Result<void, NotFound>> {
    const res = await this.db.delete(groupInvites).where(eq(groupInvites.id, id));
    if (res.meta.changes !== 1) return notFound("groupInvite", id);
    return ok();
  }
  async deleteInvitesOlderThan(oldestDate: Date): Promise<void> {
    await this.db.delete(groupInvites).where(lt(groupInvites.createdAt, oldestDate));
  }
}
