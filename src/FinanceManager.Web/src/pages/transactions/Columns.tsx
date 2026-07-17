import { type ColumnDef } from "@tanstack/react-table"
import { type FinancialTransactionResponse } from "@/lib/api/generated/types.gen"

export const columns: ColumnDef<FinancialTransactionResponse>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "summary",
    header: "Summary",
  },
  {
    accessorKey: "spendingCategoryName",
    header: "Category",
  },
  {
    accessorKey: "financialAccountName",
    header: "Account",
  },
]
