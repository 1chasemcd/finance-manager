import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react"

export type PageHeaderAction = {
  label: string
  callback: () => void
}

export type PageHeaderContextState = {
  title: string
  setTitle: Dispatch<SetStateAction<string>>
  actions?: PageHeaderAction[] | undefined
  setActions: Dispatch<SetStateAction<PageHeaderAction[] | undefined>>
}

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
