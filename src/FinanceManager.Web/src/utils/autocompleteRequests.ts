import {
  autocompletePersonByIdOptions,
  autocompletePersonOptions,
  autocompleteTransactionCategoryByIdOptions,
  autocompleteTransactionCategoryOptions,
  autocompleteTransactionSourceByIdOptions,
  autocompleteTransactionSourceOptions,
} from "../lib/generated/@tanstack/react-query.gen";
import type { AutocompleteRequestOptions } from "../lib/types/autocomplete";

export const transactionCategoryAutocomplete: AutocompleteRequestOptions = {
  search: autocompleteTransactionCategoryOptions,
  byId: autocompleteTransactionCategoryByIdOptions,
};

export const transactionSourceAutocomplete: AutocompleteRequestOptions = {
  search: autocompleteTransactionSourceOptions,
  byId: autocompleteTransactionSourceByIdOptions,
};

export const personAutocomplete: AutocompleteRequestOptions = {
  search: autocompletePersonOptions,
  byId: autocompletePersonByIdOptions,
};
