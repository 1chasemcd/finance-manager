import { Form } from "antd";
import { type ReactElement } from "react";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import type { CreateEntityMutation } from "@/lib/types";
import EntityForm from "./EntityForm";

type EntityCreateFormProps<TSave> = {
  children:
    | ReactElement<typeof Form.Item<TSave>>
    | ReactElement<typeof Form.Item<TSave>>[];
  title: string;
  toInvalidate?: QueryKey;
  createEntityMutation: CreateEntityMutation<TSave>;
};

export default function EntityCreateForm<
  TSave extends Record<string, unknown>,
>({ createEntityMutation, ...props }: EntityCreateFormProps<TSave>) {
  const mutation = useMutation(createEntityMutation());

  return (
    <EntityForm
      {...props}
      saveCallback={async (value) => {
        await mutation.mutateAsync({ body: value });
      }}
    />
  );
}
