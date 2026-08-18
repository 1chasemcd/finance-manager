import EntityEditForm from "@/components/EntityEditForm";
import type { WriteFinancialAccountRequest } from "@/lib/generated";
import { Form, Input, InputNumber } from "antd";

export default function AccountEdit() {
  return (
    <EntityEditForm title="Edit Account">
      <Form.Item<WriteFinancialAccountRequest>
        label="Account Name"
        name="name"
        rules={[{ required: true }, { len: 100 }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<WriteFinancialAccountRequest>
        label="Owner"
        name="ownerId"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item<number>></Form.Item>
    </EntityEditForm>
  );
}
