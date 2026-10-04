import type { Db } from "../client";
import { invariant } from "@finapp/result";
import type { AccountRepository } from "../../accounts/account.repository";
import type { Account } from "../../accounts/account.types";
import { accounts } from "../schema/accounts";

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private readonly db: Db) {}
  async createAccount(): Promise<Account> {
    const [newRow] = await this.db.insert(accounts).values({}).returning();
    invariant(newRow, "Expected new account to be created.");

    return newRow;
  }
}
