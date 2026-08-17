import EntityTable from "@/components/EntityTable/EntityTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { SpendingCategoryResponse } from "@/lib/generated";
import { searchSpendingCategoryOptions } from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function Categories() {
  const columns = useMemo<ColumnsType<SpendingCategoryResponse>>(
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
    searchSpendingCategoryOptions,
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
