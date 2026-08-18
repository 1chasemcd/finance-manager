import type { TransactionSourceResponse } from "@/lib/generated";
import EntityTable from "@/components/EntityTable/EntityTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import EntityTableCreateAction from "@/components/EntityTable/EntityTableCreateAction";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import {
  deleteTransactionSourceMutation,
  searchTransactionSourceOptions,
  searchTransactionSourceQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";

export default function TransactionSources() {
  const columns = useMemo<ColumnsType<TransactionSourceResponse>>(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Owner",
        dataIndex: "ownerName",
        key: "ownerName",
      },
    ],
    [],
  );

  const { query, updateQuery, useQueryResult } = useQueryForTable(
    searchTransactionSourceOptions,
  );
  const editAction = useEditActionForTable();
  const deleteAction = useDeleteActionForTable(
    deleteTransactionSourceMutation,
    [searchTransactionSourceQueryKey()],
  );

  return (
    <EntityTable
      title="Transaction Sources"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      rowActions={[editAction, deleteAction]}
      tableActions={[<EntityTableCreateAction />]}
    />
  );
}
