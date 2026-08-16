import { type UseQueryResult } from "@tanstack/react-query";
import { Button, Dropdown, Flex, Table } from "antd";
import type { MenuProps, TablePaginationConfig } from "antd";

import { useMemo, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useTableHeight } from "@/hooks/useTableHeight";
import "./EntityTable.css";
import { Ellipsis } from "lucide-react";
import type { Entity, SearchResponse } from "@/lib/types/types";

type EntityTableProps<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
> = {
  title: string;
  columns: ColumnsType<TEntity>;
  queryResult: UseQueryResult<TSearchResponse, unknown>;
  onPaginationChange: (newPagination: TablePaginationConfig) => void;
  tableActions?: React.ReactNode[];
  rowActions?: ((id: number) => NonNullable<MenuProps["items"]>) | undefined;
};

export default function EntityTable<
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
>(props: EntityTableProps<TEntity, TSearchResponse>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(contentRef);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
  });

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
            menu={{ items: rowActions(record.id) }}
            trigger={["click"]}
            arrow
          >
            <Button type="text" icon={<Ellipsis />}></Button>
          </Dropdown>
        ),
      });

    return columns;
  }, [props.columns, props.rowActions]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current ?? 1,
      pageSize: newPagination.pageSize ?? 50,
    });
    props.onPaginationChange(newPagination);
  };

  return (
    <div className="page">
      <Flex justify="space-between" className="header">
        <Title level={4} style={{ margin: 0 }}>
          {props.title}
        </Title>
        {props.tableActions && (
          <Flex align="center" gap="middle">
            {props.tableActions}
          </Flex>
        )}
      </Flex>

      <div ref={contentRef} className="table-container">
        <Table
          size="small"
          rowKey={(record) => record.id}
          tableLayout="fixed"
          dataSource={props.queryResult.data?.results ?? []}
          loading={props.queryResult.isPending || props.queryResult.isFetching}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: props.queryResult.data?.total ?? 0,
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
