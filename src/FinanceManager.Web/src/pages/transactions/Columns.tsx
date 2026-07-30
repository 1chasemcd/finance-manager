import { type ColumnDef } from "@tanstack/react-table"
import { type FinancialTransactionResponse } from "@/lib/api/generated/types.gen"
import {
  currencyColumn,
  dateonlyColumn,
} from "@/components/data-table/column-helpers"

export const columns: ColumnDef<FinancialTransactionResponse>[] = [
  dateonlyColumn("date", "Date"),
  currencyColumn("amount", "Amount"),
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
