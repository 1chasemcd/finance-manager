import { App, Button, Card, Flex, Form, Spin } from "antd";
import { useEffect, useState, type ReactElement } from "react";
import Title from "antd/es/typography/Title";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ENTITY_FORM_ID = "entity-form";
type EntityFormProps<TEntity> = {
  children:
    | ReactElement<typeof Form.Item<TEntity>>
    | ReactElement<typeof Form.Item<TEntity>>[];
  title: string;
  saveCallback: (values: TEntity) => Promise<void>;
  loading?: boolean;
  keysToInvalidate?: QueryKey[];
  initialValues?: Partial<TEntity | undefined>;
};

export default function EntityForm<TEntity extends Record<string, unknown>>({
  title,
  children,
  saveCallback,
  loading,
  keysToInvalidate,
  initialValues,
}: EntityFormProps<TEntity>) {
  const { modal } = App.useApp();

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const navigate = useNavigate();

  const [form] = Form.useForm<TEntity>();

  const onFinish = async (value: TEntity) => {
    setIsSaving(true);
    try {
      await saveCallback(value);
    } catch {
      setIsSaving(false);
      modal.error({ title: "Error", content: "Something went wrong." });
      return;
    }
    keysToInvalidate?.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    );
    navigate("..");
  };

  useEffect(() => {
    if (initialValues && !initialized) {
      form.setFieldsValue(initialValues);
      setInitialized(true);
    }
  }, [initialValues, form, initialized]);

  return (
    <Flex vertical justify="space-between" gap="middle">
      <Flex justify="space-between">
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Flex align="center" gap="middle">
          <Button onClick={() => navigate("..")}>Cancel</Button>
          <Button type="primary" htmlType="submit" form={ENTITY_FORM_ID}>
            Save
          </Button>
        </Flex>
      </Flex>
      <Spin spinning={loading || isSaving}>
        <Card>
          <Form<TEntity>
            id={ENTITY_FORM_ID}
            requiredMark={false}
            form={form}
            disabled={loading || isSaving}
            onFinish={onFinish}
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
