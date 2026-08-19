import EntityTable from "@/components/EntityTable/EntityTable";
import EntityTableCreateAction from "@/components/EntityTable/EntityTableCreateAction";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { CategoryPatternResponse } from "@/lib/generated";
import {
  deleteCategoryPatternMutation,
  searchCategoryPatternOptions,
  searchCategoryPatternQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function CategoryPatterns() {
  const columns = useMemo<ColumnsType<CategoryPatternResponse>>(
    () => [
      {
        title: "Pattern",
        dataIndex: "pattern",
        key: "pattern",
      },
      {
        title: "Category",
        dataIndex: "transactionCategoryName",
        key: "transactionCategoryName",
      },
    ],
    [],
  );
  const { query, updateQuery, useQueryResult } = useQueryForTable(
    searchCategoryPatternOptions,
  );

  const editAction = useEditActionForTable();
  const deleteAction = useDeleteActionForTable(deleteCategoryPatternMutation, [
    searchCategoryPatternQueryKey(),
  ]);

  return (
    <EntityTable
      title="Category Patterns"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      tableActions={[<EntityTableCreateAction />]}
      rowActions={[editAction, deleteAction]}
    />
  );
}
