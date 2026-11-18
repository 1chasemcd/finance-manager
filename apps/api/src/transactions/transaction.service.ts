import type { Transaction, TransactionList } from "./transaction.types";
import type { CurrentUser } from "@/identity/current-user";
import type { TransactionRepository } from "./transaction.repository";
import type { SearchTransactionsRequest } from "@finapp/schema";

export class TransactionService {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async search(request: SearchTransactionsRequest): Promise<TransactionList> {
    const { groupId } = this.currentUser.require();
    const transactions = await this.transactions.search(groupId, request);
    const count = await this.transactions.count(groupId);
    return { count, transactions };
  }

  get(id: number): Promise<Transaction | undefined> {
    const { groupId } = this.currentUser.require();
    return this.transactions.byId(groupId, id);
  }
}
