import type { FinancialTransactionResponse } from "@/lib/generated";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Flex, Table } from "antd";
import type { TablePaginationConfig } from "antd";

import { searchTransactionOptions } from "@/lib/generated/@tanstack/react-query.gen";
import { useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import "./TransactionsPage.css";
import { useTableHeight } from "@/hooks/useTableHeight";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef, 39);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isPending, isFetching } = useQuery({
    ...searchTransactionOptions({
      query: {
        take: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      },
    }),
    placeholderData: (previousData) => previousData,
  });

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current ?? 1,
      pageSize: newPagination.pageSize ?? 50,
    });
  };

  const columns = getColumns();
  // columns.push({
  //   title: "",
  //   key: "actions",
  //   render: (_: any, record: FinancialTransactionResponse) => (
  //     <Space>
  //       <Button
  //         type="text"
  //         icon={<Pencil size={16} absoluteStrokeWidth={true} />}
  //         onClick={() => navigate(`/transactions/${record.id}/edit`)}
  //       />

  //       <Popconfirm
  //         title="Delete this record?"
  //         onConfirm={() => console.log("delete")}
  //         okText="Yes"
  //         cancelText="No"
  //       >
  //         <Button
  //           type="text"
  //           icon={<Trash size={16} absoluteStrokeWidth={true} />}
  //         />
  //       </Popconfirm>
  //     </Space>
  //   ),
  // });

  return (
    <div className="page">
      <Flex justify="space-between" className="header">
        <Title level={2} style={{ margin: 0 }}>
          Transactions
        </Title>
        <Flex align="center" gap="medium">
          <Button onClick={() => setFiltersOpen(true)}>Filter</Button>
          <Button type="primary">Add Record</Button>
        </Flex>
      </Flex>
      <Drawer
        title="Filter Results"
        onClose={() => setFiltersOpen(false)}
        open={filtersOpen}

        extra={<Button>Clear Filters</Button>}
      ></Drawer>
      <div
        ref={contentRef}
        className="table-container"
        style={{ height: tableHeight }}
      >
        <Table<FinancialTransactionResponse>
          size="small"
          className="table"
          rowKey={(record) => record.id}
          tableLayout="fixed"
          dataSource={data?.results ?? []}
          loading={isPending || isFetching}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          scroll={{ y: tableHeight }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
