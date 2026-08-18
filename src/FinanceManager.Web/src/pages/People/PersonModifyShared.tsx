import type { WritePersonRequest } from "@/lib/generated";
import { Form, Input } from "antd";

export default function PersonModifyShared() {
  return (
    <>
      <Form.Item<WritePersonRequest>
        label="First Name"
        name="firstName"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item<WritePersonRequest>
        label="Last Name"
        name="lastName"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
    </>
  );
}
