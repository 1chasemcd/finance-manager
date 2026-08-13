import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import AppSider from "@/components/AppSider/AppSider";

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSider />
      <main className="flex-1">
        <Outlet />
      </main>
    </Layout>
  );
}
