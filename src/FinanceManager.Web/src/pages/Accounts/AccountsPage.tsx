import AppTablePage from "@/components/AppTablePage/AppTablePage";
import type { FinancialAccountResponse } from "@/lib/generated";
import { searchAccountOptions } from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";

const getColumns: () => ColumnsType<FinancialAccountResponse> = () => [
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
];

export default function AccountsPage() {
  return (
    <AppTablePage
      title="Accounts"
      columns={getColumns()}
      searchRequestOptions={searchAccountOptions}
    />
  );
}
