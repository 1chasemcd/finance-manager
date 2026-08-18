import {
  autocompleteTransactionCategoryByIdOptions,
  autocompleteTransactionCategoryOptions,
} from "../lib/generated/@tanstack/react-query.gen";
import type { AutocompleteRequestOptions } from "../lib/types/autocomplete";

export const transactionCategoryAutocomplete: AutocompleteRequestOptions = {
  search: autocompleteTransactionCategoryOptions,
  byId: autocompleteTransactionCategoryByIdOptions,
};
