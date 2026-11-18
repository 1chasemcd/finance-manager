import type { Result } from "@finapp/result";
import type { CreateTransactionInput, Transaction } from "./transaction.types";
import type { SearchTransactionsRequest } from "@finapp/schema";

export interface TransactionRepository {
  search(groupId: number, request: SearchTransactionsRequest): Promise<Transaction[]>;
  count(groupId: number): Promise<number>;
  byId(groupId: number, id: number): Promise<Transaction | undefined>;
  create(groupId: number, input: CreateTransactionInput): Promise<Result<Transaction>>;
}
