import React from "react";
import { InputNumber } from "antd";

export default function InputCurrency(
  props: React.ComponentProps<typeof InputNumber<number>>,
) {
  return (
    <InputNumber<number>
      style={{ width: "100%" }}
      prefix="$"
      precision={2}
      controls={false}
      {...props}
    />
  );
}
