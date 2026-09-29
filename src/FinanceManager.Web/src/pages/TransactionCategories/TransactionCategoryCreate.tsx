import EntityCreateForm from "@/components/EntityForm/EntityCreateForm";
import {
  searchTransactionCategoryQueryKey,
  createTransactionCategoryMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import TransactionCategoryModifyShared from "./TransactionCategoryModifyShared";

export default function TransactionCategoryCreate() {
  return (
    <EntityCreateForm
      title="Add Category"
      createEntityMutation={createTransactionCategoryMutation}
      toInvalidate={[searchTransactionCategoryQueryKey()]}
    >
      <TransactionCategoryModifyShared />
    </EntityCreateForm>
  );
}
