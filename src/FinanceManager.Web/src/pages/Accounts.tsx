import type { FinancialAccountResponse } from "@/lib/generated";
import EntityTable from "@/components/EntityTable/EntityTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import {
  deleteAccountMutation,
  searchAccountOptions,
  searchAccountQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";
import EntityTableCreateAction from "@/components/EntityTable/EntityTableCreateAction";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function Accounts() {
  const columns = useMemo<ColumnsType<FinancialAccountResponse>>(
    () => [
      {
        title: "Account Name",
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

  const { query, updateQuery, useQueryResult } =
    useQueryForTable(searchAccountOptions);
  const editAction = useEditActionForTable();
  const deleteAction = useDeleteActionForTable(deleteAccountMutation, [
    searchAccountQueryKey(),
  ]);

  return (
    <EntityTable
      title="Accounts"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      rowActions={[editAction, deleteAction]}
      tableActions={[<EntityTableCreateAction />]}
    />
  );
}
