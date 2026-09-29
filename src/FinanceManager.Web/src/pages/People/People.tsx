import EntityTable from "@/components/EntityTable/EntityTable";
import EntityTableCreateAction from "@/components/EntityTable/EntityTableCreateAction";
import useDeleteActionForTable from "@/hooks/useDeleteActionForTable";
import useEditActionForTable from "@/hooks/useEditActionForTable";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { PersonResponse } from "@/lib/generated";
import {
  deletePersonMutation,
  searchPersonOptions,
  searchPersonQueryKey,
} from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

function People() {
  const columns = useMemo<ColumnsType<PersonResponse>>(
    () => [
      {
        title: "First Name",
        dataIndex: "firstName",
        key: "firstName",
      },
      {
        title: "Last Name",
        dataIndex: "lastName",
        key: "lastName",
      },
    ],
    [],
  );
  const { query, updateQuery, useQueryResult } =
    useQueryForTable(searchPersonOptions);

  const editAction = useEditActionForTable();
  const deleteAction = useDeleteActionForTable(deletePersonMutation, [
    searchPersonQueryKey(),
  ]);

  return (
    <EntityTable
      title="People"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
      tableActions={[<EntityTableCreateAction />]}
      rowActions={[editAction, deleteAction]}
    />
  );
}

export default People;
