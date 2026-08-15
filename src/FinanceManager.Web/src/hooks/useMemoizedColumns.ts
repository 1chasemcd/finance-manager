import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

export default function useMemoizedColumns<TColumnType>(
  columns: () => ColumnsType<TColumnType>,
) {
  return useMemo(columns, []);
}
