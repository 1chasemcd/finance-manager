import type { UseQueryOptions } from "@tanstack/react-query";
import type { Options } from "../generated/client";
import type {
  AutocompleteQueryResponse,
  HttpValidationProblemDetails,
} from "../generated";
import type { QueryKey } from "../generated/@tanstack/react-query.gen";

export type AutocompleteData = {
  body?: never;
  path?: never;
  query?: {
    search?: string;
    take?: number;
    skip?: number;
  };
  url: string;
};

export type AutocompleteByIdData = {
  body?: never;
  path: {
    id: number;
  };
  query?: never;
  url: string;
};

type AutocompleteOptions = (
  options?: Options<AutocompleteData>,
) => UseQueryOptions<
  AutocompleteQueryResponse[],
  HttpValidationProblemDetails,
  AutocompleteQueryResponse[],
  QueryKey<Options<AutocompleteData>>
>;

type AutocompleteByIdOptions = (
  options: Options<AutocompleteByIdData>,
) => UseQueryOptions<
  AutocompleteQueryResponse,
  HttpValidationProblemDetails,
  AutocompleteQueryResponse,
  QueryKey<Options<AutocompleteByIdData>>
>;

export type AutocompleteRequestOptions = {
  search: AutocompleteOptions;
  byId: AutocompleteByIdOptions;
};
