import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ensureOk } from ".";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@finapp/schema";

export const categoryQueryKey = ["category"] as const;

type QueryCategoriesResponse = Awaited<ReturnType<typeof api.category.$get>>;
type Category = Awaited<
  ReturnType<Extract<QueryCategoriesResponse, { status: 200 }>["json"]>
>[number];

type QueryCategoryResponse = Awaited<ReturnType<(typeof api.category)[":id"]["$get"]>>;
type CategoryDetail = Awaited<ReturnType<Extract<QueryCategoryResponse, { status: 200 }>["json"]>>;

export function useQueryCategories() {
  return useQuery({
    queryKey: categoryQueryKey,
    queryFn: async () => {
      const res = await api.category.$get();
      ensureOk(res);
      return await res.json();
    },
  });
}

export function useQueryCategory(id: number | null | undefined) {
  return useQuery({
    queryKey: [...categoryQueryKey, id],
    queryFn: async () => {
      const res = await api.category[":id"].$get({ param: { id: (id ?? 0).toString() } });
      ensureOk(res);
      return await res.json();
    },
    enabled: id != null,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (json: CreateCategoryRequest) => {
      const res = await api.category.$post({ json });
      ensureOk(res);
      return res.json();
    },
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: categoryQueryKey });
      queryClient.setQueryData([...categoryQueryKey, data.id], { canDelete: true, ...data });
      queryClient.setQueryData(categoryQueryKey, (old: Category[] | undefined) =>
        old ? [...old, data] : old,
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, json }: { id: number; json: UpdateCategoryRequest }) => {
      const res = await api.category[":id"].$put({ param: { id: id.toString() }, json });
      ensureOk(res);
    },
    onSuccess: async (_, { id, json }) => {
      await queryClient.cancelQueries({ queryKey: categoryQueryKey });

      queryClient.setQueryData([...categoryQueryKey, id], (old: CategoryDetail | undefined) =>
        old ? { ...old, ...json } : old,
      );
      queryClient.setQueryData(categoryQueryKey, (old: Category[] | undefined) =>
        old ? old.map((cat) => (cat.id === id ? { id, ...json } : cat)) : old,
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.category[":id"].$delete({ param: { id: id.toString() } });
      ensureOk(res);
    },
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries({ queryKey: categoryQueryKey });
      queryClient.removeQueries({ queryKey: [...categoryQueryKey, id] });
      queryClient.setQueryData(categoryQueryKey, (old: Category[] | undefined) =>
        old ? old.filter((cat) => cat.id !== id) : old,
      );
    },
  });
}
