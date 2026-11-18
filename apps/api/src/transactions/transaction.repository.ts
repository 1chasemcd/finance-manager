import type { Result } from "@finapp/result";
import type {
  CreateTransactionInput,
  SearchTransactionsInput,
  Transaction,
} from "./transaction.types";

export interface TransactionRepository {
  search(groupId: number, request: SearchTransactionsInput): Promise<Transaction[]>;
  count(groupId: number): Promise<number>;
  byId(groupId: number, id: number): Promise<Transaction | undefined>;
  create(groupId: number, input: CreateTransactionInput): Promise<Result<Transaction>>;
}
