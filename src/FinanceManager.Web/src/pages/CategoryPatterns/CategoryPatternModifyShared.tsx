import AppAutocomplete from "@/components/AppAutocomplete";
import type { WriteCategoryPatternRequest } from "@/lib/generated";
import { transactionCategoryAutocomplete } from "@/utils/autocompleteRequests";
import { Flex, Form, Input, Radio } from "antd";
import type { FormInstance } from "antd/lib/form";
import type { RadioChangeEvent } from "antd/lib/radio";
import { useEffect, useRef, useState } from "react";

const labelStyle: React.CSSProperties = {
  height: 32,
  lineHeight: "32px",
};

export default function CategoryPatternModifyShared({
  form,
}: {
  form: FormInstance<WriteCategoryPatternRequest>;
}) {
  const [requireManualSelection, setRequireManualSelection] =
    useState<boolean>(true);
  const previousCategory = useRef<number | null>(null);

  useEffect(() => {
    const categoryId = form.getFieldValue("transactionCategoryId");

    setRequireManualSelection(!categoryId);
  }, [form]);

  const radioChange = (e: RadioChangeEvent) => {
    const manual = e.target.value as boolean;
    if (manual) {
      previousCategory.current = form.getFieldValue("transactionCategoryId");

      form.setFieldValue("transactionCategoryId", null);
    } else {
      form.setFieldValue("transactionCategoryId", previousCategory.current);
    }
    setRequireManualSelection(manual);
  };
  return (
    <>
      <Form.Item<WriteCategoryPatternRequest>
        label="Pattern"
        name="pattern"
        rules={[{ required: true }]}
      >
        <Input maxLength={100} style={{ fontFamily: "monospace" }} />
      </Form.Item>
      <Form.Item label="Category">
        <Radio.Group onChange={radioChange} value={requireManualSelection}>
          <Flex vertical gap="small">
            <Radio value={true} style={labelStyle}>
              Require manual category selection for this pattern
            </Radio>

            <Radio
              value={false}
              style={labelStyle}
              styles={{ label: { width: "100%" } }}
            >
              <Form.Item<WriteCategoryPatternRequest>
                name="transactionCategoryId"
                rules={[{ required: !requireManualSelection }]}
              >
                <AppAutocomplete
                  placeholder="Match to specific category..."
                  disabled={requireManualSelection}
                  requestOptions={transactionCategoryAutocomplete}
                />
              </Form.Item>
            </Radio>
          </Flex>
        </Radio.Group>
      </Form.Item>
    </>
  );
}
