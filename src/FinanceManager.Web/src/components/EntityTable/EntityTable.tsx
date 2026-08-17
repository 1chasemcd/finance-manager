import { type UseQueryResult } from "@tanstack/react-query";
import { Button, Dropdown, Flex, Table } from "antd";
import type { MenuProps, TablePaginationConfig } from "antd";

import { useMemo, useRef } from "react";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useTableHeight } from "@/hooks/useTableHeight";
import "./EntityTable.css";
import { Ellipsis } from "lucide-react";
import type { Entity, SearchResponse } from "@/lib/types";

type ItemType = NonNullable<MenuProps["items"]>[0];

type ApiPagination = {
  take?: number;
  skip?: number;
};

type EntityTableProps<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
  TPagination extends ApiPagination,
> = {
  title: string;
  columns: ColumnsType<TEntity>;
  useQueryResult: UseQueryResult<TSearchResponse, unknown>;
  pagination: TPagination;
  updatePagination: (pagination: TPagination) => void;
  tableActions?: React.ReactNode[];
  rowActions?: ((id: number) => ItemType)[];
};

function pageToApi(page: TablePaginationConfig): ApiPagination {
  const apiPagination: ApiPagination = {};
  if (page.pageSize) apiPagination.take = page.pageSize;
  if (page.pageSize && page.current)
    apiPagination.skip = (page.current - 1) * page.pageSize;
  return apiPagination;
}

function apiToPage(apiPagination: ApiPagination): TablePaginationConfig {
  const config: TablePaginationConfig = {};
  if (apiPagination.take) config.pageSize = apiPagination.take;
  if (apiPagination.take && apiPagination.skip)
    config.current = Math.floor(apiPagination.skip / apiPagination.take + 1);
  return config;
}

export default function EntityTable<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
  TPagination extends ApiPagination,
>(props: EntityTableProps<TEntity, TSearchResponse, TPagination>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);

  const columns = useMemo(() => {
    const columns: ColumnsType<TEntity> = props.columns.map((column) => ({
      ...column,
      ellipsis: column.ellipsis !== false,
    }));
    const { rowActions } = props;

    if (rowActions && rowActions.length > 0)
      columns.push({
        title: "",
        key: "$actions",
        width: 48,
        render: (_, record) => (
          <Dropdown
            menu={{ items: rowActions.map((action) => action(record.id)) }}
            trigger={["click"]}
            arrow
          >
            <Button type="text" icon={<Ellipsis />}></Button>
          </Dropdown>
        ),
      });

    return columns;
  }, [props.columns, props.rowActions]);

  return (
    <div className="page">
      <Flex justify="space-between" className="header">
        <Title level={4} style={{ margin: 0 }}>
          {props.title}
        </Title>
        {props.tableActions && (
          <Flex align="center" gap="middle">
            {props.tableActions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </Flex>
        )}
      </Flex>

      <div ref={contentRef} className="table-container">
        <Table
          size="small"
          rowKey={(record) => record.id}
          tableLayout="fixed"
          dataSource={props.useQueryResult.data?.results ?? []}
          loading={props.useQueryResult.isPending}
          columns={columns}
          pagination={{
            ...apiToPage(props.pagination),
            total: props.useQueryResult.data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          scroll={{ y: tableHeight }}
          onChange={(page: TablePaginationConfig) =>
            props.updatePagination({ ...props.pagination, ...pageToApi(page) })
          }
        />
      </div>
    </div>
  );
}
