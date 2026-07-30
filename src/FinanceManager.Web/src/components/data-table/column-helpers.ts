import type { ColumnDef } from "@tanstack/react-table"

export function currencyColumn<TData>(
  accessorKey: keyof TData & string,
  header: string
): ColumnDef<TData> {
  return {
    accessorKey,
    header: header,
    cell: ({ getValue }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(getValue())),
    meta: {
      align: "right",
    },
  }
}

export function dateonlyColumn<TData>(
  accessorKey: keyof TData & string,
  header: string
): ColumnDef<TData> {
  return {
    accessorKey,
    header: header,
    cell: ({ getValue }) =>
      new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }).format(new Date(getValue<string | Date>())),
    meta: {
      align: "right",
    },
  }
}
