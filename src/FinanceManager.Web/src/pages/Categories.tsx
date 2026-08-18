import EntityTable from "@/components/EntityTable/EntityTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { TransactionCategoryResponse } from "@/lib/generated";
import { searchTransactionCategoryOptions } from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function Categories() {
  const columns = useMemo<ColumnsType<TransactionCategoryResponse>>(
    () => [
      {
        title: "Category Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
      },
    ],
    [],
  );
  const { query, updateQuery, useQueryResult } = useQueryForTable(
    searchTransactionCategoryOptions,
  );

  return (
    <EntityTable
      title="Categories"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
    />
  );
}
