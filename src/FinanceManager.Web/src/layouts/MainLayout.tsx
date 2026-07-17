import MainSidebar from "@/components/MainSidebar"
import PageHeader from "@/components/PageHeader"
import { SidebarProvider } from "@/components/ui/sidebar"
import { PageHeaderProvider } from "@/providers/PageHeaderProvider"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <SidebarProvider>
      <MainSidebar />

      <main className="flex-1">
        <PageHeaderProvider>
          <PageHeader />
          <Outlet />
        </PageHeaderProvider>
      </main>
    </SidebarProvider>
  )
}
