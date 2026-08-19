import EntityCreateForm from "@/components/EntityForm/EntityCreateForm";
import {
  searchCategoryPatternQueryKey,
  createCategoryPatternMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import CategoryPatternModifyShared from "./CategoryPatternModifyShared";

export default function CategoryPatternCreate() {
  return (
    <EntityCreateForm
      title="Add Category Pattern"
      createEntityMutation={createCategoryPatternMutation}
      toInvalidate={[searchCategoryPatternQueryKey()]}
    >
      <CategoryPatternModifyShared />
    </EntityCreateForm>
  );
}
