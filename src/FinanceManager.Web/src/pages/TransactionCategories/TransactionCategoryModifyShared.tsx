import type { WriteTransactionCategoryRequest } from "@/lib/generated";
import { Form, Input } from "antd";

export default function TransactionCategoryModifyShared() {
  return (
    <>
      <Form.Item<WriteTransactionCategoryRequest>
        label="Name"
        name="name"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item<WriteTransactionCategoryRequest>
        label="Description"
        name="description"
      >
        <Input maxLength={500} />
      </Form.Item>
    </>
  );
}
