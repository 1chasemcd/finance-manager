import {
  getApiAutocompleteTransactioncategoryByIdOptions,
  getApiAutocompleteTransactioncategoryOptions,
} from "../lib/generated/@tanstack/react-query.gen";
import type { AutocompleteRequestOptions } from "../lib/types/autocomplete";

export const transactionCategoryAutocomplete: AutocompleteRequestOptions = {
  search: getApiAutocompleteTransactioncategoryOptions,
  byId: getApiAutocompleteTransactioncategoryByIdOptions,
};
