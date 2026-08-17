export type Entity = {
  id: number;
};

export type SearchResponse<TEntity extends Entity> = {
  results: TEntity[];
  total: number;
};

export type LookupEntityData = {
  path: {
    id: number;
  };
  url: string;
};

export type DeleteEntityData = LookupEntityData;

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
