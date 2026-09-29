import { DatePicker } from "antd";
import type React from "react";
import dayjs, { Dayjs } from "dayjs";

export const dateConverterProps = {
  getValueProps: (value?: Date | null | undefined) => ({
    value: value ? dayjs(value) : null,
  }),
  getValueFromEvent: (value: Dayjs) => value?.toDate() ?? null,
};

export default function AppDatePicker(
  props: React.ComponentProps<typeof DatePicker>,
) {
  return <DatePicker format="MM/DD/YYYY" {...props} />;
}
