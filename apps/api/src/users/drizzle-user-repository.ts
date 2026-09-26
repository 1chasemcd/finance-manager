import { eq } from "drizzle-orm";
import { users } from "../db/schema/users";
import type { Db } from "../db/client";
import type { UserRepository } from "./user.repository";
import type { Result } from "@finance-manager/result";
import { notFound, ok } from "@finance-manager/result";
import type { User } from "./user.schemas";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async lookup(id: number): Promise<Result<User>> {
    const [ent] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (ent) return ok(ent);
    return notFound();
  }
}
