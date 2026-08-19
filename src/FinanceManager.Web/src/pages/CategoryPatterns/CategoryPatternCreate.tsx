import EntityCreateForm from "@/components/EntityForm/EntityCreateForm";
import {
  searchCategoryPatternQueryKey,
  createCategoryPatternMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import CategoryPatternModifyShared from "./CategoryPatternModifyShared";
import { Form } from "antd";
import type { WriteCategoryPatternRequest } from "@/lib/generated";

export default function CategoryPatternCreate() {
  const [form] = Form.useForm<WriteCategoryPatternRequest>();
  return (
    <EntityCreateForm
      title="Add Category Pattern"
      createEntityMutation={createCategoryPatternMutation}
      toInvalidate={[searchCategoryPatternQueryKey()]}
      form={form}
    >
      <CategoryPatternModifyShared form={form} />
    </EntityCreateForm>
  );
}
