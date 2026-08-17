import EntityTable from "@/components/EntityTable/EntityTable";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";
import useQueryForTable from "@/hooks/useQueryForTable";
import type { SpendingCategoryResponse } from "@/lib/generated";
import { searchSpendingCategoryOptions } from "@/lib/generated/@tanstack/react-query.gen";

export default function CategoriesPage() {
  const columns = useMemoizedColumns<SpendingCategoryResponse>(() => [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ]);
  const { query, updateQuery, useQueryResult } = useQueryForTable(
    searchSpendingCategoryOptions,
  );

  return (
    <EntityTable
      title="Categories"
      columns={columns}
      pagination={query}
      updatePagination={updateQuery}
      useQueryResult={useQueryResult}
    />
  );
}
