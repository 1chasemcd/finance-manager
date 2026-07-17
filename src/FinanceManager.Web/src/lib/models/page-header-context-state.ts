import type { Dispatch, SetStateAction } from "react"
import type { PageHeaderAction } from "./page-header-action"

export type PageHeaderContextState = {
  title: string
  setTitle: Dispatch<SetStateAction<string>>
  actions?: PageHeaderAction[] | undefined
  setActions: Dispatch<SetStateAction<PageHeaderAction[] | undefined>>
}
