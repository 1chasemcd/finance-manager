import AppTablePage from "@/components/AppTablePage/AppTablePage";
import type { FinancialAccountResponse } from "@/lib/generated";
import {
  deleteAccountMutation,
  searchAccountOptions,
} from "@/lib/generated/@tanstack/react-query.gen";
import AccountsEditPage from "./AccountsEditPage";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";

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
    <AppTablePage
      title="Accounts"
      columns={columns}
      searchRequestOptions={searchAccountOptions}
      deleteEntityMutation={deleteAccountMutation}
      AddForm={AccountsEditPage}
      EditForm={AccountsEditPage}
    />
  );
}
