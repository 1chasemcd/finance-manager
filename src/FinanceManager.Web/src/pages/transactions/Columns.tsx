import { type ColumnDef } from "@tanstack/react-table"
import { type FinancialTransactionResponse } from "@/lib/api/generated/types.gen"

export const columns: ColumnDef<FinancialTransactionResponse>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]
