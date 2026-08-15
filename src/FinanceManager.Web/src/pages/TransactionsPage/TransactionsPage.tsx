import type { FinancialTransactionResponse } from "@/lib/generated";

import { searchTransactionOptions } from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import AppTablePage from "@/components/AppTablePage/AppTablePage";

const getColumns: () => ColumnsType<FinancialTransactionResponse> = () => [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (value: Date) => value.toLocaleDateString(),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Summary",
    dataIndex: "summary",
    key: "summary",
    width: "30%",
  },
  {
    title: "Account",
    dataIndex: "financialAccountName",
    key: "financialAccountName",
    ellipsis: true,
  },
  {
    title: "Category",
    dataIndex: "spendingCategoryName",
    key: "spendingCategoryName",
  },
];

export default function TransactionsPage() {
  return (
    <AppTablePage
      title="Transactions"
      columns={getColumns()}
      searchRequestOptions={searchTransactionOptions}
    />
  );
}
