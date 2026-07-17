import { MoreHorizontal, PanelLeft } from "lucide-react"
import { SidebarTrigger } from "./ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { usePageHeader } from "@/providers/PageHeaderProvider"

export default function PageHeader() {
  const headerContext = usePageHeader()
  return (
    <header className="flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger>
          <PanelLeft className="size-5" />
        </SidebarTrigger>

        <h1 className="text-lg font-semibold tracking-tight">
          {headerContext.title}
        </h1>
      </div>
      {headerContext.actions && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon"></Button>}
          >
            <MoreHorizontal className="h-5 w-5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {headerContext.actions.map((action) => (
              <DropdownMenuItem key={action.label} onClick={action.callback}>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
