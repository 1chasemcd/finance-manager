import { useState, type ReactNode } from "react";
import { PageHeaderContext, createPageHeaderStore } from "../../lib/pageHeader";

interface PageHeaderProviderProps {
  children: ReactNode;
}

export default function PageHeaderProvider({ children }: PageHeaderProviderProps) {
  const [store] = useState(createPageHeaderStore);
  return <PageHeaderContext.Provider value={store}>{children}</PageHeaderContext.Provider>;
}
