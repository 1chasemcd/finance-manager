import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema";
import type { Db } from "@/db/client";
import type { UserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types";
import { err, ok, type Result } from "@finapp/result";
import { handleSqliteConstraintError } from "@/db/errors";

export class UserDrizzleRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  async bySubject(subject: string): Promise<User | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.subject, subject)).limit(1);
    return row;
  }

  async byEmail(email: string): Promise<User | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row;
  }
  async byGroupAndEmail(groupId: number, email: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.groupId, groupId)))
      .limit(1);
    return row;
  }

  byGroup(groupId: number): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.groupId, groupId));
  }

  async create(input: CreateUserInput): Promise<Result<User>> {
    const result = await handleSqliteConstraintError(() =>
      this.db.insert(users).values(input).returning(),
    );
    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }

  async update(id: number, input: UpdateUserInput): Promise<Result> {
    const result = await handleSqliteConstraintError(() =>
      this.db.update(users).set(input).where(eq(users.id, id)),
    );
    if (result.isErr || result.data.meta.changes === 0) return err();
    return ok();
  }
}
