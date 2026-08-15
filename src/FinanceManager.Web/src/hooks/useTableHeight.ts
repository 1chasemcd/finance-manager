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
      const { height } = node.getBoundingClientRect();
      setTableHeight(height - headerHeight - footerHeight);
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
