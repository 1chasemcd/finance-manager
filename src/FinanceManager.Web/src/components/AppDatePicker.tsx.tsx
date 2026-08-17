import { DatePicker } from "antd";
import type React from "react";

export default function AppDatePicker(
  props: React.ComponentProps<typeof DatePicker>,
) {
  return <DatePicker format="MM/DD/YYYY" {...props} />;
}
