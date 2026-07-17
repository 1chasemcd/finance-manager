import type { PageHeaderAction } from "@/lib/models/page-header-action"
import type { PageHeaderContextState } from "@/lib/models/page-header-context-state"
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react"

const PageHeaderContext = createContext<PageHeaderContextState | null>(null)

export function PageHeaderProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState("")
  const [actions, setActions] = useState<PageHeaderAction[] | undefined>()

  return (
    <PageHeaderContext.Provider
      value={{ title, setTitle, actions, setActions }}
    >
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeader(): PageHeaderContextState {
  const context = useContext(PageHeaderContext)

  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider")
  }

  return context
}
