import type { Options } from "@/lib/generated";
import EntityTable from "./EntityTable";
import EntityTableRouter from "./EntityTableRouter";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useState } from "react";
import { App, Button, Drawer, type MenuProps } from "antd";
import { LinkButton } from "../LinkButton";
import type {
  DeleteEntityData,
  Entity,
  SearchEntityData,
  SearchResponse,
} from "@/lib/types/types";
import { Link } from "react-router";
import type { QueryKey } from "@/lib/generated/@tanstack/react-query.gen";

type SearchEntityOptions<TSearchResponse extends SearchResponse<Entity>> = (
  options?: Options<SearchEntityData>,
) => UseQueryOptions<
  TSearchResponse,
  string,
  TSearchResponse,
  QueryKey<Options<SearchEntityData>>
>;

type DeleteEntityMutation = (
  options?: Partial<Options<DeleteEntityData>>,
) => UseMutationOptions<void, string, Options<DeleteEntityData>>;

type EntityTablePageProps<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
> = {
  title: string;
  columns: ColumnsType<TEntity>;
  searchEntityOptions: SearchEntityOptions<TSearchResponse>;
  deleteEntityMutation?: DeleteEntityMutation;
  FilterForm?: React.ComponentType;
  AddForm?: React.ComponentType;
  EditForm?: React.ComponentType<{ id: number }>;
};

export default function EntityTablePage<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
>({
  AddForm,
  EditForm,
  ...props
}: EntityTablePageProps<TEntity, TSearchResponse>) {
  const { modal } = App.useApp();
  const [query, updateQuery] = useState({ take: 50, skip: 0 });
  const onPaginationChange = (p: TablePaginationConfig) => {
    updateQuery({
      take: p.pageSize ?? 50,
      skip: (p.pageSize ?? 50) * ((p.current ?? 1) - 1),
    });
  };

  const queryResult = useQuery({
    ...props.searchEntityOptions({ query }),
    placeholderData: (previousData) => previousData,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...(props.deleteEntityMutation?.() ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: props.searchEntityOptions().queryKey,
      });
    },
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  let rowActions:
    ((id: number) => NonNullable<MenuProps["items"]>) | undefined = undefined;
  if (EditForm || props.deleteEntityMutation)
    rowActions = (id: number) => {
      const rowActions = [];
      if (EditForm)
        rowActions.push({
          key: "edit",
          label: (
            <Link type="text" to={`./${id}/edit`}>
              Edit
            </Link>
          ),
        });

      if (props.deleteEntityMutation)
        rowActions.push({
          key: "delete",
          label: "Delete",
          onClick: () => {
            modal.confirm({
              title: "Delete this record?",
              content: "This action cannot be undone.",
              okText: "Delete",
              okType: "danger",
              onOk: () => mutation.mutate({ path: { id } }),
            });
          },
          danger: true,
        });
      return rowActions;
    };

  const tableActions: React.ReactNode[] = [];
  if (props.FilterForm)
    tableActions.push(
      <div key="filter_button">
        <Button onClick={() => setFiltersOpen(true)}>Filter</Button>
        <Drawer
          title="Filter Results"
          onClose={() => setFiltersOpen(false)}
          open={filtersOpen}

          extra={<Button>Clear Filters</Button>}
        >
          <props.FilterForm />
        </Drawer>
      </div>,
    );

  if (AddForm)
    tableActions.push(
      <LinkButton key="add_button" to="./add" type="primary">
        Add
      </LinkButton>,
    );

  return (
    <EntityTableRouter
      index={
        <EntityTable
          title={props.title}
          columns={props.columns}
          queryResult={queryResult}
          onPaginationChange={onPaginationChange}
          rowActions={rowActions}
          tableActions={tableActions}
        />
      }
      AddForm={AddForm}
      EditForm={EditForm}
    />
  );
}
