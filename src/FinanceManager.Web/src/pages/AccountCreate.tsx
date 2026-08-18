import EntityCreateForm from "@/components/EntityForm/EntityCreateForm";
import type { WriteFinancialAccountRequest } from "@/lib/generated";
import {
  searchAccountQueryKey,
  createAccountMutation,
} from "@/lib/generated/@tanstack/react-query.gen";
import { Form, Input, InputNumber } from "antd";

export default function AccountCreate() {
  return (
    <EntityCreateForm
      title="Add Account"
      createEntityMutation={createAccountMutation}
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
    </EntityCreateForm>
  );
}
