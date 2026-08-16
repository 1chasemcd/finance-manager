import {
  useMutation,
  useQuery,
  useQueryClient,
  type DataTag,
  type QueryKey,
  type UnusedSkipTokenOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { Button, Drawer, Flex, Popconfirm, Space, Table } from "antd";
import type { TablePaginationConfig } from "antd";

import { useMemo, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useTableHeight } from "@/hooks/useTableHeight";
import type { Options } from "@/lib/generated";
import { Route, Routes } from "react-router";
import "./AppTablePage.css";
import { LinkButton } from "../LinkButton";
import { Pencil, Trash } from "lucide-react";

type SearchEntityData = {
  query?: {
    take?: number;
    skip?: number;
  };
  url: string;
};

type LookupEntityData = {
  path: {
    id: number;
  };
  url: string;
};

type DeleteEntityData = LookupEntityData;

type EntityResponse = {
  id: number;
};

type SearchResponse<TEntityResponse extends EntityResponse> = {
  results: TEntityResponse[];
  total?: number;
};

type SearchEntityOptionsResult<
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
  searchEntityOptions: (
    options?: Options<SearchEntityData>,
  ) => SearchEntityOptionsResult<TEntityResponse, TSearchResponse>;
  deleteEntityMutation?: (
    options?: Partial<Options<DeleteEntityData>>,
  ) => UseMutationOptions<void, any, Options<DeleteEntityData>>;
  queryKeysToInvalidate?: (((id: number) => QueryKey) | (() => QueryKey))[];
  FilterForm?: React.ComponentType;
};

type TableViewProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = TableProps<TEntityResponse, TSearchResponse> & {
  canAdd: boolean;
  canEdit: boolean;
};

type TablePageProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = TableProps<TEntityResponse, TSearchResponse> & {
  EditForm?: React.ComponentType;
  AddForm?: React.ComponentType;
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
  const queryClient = useQueryClient();
  const { data, isPending, isFetching } = useQuery({
    ...props.searchEntityOptions({
      query: {
        take: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      },
    }),
    placeholderData: (previousData) => previousData,
  });

  const deleteEntity =
    props.deleteEntityMutation &&
    useMutation({
      ...props.deleteEntityMutation(),
      onSuccess: (_, data) => {
        props.queryKeysToInvalidate?.forEach((queryKey) => {
          queryClient.invalidateQueries({
            queryKey: queryKey(data.path.id),
          });
        });
      },
    });

  const columns = useMemo(() => {
    const columns = [...props.columns];
    columns.forEach((x) => {
      if (x.ellipsis != false) x.ellipsis = true;
    });

    if (props.canEdit || deleteEntity)
      columns.push({
        title: "",
        key: "$actions",
        width: props.canEdit && deleteEntity ? 88 : 48,
        render: (_: any, record: TEntityResponse) => (
          <Space size="small">
            {props.canEdit && (
              <LinkButton
                type="text"
                to={`./${record.id}/edit`}
                icon={<Pencil size={16} absoluteStrokeWidth />}
              />
            )}
            {deleteEntity && (
              <Popconfirm
                title="Delete this record?"
                onConfirm={() =>
                  deleteEntity.mutate({ path: { id: record.id } })
                }
                okText="Confirm"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<Trash size={16} absoluteStrokeWidth />}
                />
              </Popconfirm>
            )}
          </Space>
        ),
      });

    return columns;
  }, [props.columns, props.canEdit, deleteEntity]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current ?? 1,
      pageSize: newPagination.pageSize ?? 50,
    });
  };

  return (
    <div className="page">
      <Flex justify="space-between" className="header">
        <Title level={2} style={{ margin: 0 }}>
          {props.title}
        </Title>
        <Flex align="center" gap="medium">
          {props.FilterForm && (
            <Button onClick={() => setFiltersOpen(true)}>Filter</Button>
          )}
          {props.canAdd && (
            <LinkButton to="./add" type="primary">
              Add
            </LinkButton>
          )}
        </Flex>
      </Flex>
      {props.FilterForm && (
        <Drawer
          title="Filter Results"
          onClose={() => setFiltersOpen(false)}
          open={filtersOpen}

          extra={<Button>Clear Filters</Button>}
        ></Drawer>
      )}
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

export default function AppTablePage<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
>({
  EditForm,
  AddForm,
  ...props
}: TablePageProps<TEntityResponse, TSearchResponse>) {
  return (
    <Routes>
      <Route
        index
        element={
          <AppTableView
            {...props}
            canEdit={Boolean(EditForm)}
            canAdd={Boolean(AddForm)}
          />
        }
      />
      {EditForm && <Route path=":id/edit" element={<EditForm />} />}
      {AddForm && <Route path="add" element={<AddForm />} />}
    </Routes>
  );
}
