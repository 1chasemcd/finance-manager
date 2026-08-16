import { useLayoutEffect, useState, type RefObject } from "react";
import { useDebouncedCallback } from "use-debounce";

export const useTableHeight = (
  ref: RefObject<Element | null>,
  headerHeight = 55,
  footerHeight = 56,
) => {
  const [tableHeight, setTableHeight] = useState<number>(
    headerHeight + footerHeight,
  );
  const resizeTable = useDebouncedCallback(
    () => {
      const node = ref.current;
      if (!node) {
        return;
      }
      const tableHeight =
        node.querySelector(".ant-table-wrapper")?.getBoundingClientRect()
          .height ?? 0;
      const bodyHeight =
        node.querySelector(".ant-table-body")?.getBoundingClientRect().height ??
        0;
      const otherContentHeight = tableHeight - bodyHeight;
      const { height: containerHeight } = node.getBoundingClientRect();
      setTableHeight(containerHeight - otherContentHeight);
    },
    100,
    {
      trailing: true,
      maxWait: 100,
    },
  );

  useLayoutEffect(() => {
    resizeTable();
    window.addEventListener("resize", resizeTable);

    return () => {
      window.removeEventListener("resize", resizeTable);
    };
  }, [resizeTable]);

  return tableHeight;
};
