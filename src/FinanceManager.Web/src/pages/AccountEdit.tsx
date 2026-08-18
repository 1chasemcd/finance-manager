import EntityEditForm from "@/components/EntityForm/EntityEditForm";
import type {
  FinancialAccountResponse,
  WriteFinancialAccountRequest,
} from "@/lib/generated";
import {
  lookupAccountOptions,
  searchAccountQueryKey,
  updateAccountMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import { Form, Input, InputNumber } from "antd";
import { useCallback } from "react";

export default function AccountEdit() {
  const dataTransform = useCallback(
    (data: FinancialAccountResponse) => data as WriteFinancialAccountRequest,
    [],
  );
  return (
    <EntityEditForm
      title="Edit Account"
      lookupEntityOptions={lookupAccountOptions}
      updateEntityMutation={updateAccountMutation}
      dataTransform={dataTransform}
      toInvalidate={searchAccountQueryKey()}
    >
      <Form.Item<WriteFinancialAccountRequest>
        label="Account Name"
        name="name"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item<WriteFinancialAccountRequest>
        label="Owner"
        name="ownerId"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>
    </EntityEditForm>
  );
}
