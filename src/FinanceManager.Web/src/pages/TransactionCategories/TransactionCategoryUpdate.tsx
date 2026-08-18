import {
  lookupTransactionCategoryOptions,
  searchTransactionCategoryQueryKey,
  updateTransactionCategoryMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import TransactionCategoryModifyShared from "./TransactionCategoryModifyShared";
import EntityUpdateForm from "@/components/EntityForm/EntityUpdateForm";
import type { WriteTransactionCategoryRequest } from "@/lib/generated";

export default function TransactionCategoryUpdate() {
  return (
    <EntityUpdateForm
      title="Edit Category"
      lookupEntityOptions={lookupTransactionCategoryOptions}
      updateEntityMutation={updateTransactionCategoryMutation}
      dataTransform={(x) => x as WriteTransactionCategoryRequest}
      toInvalidate={[searchTransactionCategoryQueryKey()]}
    >
      <TransactionCategoryModifyShared />
    </EntityUpdateForm>
  );
}
