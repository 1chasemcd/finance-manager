import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
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
  total: number;
};

type SearchEntityOptions<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = (
  options?: Options<SearchEntityData>,
) => UseQueryOptions<TSearchResponse, string, TSearchResponse, any>;

type DeleteEntityMutation = (
  options?: Partial<Options<DeleteEntityData>>,
) => UseMutationOptions<void, string, Options<DeleteEntityData>>;

type TableProps<
  TEntityResponse extends EntityResponse,
  TSearchResponse extends SearchResponse<TEntityResponse>,
> = {
  title: string;
  columns: ColumnsType<TEntityResponse>;
  searchEntityOptions: SearchEntityOptions<TEntityResponse, TSearchResponse>;
  deleteEntityMutation?: DeleteEntityMutation;
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

function DeleteButton({
  id,
  deleteEntityMutation,
  queryKeyToInvalidate,
}: {
  id: number;
  deleteEntityMutation: DeleteEntityMutation;
  queryKeyToInvalidate: QueryKey;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...deleteEntityMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidate,
      });
    },
  });

  return (
    <Popconfirm
      title="Delete this record?"
      onConfirm={() => mutation.mutate({ path: { id } })}
      okText="Confirm"
      okButtonProps={{ danger: true }}
    >
      <Button
        type="text"
        loading={mutation.isPending}
        icon={<Trash size={16} absoluteStrokeWidth />}
      />
    </Popconfirm>
  );
}

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
  const { data, isPending, isFetching } = useQuery({
    ...props.searchEntityOptions({
      query: {
        take: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      },
    }),
    placeholderData: (previousData) => previousData,
  });

  const searchQueryKey = useMemo(
    () => props.searchEntityOptions().queryKey,
    [props.searchEntityOptions],
  );

  const columns = useMemo(() => {
    const columns: ColumnsType<TEntityResponse> = props.columns.map(
      (column) => ({
        ...column,
        ellipsis: column.ellipsis !== false,
      }),
    );

    const canEdit = props.canEdit;
    const canDelete = Boolean(props.deleteEntityMutation);

    if (canEdit || canDelete)
      columns.push({
        title: "",
        key: "$actions",
        width: canEdit && canDelete ? 88 : 48,
        render: (_, record) => (
          <Space size="small">
            {canEdit && (
              <LinkButton
                type="text"
                to={`./${record.id}/edit`}
                icon={<Pencil size={16} />}
              />
            )}
            {canDelete && (
              <DeleteButton
                id={record.id}
                deleteEntityMutation={props.deleteEntityMutation!}
                queryKeyToInvalidate={searchQueryKey}
              />
            )}
          </Space>
        ),
      });

    return columns;
  }, [
    props.columns,
    props.canEdit,
    props.deleteEntityMutation,
    searchQueryKey,
  ]);

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
        <Title level={4} style={{ margin: 0 }}>
          {props.title}
        </Title>
        <Flex align="center" gap="middle">
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
        >
          <props.FilterForm />
        </Drawer>
      )}
      <div ref={contentRef} className="table-container">
        <Table<TEntityResponse>
          size="small"
          // className="table"
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
