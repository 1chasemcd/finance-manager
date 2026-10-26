import { PageStatusContext, useCreatePageStatusStore } from "@/lib/pageStatus";
import { type ReactNode } from "react";

interface PageStatusProviderProps {
  children: ReactNode;
}

export function PageStatusProvider({ children }: PageStatusProviderProps) {
  const store = useCreatePageStatusStore();

  return <PageStatusContext.Provider value={store}>{children}</PageStatusContext.Provider>;
}
