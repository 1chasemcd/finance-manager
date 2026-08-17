import type { Options } from "@/lib/generated";
import type { QueryKey } from "@/lib/generated/@tanstack/react-query.gen";
import type {
  Entity,
  SearchEntityData,
  SearchEntityQuery,
  SearchResponse,
} from "@/lib/types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";

type SearchEntityOptions<
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

export default function useQueryForTable<
  TQuery extends SearchEntityQuery,
  TEntity extends Entity,
  TSearchResponse extends SearchResponse<TEntity>,
>(searchEntityOptions: SearchEntityOptions<TQuery, TEntity, TSearchResponse>) {
  const [query, setQuery] = useState<Partial<TQuery>>({
    skip: 0,
    take: 50,
  } as Partial<TQuery>);

  const useQueryResult = useQuery({
    ...searchEntityOptions({ query }),
    placeholderData: (previousData) => previousData,
  });

  const updateQuery = (changes: Partial<TQuery>) => {
    setQuery((current) => ({
      ...current,
      ...changes,
    }));
  };

  return { query, updateQuery, useQueryResult };
}
