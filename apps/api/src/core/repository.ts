import z from "zod";

export const SearchRequest = z.object({
  skip: z.int().min(0).default(0),
  take: z.int().min(1).max(50).default(50),
});

export type SearchRequest = z.infer<typeof SearchRequest>;

export type SearchResult<T> = {
  result: T[];
  total: number;
};
