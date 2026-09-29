import {
  lookupCategoryPatternOptions,
  searchCategoryPatternQueryKey,
  updateCategoryPatternMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import CategoryPatternModifyShared from "./CategoryPatternModifyShared";
import EntityUpdateForm from "@/components/EntityForm/EntityUpdateForm";
import type { WriteCategoryPatternRequest } from "@/lib/generated";
import { Form } from "antd";

export default function CategoryPatternUpdate() {
  const [form] = Form.useForm<WriteCategoryPatternRequest>();

  return (
    <EntityUpdateForm
      title="Edit Category Pattern"
      lookupEntityOptions={lookupCategoryPatternOptions}
      updateEntityMutation={updateCategoryPatternMutation}
      dataTransform={(x) => x as WriteCategoryPatternRequest}
      toInvalidate={[searchCategoryPatternQueryKey()]}
      form={form}
    >
      <CategoryPatternModifyShared form={form} />
    </EntityUpdateForm>
  );
}
