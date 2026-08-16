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

export type SearchEntityData = {
  body?: never;
  path?: never;
  query?: {
    take?: number;
    skip?: number;
  };
  url: string;
};
