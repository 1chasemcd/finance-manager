import {
  lookupCategoryPatternOptions,
  searchCategoryPatternQueryKey,
  updateCategoryPatternMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import CategoryPatternModifyShared from "./CategoryPatternModifyShared";
import EntityUpdateForm from "@/components/EntityForm/EntityUpdateForm";
import type { WriteCategoryPatternRequest } from "@/lib/generated";

export default function CategoryPatternUpdate() {
  return (
    <EntityUpdateForm
      title="Edit Category Pattern"
      lookupEntityOptions={lookupCategoryPatternOptions}
      updateEntityMutation={updateCategoryPatternMutation}
      dataTransform={(x) => x as WriteCategoryPatternRequest}
      toInvalidate={[searchCategoryPatternQueryKey()]}
    >
      <CategoryPatternModifyShared />
    </EntityUpdateForm>
  );
}
