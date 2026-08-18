import type { DeleteEntityMutation } from "@/lib/types";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { App, type MenuProps } from "antd";

type ItemType = NonNullable<MenuProps["items"]>[0];

export default function useDeleteActionForTable(
  deleteEntityMutation: DeleteEntityMutation,
  toInvalidate: QueryKey[],
): (id: number) => ItemType {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  const options = deleteEntityMutation();

  const deleteMutation = useMutation({
    ...options,
    onSuccess: async (...args) => {
      await options.onSuccess?.(...args);

      await Promise.all(
        toInvalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });

  return (id: number) => ({
    key: "delete",
    label: "Delete",
    onClick: () => {
      modal.confirm({
        title: "Delete this record?",
        content: "This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
        onOk: () => deleteMutation.mutateAsync({ path: { id } }),
      });
    },
    danger: true,
  });
}
