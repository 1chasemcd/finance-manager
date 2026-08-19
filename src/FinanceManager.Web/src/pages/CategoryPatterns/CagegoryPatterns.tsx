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
import { theme } from "antd";

export default function CategoryPatterns() {
  const { token } = theme.useToken();

  const columns = useMemo<ColumnsType<CategoryPatternResponse>>(
    () => [
      {
        title: "Pattern",
        dataIndex: "pattern",
        key: "pattern",
        render: (value) => (
          <span
            style={{
              fontFamily: "monospace",
              backgroundColor: token.colorFillTertiary,
              padding: 4,
              borderRadius: 4,
            }}
          >
            {value}
          </span>
        ),
      },
      {
        title: "Category",
        dataIndex: "transactionCategoryName",
        key: "transactionCategoryName",
      },
    ],
    [token],
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
