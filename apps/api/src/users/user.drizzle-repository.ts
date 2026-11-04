import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema";
import type { Db } from "@/db/client";
import type { UserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";
import { err, ok, type Result } from "@finapp/result";

export class UserDrizzleRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  async bySubject(subject: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.subject, subject)).limit(1);
    return row ?? null;
  }

  async byEmail(email: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  byGroup(groupId: number): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.groupId, groupId));
  }

  async byGroupAndEmail(groupId: number, email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.groupId, groupId)))
      .limit(1);
    return row ?? null;
  }

  async create(input: CreateUserInput): Promise<Result<User>> {
    const [newRow] = await this.db.insert(users).values(input).returning();
    if (!newRow) return err();
    return ok(newRow);
  }

  async update(id: number, input: UpdateUserInput): Promise<Result> {
    const result = await this.db.update(users).set(input).where(eq(users.id, id));
    if (result.meta.changes != 1) return err();
    return ok();
  }
}
