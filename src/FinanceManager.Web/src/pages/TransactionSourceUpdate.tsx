import EntityUpdateForm from "@/components/EntityForm/EntityUpdateForm";
import type {
  TransactionSourceResponse,
  WriteTransactionSourceRequest,
} from "@/lib/generated";
import {
  lookupTransactionSourceOptions,
  searchTransactionSourceQueryKey,
  updateTransactionSourceMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import { Form, Input, InputNumber } from "antd";
import { useCallback } from "react";

export default function TransactionSourceUpdate() {
  const dataTransform = useCallback(
    (data: TransactionSourceResponse) => data as WriteTransactionSourceRequest,
    [],
  );
  return (
    <EntityUpdateForm
      title="Edit Transaction Source"
      lookupEntityOptions={lookupTransactionSourceOptions}
      updateEntityMutation={updateTransactionSourceMutation}
      dataTransform={dataTransform}
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
    </EntityUpdateForm>
  );
}
