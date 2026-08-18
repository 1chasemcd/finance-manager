import EntityCreateForm from "@/components/EntityForm/EntityCreateForm";
import type { WriteTransactionSourceRequest } from "@/lib/generated";
import {
  searchTransactionSourceQueryKey,
  createTransactionSourceMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import { Form, Input, InputNumber } from "antd";

export default function TransactionSourceCreate() {
  return (
    <EntityCreateForm
      title="Add TransactionSource"
      createEntityMutation={createTransactionSourceMutation}
      toInvalidate={[searchTransactionSourceQueryKey()]}
    >
      <Form.Item<WriteTransactionSourceRequest>
        label="Name"
        name="name"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item<WriteTransactionSourceRequest>
        label="Owner"
        name="ownerId"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>
    </EntityCreateForm>
  );
}
