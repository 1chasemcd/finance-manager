import {
  useQuery,
  type DataTag,
  type UnusedSkipTokenOptions,
} from "@tanstack/react-query";
import { Button, Drawer, Flex, Table } from "antd";
import type { TablePaginationConfig } from "antd";

import { useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useTableHeight } from "@/hooks/useTableHeight";
import type { Options } from "@/lib/generated";
import { Route, Routes } from "react-router";

type SearchEntityData = {
  query?: {
    take?: number;
    skip?: number;
  };
  url: string;
};

type EntityResponse = {
  id: number;
};

type SearchResponse<TEntityResponse extends EntityResponse> = {
  results: TEntityResponse[];
  total?: number;
};

type SearchRequestOptionsResult<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = UnusedSkipTokenOptions<TSearchResponse, any, TSearchResponse, any> & {
  queryKey: DataTag<any, TSearchResponse, any>;
};

type TableProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = {
  title: string;
  columns: ColumnsType<TEntityResponse>;
  searchRequestOptions: (
    options?: Options<SearchEntityData>,
  ) => SearchRequestOptionsResult<TEntityResponse, TSearchResponse>;
  filterForm?: React.ReactNode;
  editForm?: React.ComponentType;
};

type TableViewProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = TableProps<TEntityResponse, TSearchResponse> & {
  canEdit: boolean;
};

type TablePageProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = TableProps<TEntityResponse, TSearchResponse> & {
  editForm?: React.ComponentType;
};

function AppTableView<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
>(props: TableViewProps<TEntityResponse, TSearchResponse>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef, 39);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isPending, isFetching } = useQuery({
    ...props.searchRequestOptions({
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
          {props.title}
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
        <Table<TEntityResponse>
          size="small"
          className="table"
          rowKey={(record) => record.id}
          tableLayout="fixed"
          dataSource={data?.results ?? []}
          loading={isPending || isFetching}
          columns={props.columns}
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

export default function AppTablePage<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
>({
  editForm: EditForm,
  ...props
}: TablePageProps<TEntityResponse, TSearchResponse>) {
  return (
    <Routes>
      <Route
        index
        element={<AppTableView {...props} canEdit={Boolean(EditForm)} />}
      />
      {EditForm && <Route path=":id/edit" element={<EditForm />} />}
    </Routes>
  );
}
