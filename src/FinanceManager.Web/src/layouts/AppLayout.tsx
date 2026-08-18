import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import AppSider from "@/components/AppSider/AppSider";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <AppSider />
      <Layout>
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
