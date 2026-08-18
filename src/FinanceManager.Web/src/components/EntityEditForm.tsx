import { Button, Card, Flex, Form } from "antd";
import type { ReactElement } from "react";
import Title from "antd/es/typography/Title";

type EntityEditFormProps<TEntity> = {
  children:
    | ReactElement<typeof Form.Item<TEntity>>
    | ReactElement<typeof Form.Item<TEntity>>[];
  title: string;
};

export default function EntityEditForm<TEntity>({
  title,
  children,
}: EntityEditFormProps<TEntity>) {
  const [form] = Form.useForm<TEntity>();

  return (
    <Flex vertical justify="space-between" gap="middle">
      <Flex justify="space-between">
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Flex align="center" gap="middle">
          <Button>Cancel</Button>
          <Button type="primary">Save</Button>
        </Flex>
      </Flex>
      <Card>
        <Form form={form}>{children}</Form>
      </Card>
    </Flex>
  );
}
