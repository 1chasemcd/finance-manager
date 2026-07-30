import { Button } from "@/components/ui/button"
import {
  usePageHeader,
  type PageHeaderAction,
} from "@/providers/PageHeaderProvider"
import { useEffect } from "react"

const actions: PageHeaderAction[] = [
  { label: "Test", callback: () => console.log("Test") },
]

function Dashboard() {
  const header = usePageHeader()
  useEffect(() => header.setTitle("Dashboard"), [header.setTitle])
  useEffect(() => header.setActions(actions), [header.setActions])
  return (
    <>
      Dashboard Works!
      <Button>Test Button</Button>
    </>
  )
}

export default Dashboard
