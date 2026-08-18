import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { QueryKey } from "../generated/@tanstack/react-query.gen";
import type { Options } from "../generated";

export type Entity = {
  id: number;
};

export type LookupEntityData = {
  body?: never;
  path: {
    id: number;
  };
  query?: never;
  url: string;
};
export type LookupEntityOptions<TResponse> = (
  options: Options<LookupEntityData>,
) => UseQueryOptions<
  TResponse,
  string,
  TResponse,
  QueryKey<Options<LookupEntityData>>
>;

export type DeleteEntityData = LookupEntityData;

export type DeleteEntityMutation = (
  options?: Partial<Options<DeleteEntityData>>,
) => UseMutationOptions<void, string, Options<DeleteEntityData>>;

export type UpdateEntityData<TBody> = {
  body?: TBody;
  path: {
    id: number;
  };
  query?: never;
  url: string;
};

export type UpdateEntityMutation<TBody> = (
  options?: Partial<Options<UpdateEntityData<TBody>>>,
) => UseMutationOptions<void, string, Options<UpdateEntityData<TBody>>>;

export type CreateEntityData<TBody> = {
  body?: TBody;
  path?: never;
  query?: never;
  url: string;
};

export type CreateEntityMutation<TBody> = (
  options?: Partial<Options<CreateEntityData<TBody>>>,
) => UseMutationOptions<unknown, string, Options<CreateEntityData<TBody>>>;

export type SearchEntityQuery = {
  take?: number;
  skip?: number;
};

export type SearchEntityData<TQuery extends SearchEntityQuery> = {
  body?: never;
  path?: never;
  query?: Partial<TQuery>;
  url: string;
};

export type SearchEntityOptions<
  TQuery extends SearchEntityQuery,
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
> = (
  options?: Options<SearchEntityData<TQuery>>,
) => UseQueryOptions<
  TSearchResponse,
  string,
  TSearchResponse,
  QueryKey<Options<SearchEntityData<TQuery>>>
>;

export type SearchResponse<TEntity extends Entity> = {
  results: TEntity[];
  total: number;
};
