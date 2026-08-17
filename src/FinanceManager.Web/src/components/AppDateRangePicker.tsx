import { DatePicker } from "antd";
import type React from "react";

export default function AppDateRangePicker(
  props: React.ComponentProps<typeof DatePicker.RangePicker>,
) {
  return <DatePicker.RangePicker format="MM/DD/YYYY" {...props} />;
}
