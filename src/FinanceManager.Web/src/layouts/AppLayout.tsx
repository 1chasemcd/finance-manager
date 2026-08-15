import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import AppSider from "@/components/AppSider/AppSider";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ height: "100vh" }}>
      <AppSider />
      <Layout style={{ minHeight: 0 }}>
        <Content
          style={{
            minWidth: 0,
            minHeight: 0,
            padding: 24,
            overflow: "hidden",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
