import {
  getApiAutocompleteSpendingcategoryByIdOptions,
  getApiAutocompleteSpendingcategoryOptions,
} from "./generated/@tanstack/react-query.gen";
import type { AutocompleteRequestOptions } from "./types/autocomplete";

export const spendingCategoryAutocomplete: AutocompleteRequestOptions = {
  search: getApiAutocompleteSpendingcategoryOptions,
  byId: getApiAutocompleteSpendingcategoryByIdOptions,
};
