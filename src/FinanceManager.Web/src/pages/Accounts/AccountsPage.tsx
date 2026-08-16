import type { FinancialAccountResponse } from "@/lib/generated";
import {
  deleteAccountMutation,
  searchAccountOptions,
} from "@/lib/generated/@tanstack/react-query.gen";
import AccountsEditPage from "./AccountsEditPage";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";
import EntityTablePage from "@/components/EntityTable/EntityTablePage";

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

  return (
    <EntityTablePage
      title="Accounts"
      columns={columns}
      searchEntityOptions={searchAccountOptions}
      deleteEntityMutation={deleteAccountMutation}
      AddForm={AccountsEditPage}
      EditForm={AccountsEditPage}
    />
  );
}
