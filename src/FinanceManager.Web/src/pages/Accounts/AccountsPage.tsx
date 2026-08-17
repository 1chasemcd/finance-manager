import type { FinancialAccountResponse } from "@/lib/generated";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";
import EntityTable from "@/components/EntityTable/EntityTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import {
  deleteAccountMutation,
  searchAccountOptions,
  searchAccountQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";
import EntityTableAddAction from "@/components/EntityTable/EntityTableAddAction";

export default function AccountsPage() {
  const columns = useMemoizedColumns<FinancialAccountResponse>(() => [
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
  ]);

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
      tableActions={[<EntityTableAddAction />]}
    />
  );
}
