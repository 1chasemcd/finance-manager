import type { FinancialTransactionResponse } from "@/lib/generated";
import { searchTransactionOptions } from "@/lib/generated/@tanstack/react-query.gen";
import TransactionsFilter from "./TransactionsFilter";
import { currencyColumn, dateColumn } from "@/lib/column-formatters";
import useQueryForTable from "@/hooks/useQueryForTable";
import EntityTable from "@/components/EntityTable/EntityTable";
import EntityTableFilterAction from "@/components/EntityTable/EntityTableFilterAction";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function Transactions() {
  const columns = useMemo<ColumnsType<FinancialTransactionResponse>>(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        ...dateColumn,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        ...currencyColumn,
      },
      {
        title: "Summary",
        dataIndex: "summary",
        key: "summary",
        width: "30%",
      },
      {
        title: "Account",
        dataIndex: "financialAccountName",
        key: "financialAccountName",
      },
      {
        title: "Category",
        dataIndex: "spendingCategoryName",
        key: "spendingCategoryName",
      },
    ],
    [],
  );

  const { query, updateQuery, useQueryResult } = useQueryForTable(
    searchTransactionOptions,
  );

  const filterAction = (
    <EntityTableFilterAction
      FilterForm={TransactionsFilter}
      query={query}
      updateQuery={updateQuery}
    />
  );

  return (
    <EntityTable
      title="Transactions"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      tableActions={[filterAction]}
    ></EntityTable>
  );
}
