import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import type { Db } from "../client";
import type { UserRepository } from "../../users/user.repository";
import type { CreateUser, UpdateUser, User } from "../../users/user.schemas";
import { AppResult, conflict, notFound } from "../../core/result";
import { ok } from "@finance-manager/result";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async lookup(id: number): Promise<AppResult<User>> {
    const [ent] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (ent) return ok(ent);
    return notFound("user", id);
  }

  async getall(): Promise<AppResult<User[]>> {
    return ok(await this.db.select().from(users));
  }

  async create(request: CreateUser): Promise<AppResult<User>> {
    const [newRow] = await this.db.insert(users).values(request).returning();
    if (newRow) return ok(newRow);
    return conflict();
  }

  async update(id: number, request: UpdateUser): Promise<AppResult<User>> {
    const [updated] = await this.db
      .update(users)
      .set(request)
      .where(eq(users.id, id))
      .returning();
    if (!updated) return notFound("user", id);
    return ok(updated);
  }

  async delete(id: number): Promise<AppResult> {
    const res = await this.db.delete(users).where(eq(users.id, id));
    if (res.rowsAffected > 0) return ok();
    return notFound("user", id);
  }
}
