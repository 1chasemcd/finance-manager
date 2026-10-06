import { eq, or } from "drizzle-orm";
import { users } from "../db/schema";
import type { Db } from "../db/client";
import type { UserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";
import type { NotFound, Conflict } from "../core/errors";
import { conflict, notFound } from "../core/errors";
import { invariant, ok, type Result } from "@finapp/result";

export class UserDrizzleRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  async getBySubject(subject: string): Promise<Result<User, NotFound>> {
    const [ent] = await this.db.select().from(users).where(eq(users.subject, subject)).limit(1);
    if (ent) return ok(ent);
    return notFound("user", subject);
  }

  async getByEmail(email: string): Promise<Result<User, NotFound>> {
    const [ent] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (ent) return ok(ent);
    return notFound("user", email);
  }

  getByGroup(groupId: number): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.groupId, groupId));
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

  async updateUser(id: number, input: UpdateUserInput): Promise<Result<User, NotFound>> {
    const [newRow] = await this.db.update(users).set(input).where(eq(users.id, id)).returning();
    if (!newRow) return notFound("user", id.toString());
    return ok(newRow);
  }
}
