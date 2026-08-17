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
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import {
  App,
  Button,
  Drawer,
  Form,
  Space,
  type FormInstance,
  type MenuProps,
} from "antd";
import { LinkButton } from "../LinkButton";
import type {
  DeleteEntityData,
  Entity,
  SearchEntityData,
  SearchEntityQuery,
  SearchResponse,
} from "@/lib/types/types";
import { Link } from "react-router";
import type { QueryKey } from "@/lib/generated/@tanstack/react-query.gen";

type SearchEntityOptions<
  TQuery extends SearchEntityQuery,
  TSearchResponse extends SearchResponse<Entity>,
> = (
  options?: Options<SearchEntityData<TQuery>>,
) => UseQueryOptions<
  TSearchResponse,
  string,
  TSearchResponse,
  QueryKey<Options<SearchEntityData<TQuery>>>
>;

type DeleteEntityMutation = (
  options?: Partial<Options<DeleteEntityData>>,
) => UseMutationOptions<void, string, Options<DeleteEntityData>>;

type EntityTablePageProps<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
  TQuery extends SearchEntityQuery,
> = {
  title: string;
  columns: ColumnsType<TEntity>;
  searchEntityOptions: SearchEntityOptions<TQuery, TSearchResponse>;
  deleteEntityMutation?: DeleteEntityMutation;
  FilterForm?: React.ComponentType<{ form: FormInstance<TQuery> }>;
  AddForm?: React.ComponentType;
  EditForm?: React.ComponentType<{ id: number }>;
};

export default function EntityTablePage<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
  TQuery extends SearchEntityQuery,
>(props: EntityTablePageProps<TEntity, TSearchResponse, TQuery>) {
  const { modal } = App.useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterForm] = Form.useForm<TQuery>();
  const [query, updateQuery] = useState<Partial<TQuery>>({});

  const queryResult = useQuery({
    ...props.searchEntityOptions({ query }),
    placeholderData: (previousData) => previousData,
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...(props.deleteEntityMutation?.() ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: props.searchEntityOptions().queryKey,
      });
    },
  });

  let rowActions:
    ((id: number) => NonNullable<MenuProps["items"]>) | undefined = undefined;
  if (props.EditForm || props.deleteEntityMutation)
    rowActions = (id: number) => {
      const rowActions = [];
      if (props.EditForm)
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
              onOk: () => deleteMutation.mutate({ path: { id } }),
            });
          },
          danger: true,
        });
      return rowActions;
    };

  const openFiltersForm = () => {
    filterForm.setFieldsValue(query);
    setFiltersOpen(true);
  };

  const applyFiltersFromForm = () => {
    setFiltersOpen(false);
    updateQuery(filterForm.getFieldsValue());
  };
  const tableActions: React.ReactNode[] = [];
  if (props.FilterForm)
    tableActions.push(
      <div key="filter_button">
        <Button onClick={openFiltersForm}>Filter</Button>
        <Drawer
          title="Filter Results"
          onClose={() => setFiltersOpen(false)}
          open={filtersOpen}

          extra={
            <Space size="small">
              <Button onClick={() => filterForm.resetFields()}>Reset</Button>
              <Button type="primary" onClick={applyFiltersFromForm}>
                Apply
              </Button>
            </Space>
          }
        >
          <props.FilterForm form={filterForm} />
        </Drawer>
      </div>,
    );

  if (props.AddForm)
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
          pagination={query}
          onPaginationChange={({ take, skip }) =>
            updateQuery({ ...query, take, skip })
          }
          rowActions={rowActions}
          tableActions={tableActions}
        />
      }
      AddForm={props.AddForm}
      EditForm={props.EditForm}
    />
  );
}
