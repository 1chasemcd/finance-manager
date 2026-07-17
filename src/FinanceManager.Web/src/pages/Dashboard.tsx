import { Button } from "@/components/ui/button"
import { usePageHeader } from "@/contexts/PageHeaderContext"
import { useEffect } from "react"

function Dashboard() {
  const header = usePageHeader()
  useEffect(() => header.setTitle("Dashboard"), [header.setTitle])

  useEffect(
    () =>
      header.setActions([
        { label: "Test", callback: () => console.log("Test") },
      ]),
    [header.setTitle]
  )
  return (
    <>
      Dashboard Works!
      <Button>Test Button</Button>
    </>
  )
}

export default Dashboard
