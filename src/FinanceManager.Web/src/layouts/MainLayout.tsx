import Sidebar from "@/components/Sidebar"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <>
      <Sidebar />

      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </>
  )
}
