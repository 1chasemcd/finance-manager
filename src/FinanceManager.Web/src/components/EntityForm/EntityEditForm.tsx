import { Form } from "antd";
import { type ReactElement } from "react";
import type { LookupEntityOptions, UpdateEntityMutation } from "@/lib/types";
import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import EntityForm from "./EntityForm";

type EntityEditFormProps<TLookup, TSave> = {
  children:
    | ReactElement<typeof Form.Item<TSave>>
    | ReactElement<typeof Form.Item<TSave>>[];
  title: string;
  lookupEntityOptions: LookupEntityOptions<TLookup>;
  updateEntityMutation: UpdateEntityMutation<TSave>;
  dataTransform: (data: TLookup) => TSave;
  toInvalidate?: QueryKey[];
};

export default function EntityEditForm<
  TLookup,
  TSave extends Record<string, unknown>,
>({
  lookupEntityOptions,
  updateEntityMutation,
  dataTransform,
  toInvalidate,
  ...props
}: EntityEditFormProps<TLookup, TSave>) {
  const { id } = useParams();
  const entityId = Number(id);
  const lookupOptions = lookupEntityOptions({
    path: { id: entityId },
  });

  const { data, isPending } = useQuery(lookupOptions);
  const mutation = useMutation(updateEntityMutation());

  return (
    <EntityForm
      {...props}
      loading={isPending}
      keysToInvalidate={[...(toInvalidate ?? []), lookupOptions.queryKey]}
      initialValues={data && dataTransform(data)}
      saveCallback={async (value) => {
        await mutation.mutateAsync({ path: { id: entityId }, body: value });
      }}
    />
  );
}
