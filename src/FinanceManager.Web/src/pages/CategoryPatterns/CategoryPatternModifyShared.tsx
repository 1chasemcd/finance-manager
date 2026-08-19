import AppAutocomplete from "@/components/AppAutocomplete";
import type { WriteCategoryPatternRequest } from "@/lib/generated";
import { transactionCategoryAutocomplete } from "@/utils/autocompleteRequests";
import { Checkbox, Form, Input, Space } from "antd";
import { useState } from "react";

export default function CategoryPatternModifyShared() {
  const [matchAll, setMatchAll] = useState(false);
  return (
    <>
      <Form.Item<WriteCategoryPatternRequest>
        label="Pattern"
        name="pattern"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item label="Category">
        <Checkbox
          onChange={(e) => {
            setMatchAll(e.target.checked);
          }}
        >
          Require Manual Category Selection For this Pattern
        </Checkbox>
        <Form.Item<WriteCategoryPatternRequest>
          name="transactionCategoryId"
          rules={[{ required: !matchAll }]}
        >
          <AppAutocomplete
            disabled={matchAll}
            requestOptions={transactionCategoryAutocomplete}
          />
        </Form.Item>
      </Form.Item>
    </>
  );
}
