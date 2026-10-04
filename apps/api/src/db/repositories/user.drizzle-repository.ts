import { eq, or } from "drizzle-orm";
import { users } from "../schema";
import type { Db } from "../client";
import type { UserRepository } from "../../users/user.repository";
import type { CreateUserInput, User } from "../../users/user.types";
import type { NotFound, Conflict } from "../../core/result";
import { conflict, notFound } from "../../core/result";
import { invariant, ok, type Result } from "@finapp/result";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  async findBySubject(subject: string): Promise<Result<User, NotFound>> {
    const [ent] = await this.db.select().from(users).where(eq(users.subject, subject)).limit(1);
    if (ent) return ok(ent);
    return notFound("user", subject);
  }

  findByAccount(accountId: number): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.accountId, accountId));
  }
  async createUser(input: CreateUserInput): Promise<Result<User, Conflict>> {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, input.email), eq(users.subject, input.subject)))
      .limit(1);
    if (existing) return conflict();

    const [newRow] = await this.db.insert(users).values(input).returning();

    invariant(newRow, "Expected new user to be created.");

    return ok(newRow);
  }
}
