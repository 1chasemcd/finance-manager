import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ensureOk } from ".";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@finapp/schema";

export const categoryQueryKey = ["category"] as const;

function useInvalidateCategory() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: categoryQueryKey });
}

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
  const invalidateCategory = useInvalidateCategory();
  return useMutation({
    mutationFn: async (json: CreateCategoryRequest) => {
      const res = await api.category.$post({ json });
      ensureOk(res);
    },
    onSuccess: invalidateCategory,
  });
}

export function useUpdateCategory() {
  const invalidateCategory = useInvalidateCategory();
  return useMutation({
    mutationFn: async ({ id, json }: { id: number; json: UpdateCategoryRequest }) => {
      const res = await api.category[":id"].$put({ param: { id: id.toString() }, json });
      ensureOk(res);
    },
    onSuccess: invalidateCategory,
  });
}

export function useDeleteCategory() {
  const invalidateCategory = useInvalidateCategory();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.category[":id"].$delete({ param: { id: id.toString() } });
      ensureOk(res);
    },
    onSuccess: invalidateCategory,
  });
}
