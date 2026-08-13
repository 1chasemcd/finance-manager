import type { FinancialTransactionResponse } from "@/lib/api/generated";

function getData(): FinancialTransactionResponse[] {
  // Fetch data from your API here.
  return [
    {
      id: 1,
      amount: 100.0,
      date: new Date(2017, 1, 3, 10, 3, 15),
      summary: "City Market purchase",
      financialAccountName: "Chase Wells Fargo Credit",
      financialAccountId: 1,
      spendingCategoryName: "Groceries",
      spendingCategoryId: 2,
    },
    {
      id: 2,
      amount: 20.0,
      date: new Date(2017, 1, 6, 11, 2, 5),
      summary: "Simply Automotive",
      financialAccountName: "Hannah Discover Credit",
      financialAccountId: 2,
      spendingCategoryName: "Automotive",
      spendingCategoryId: 1,
    },
    {
      id: 3,
      amount: 230.0,
      date: new Date(2017, 1, 11, 1, 5, 15),
      summary: "United Airlines flight purchase",
      financialAccountName: "Chase Wells Fargo Credit",
      financialAccountId: 1,
      spendingCategoryName: "Travel",
      spendingCategoryId: 3,
    },
    {
      id: 4,
      amount: 300.0,
      date: new Date(2017, 1, 12, 2, 3, 55),
      summary: "Valley View Hospital Bill",
      financialAccountName: "Hannah CB Credit",
      financialAccountId: 0,
      spendingCategoryName: "Health",
      spendingCategoryId: 4,
    },
  ];
}

export default function Transactions() {
  const _ = getData();

  return <>Transactions Works!</>;
}
