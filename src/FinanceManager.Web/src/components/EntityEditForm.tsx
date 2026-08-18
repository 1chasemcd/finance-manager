import { Button, Card, Flex, Form, Spin } from "antd";
import { useEffect, useState, type ReactElement } from "react";
import Title from "antd/es/typography/Title";
import type { LookupEntityOptions, UpdateEntityMutation } from "@/lib/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const ENTITY_EDIT_FORM_ID = "entity-edit-form";
type EntityEditFormProps<TLookup, TSave> = {
  children:
    | ReactElement<typeof Form.Item<TSave>>
    | ReactElement<typeof Form.Item<TSave>>[];
  title: string;
  lookupEntityOptions: LookupEntityOptions<TLookup>;
  updateEntityMutation: UpdateEntityMutation<TSave>;
  dataTransform: (data: TLookup) => TSave;
  toInvalidate?: QueryKey;
};

export default function EntityEditForm<
  TLookup,
  TSave extends Record<string, unknown>,
>({
  title,
  children,
  lookupEntityOptions,
  updateEntityMutation,
  dataTransform,
  toInvalidate,
}: EntityEditFormProps<TLookup, TSave>) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const entityId = Number(id);

  const lookupOptions = lookupEntityOptions({
    path: { id: entityId },
  });

  const { data, isPending } = useQuery(lookupOptions);
  const mutation = useMutation({
    ...updateEntityMutation(),
    onSuccess: () => {
      setIsSaving(true);
      if (toInvalidate)
        queryClient.invalidateQueries({ queryKey: toInvalidate });
      queryClient.invalidateQueries({
        queryKey: lookupOptions.queryKey,
      });

      navigate("..");
    },
  });

  const [form] = Form.useForm<TSave>();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(dataTransform(data));
    }
  }, [data, form, dataTransform]);

  return (
    <Flex vertical justify="space-between" gap="middle">
      <Flex justify="space-between">
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Flex align="center" gap="middle">
          <Button onClick={() => navigate("..")}>Cancel</Button>
          <Button type="primary" htmlType="submit" form={ENTITY_EDIT_FORM_ID}>
            Save
          </Button>
        </Flex>
      </Flex>
      <Spin spinning={isPending || isSaving}>
        <Card>
          <Form<TSave>
            id={ENTITY_EDIT_FORM_ID}
            requiredMark={false}
            form={form}
            disabled={isPending || isSaving}
            onFinish={(values) => {
              mutation.mutate({ path: { id: entityId }, body: values });
            }}
            labelCol={{ flex: "120px" }}
            wrapperCol={{ flex: 1 }}
          >
            {children}
          </Form>
        </Card>
      </Spin>
    </Flex>
  );
}
