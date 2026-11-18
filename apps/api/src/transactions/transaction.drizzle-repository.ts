import { err, ok, type Result } from "@finapp/result";
import type {
  CreateTransactionInput,
  SearchTransactionsInput,
  Transaction,
} from "./transaction.types";
import type { Db } from "@/db/client";
import { transactions } from "@/db/schema";
import { eq, getColumns } from "drizzle-orm";
import type { TransactionRepository } from "./transaction.repository";
import { handleSqliteConstraintError } from "@/db/errors";

export class TransactionDrizzleRepository implements TransactionRepository {
  constructor(private readonly db: Db) {}

  byId(groupId: number, id: number): Promise<Transaction | undefined> {
    return this.db.query.transactions.findFirst({
      columns: { groupId: false },
      where: { groupId, id },
    });
  }

  count(groupId: number): Promise<number> {
    return this.db.$count(transactions, eq(transactions.groupId, groupId));
  }

  search(groupId: number, input: SearchTransactionsInput): Promise<Transaction[]> {
    const {
      page = 0,
      limit = 50,
      minDate,
      maxDate,
      minAmount,
      maxAmount,
      categoryId,
      sourceId,
    } = input;

    return this.db.query.transactions.findMany({
      columns: {
        groupId: false,
      },
      where: {
        groupId,
        date: {
          ...(minDate !== undefined ? { gte: minDate } : {}),
          ...(maxDate !== undefined ? { lte: maxDate } : {}),
        },
        amount: {
          ...(minAmount !== undefined ? { gte: minAmount } : {}),
          ...(maxAmount !== undefined ? { lte: maxAmount } : {}),
        },
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(sourceId !== undefined ? { sourceId } : {}),
      },
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
      limit,
      offset: page * limit,
    });
  }

  async create(groupId: number, input: CreateTransactionInput): Promise<Result<Transaction>> {
    const { groupId: _, ...returningColumns } = getColumns(transactions);

    const result = await handleSqliteConstraintError(() =>
      this.db
        .insert(transactions)
        .values({ groupId, ...input })
        .returning(returningColumns),
    );

    if (result.isErr || !result.data[0]) return err();
    return ok(result.data[0]);
  }
}
