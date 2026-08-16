import type { FinancialTransactionResponse } from "@/lib/generated";
import { searchTransactionOptions } from "@/lib/generated/@tanstack/react-query.gen";
import AppTablePage from "@/components/AppTablePage/AppTablePage";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";
import TransactionsFilterPage from "./TransactionsFilterPage";

export default function TransactionsPage() {
  const columns = useMemoizedColumns<FinancialTransactionResponse>(() => [
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
    },
    {
      title: "Category",
      dataIndex: "spendingCategoryName",
      key: "spendingCategoryName",
    },
  ]);

  return (
    <AppTablePage
      title="Transactions"
      columns={columns}
      searchEntityOptions={searchTransactionOptions}
      FilterForm={TransactionsFilterPage}
    />
  );
}
