import AppTablePage from "@/components/AppTablePage/AppTablePage";
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
    <AppTablePage
      title="Categories"
      columns={columns}
      searchRequestOptions={searchSpendingCategoryOptions}
    />
  );
}
