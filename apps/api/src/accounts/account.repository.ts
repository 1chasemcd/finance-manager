import type { Account } from "./account.types";

export interface AccountRepository {
  createAccount(): Promise<Account>;
}
