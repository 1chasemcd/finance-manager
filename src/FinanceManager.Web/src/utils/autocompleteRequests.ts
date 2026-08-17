import {
  getApiAutocompleteSpendingcategoryByIdOptions,
  getApiAutocompleteSpendingcategoryOptions,
} from "../lib/generated/@tanstack/react-query.gen";
import type { AutocompleteRequestOptions } from "../lib/types/autocomplete";

export const spendingCategoryAutocomplete: AutocompleteRequestOptions = {
  search: getApiAutocompleteSpendingcategoryOptions,
  byId: getApiAutocompleteSpendingcategoryByIdOptions,
};
