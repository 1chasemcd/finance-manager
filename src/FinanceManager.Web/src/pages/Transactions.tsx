import type { FinancialTransactionResponse } from "@/lib/api/generated";
import { useQuery } from "@tanstack/react-query";
import { Button, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getApiFinancialtransactionsByIdOptions } from "@/lib/api/generated/@tanstack/react-query.gen";

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
  const navigate = useNavigate();
  const columns: ColumnsType<FinancialTransactionResponse> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
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
  ];
  columns.push({
    title: "",
    key: "actions",
    render: (_: any, record: FinancialTransactionResponse) => (
      <Space>
        <Button
          type="text"
          icon={<Pencil size={16} absoluteStrokeWidth={true} />}
          onClick={() => navigate(`/transactions/${record.id}/edit`)}
        />

        <Popconfirm
          title="Delete this record?"
          onConfirm={() => console.log("delete")}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            icon={<Trash size={16} absoluteStrokeWidth={true} />}
          />
        </Popconfirm>
      </Space>
    ),
  });
  let query = useQuery(
    getApiFinancialtransactionsByIdOptions({
      path: {
        id: 1,
      },
    }),
  );

  return (
    <Table
      rowKey={(record) => record.id}
      dataSource={getData()}
      columns={columns}
    />
  );
}
