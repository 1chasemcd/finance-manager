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

export interface SearchTransactionsInput {
  page?: number | undefined;
  limit?: number | undefined;
  minDate?: string | undefined;
  maxDate?: string | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  categoryId?: number | undefined;
  sourceId?: number | undefined;
}

export interface TransactionList {
  transactions: Transaction[];
  count: number;
}
