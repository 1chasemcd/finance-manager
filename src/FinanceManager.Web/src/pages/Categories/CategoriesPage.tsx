import AppTablePage from "@/components/AppTablePage/AppTablePage";
import type { SpendingCategoryResponse } from "@/lib/generated";
import { searchSpendingCategoryOptions } from "@/lib/generated/@tanstack/react-query.gen";
import type { ColumnsType } from "antd/es/table";

const getColumns: () => ColumnsType<SpendingCategoryResponse> = () => [
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
];

export default function CategoriesPage() {
  return (
    <AppTablePage
      title="Categories"
      columns={getColumns()}
      searchRequestOptions={searchSpendingCategoryOptions}
    />
  );
}
