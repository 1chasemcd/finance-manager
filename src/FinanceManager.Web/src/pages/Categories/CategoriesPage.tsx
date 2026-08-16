import EntityTablePage from "@/components/EntityTable/EntityTablePage";
import useMemoizedColumns from "@/hooks/useMemoizedColumns";
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
  return (
    <EntityTablePage
      title="Categories"
      columns={columns}
      searchEntityOptions={searchSpendingCategoryOptions}
    />
  );
}
