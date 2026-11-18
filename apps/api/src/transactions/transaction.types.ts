export interface Transaction {
  id: number;
  date: string;
  amount: number;
  summary: string | null;
  categoryId: number;
  sourceId: number;
}

export interface CreateTransactionInput {
  date: string;
  amount: number;
  summary?: string | null | undefined;
  categoryId: number;
  sourceId: number;
}

export interface TransactionList {
  transactions: Transaction[];
  count: number;
}
