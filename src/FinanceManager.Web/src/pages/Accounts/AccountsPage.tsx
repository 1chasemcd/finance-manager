import AppTablePage from "@/components/AppTablePage/AppTablePage";
import type { FinancialAccountResponse } from "@/lib/generated";
import {
  deleteAccountMutation,
  lookupAccountQueryKey,
  searchAccountOptions,
  searchAccountQueryKey,
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

  const queryKeysToInvalidate = [
    (id: number) => lookupAccountQueryKey({ path: { id } }),
    () => searchAccountQueryKey(),
  ];

  return (
    <AppTablePage
      title="Accounts"
      columns={columns}
      searchEntityOptions={searchAccountOptions}
      deleteEntityMutation={deleteAccountMutation}
      queryKeysToInvalidate={queryKeysToInvalidate}
      AddForm={AccountsEditPage}
      EditForm={AccountsEditPage}
    />
  );
}
