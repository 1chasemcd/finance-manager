import { Button, Card, Flex, Form, Spin, type FormInstance } from "antd";
import { useEffect, useState, type ReactElement } from "react";
import Title from "antd/es/typography/Title";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useFormErrorHandler from "@/hooks/useFormErrorHandler";

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
  form?: FormInstance<TEntity>;
};

export default function EntityForm<TEntity extends Record<string, unknown>>({
  title,
  children,
  saveCallback,
  loading,
  keysToInvalidate,
  initialValues,
  form,
}: EntityFormProps<TEntity>) {
  const handleFormErrors = useFormErrorHandler();

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const navigate = useNavigate();

  const [internalForm] = Form.useForm<TEntity>();
  const formToUse = form ?? internalForm;

  const onFinish = async (value: TEntity) => {
    setIsSaving(true);
    try {
      await saveCallback(value);
    } catch (error: unknown) {
      setIsSaving(false);
      handleFormErrors(formToUse, error);
      return;
    }
    keysToInvalidate?.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    );
    navigate("..");
  };

  useEffect(() => {
    if (initialValues && !initialized) {
      formToUse.setFieldsValue(initialValues);
      setInitialized(true);
    }
  }, [initialValues, formToUse, initialized]);

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
            form={formToUse}
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
