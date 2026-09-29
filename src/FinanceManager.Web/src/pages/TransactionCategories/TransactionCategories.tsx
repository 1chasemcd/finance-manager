import EntityTable from "@/components/EntityTable/EntityTable";
import EntityTableCreateAction from "@/components/EntityTable/EntityTableCreateAction";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { TransactionCategoryResponse } from "@/lib/generated";
import {
  deleteTransactionCategoryMutation,
  searchTransactionCategoryOptions,
  searchTransactionCategoryQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function TransactionCategories() {
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

  const editAction = useEditActionForTable();
  const deleteAction = useDeleteActionForTable(
    deleteTransactionCategoryMutation,
    [searchTransactionCategoryQueryKey()],
  );

  return (
    <EntityTable
      title="Categories"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      tableActions={[<EntityTableCreateAction />]}
      rowActions={[editAction, deleteAction]}
    />
  );
}
