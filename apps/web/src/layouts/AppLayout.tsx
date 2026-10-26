import { Box } from "@mui/material";
import { Outlet } from "react-router";
import AppDrawer, { type AppDrawerHandle } from "@/components/AppDrawer/AppDrawer";
import PageHeader from "@/components/PageHeader/PageHeader";
import PageHeaderProvider from "@/components/PageHeader/PageHeaderProvider";
import { useRef } from "react";
import { PageStatusProvider } from "@/components/PageStatus/PageStatusProvider";
import PageStatusOverlay from "@/components/PageStatus/PageStatusOverlay";
import RouteListener from "@/components/RouteListener";

export default function AppLayout() {
  const drawerRef = useRef<AppDrawerHandle>(null);

  return (
    <PageStatusProvider>
      <PageHeaderProvider>
        <RouteListener />
        <Box
          sx={{
            display: "flex",
            height: "100dvh",
            overflow: "hidden",
          }}
        >
          <AppDrawer ref={drawerRef} />

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <PageHeader openDrawerCallback={() => drawerRef.current?.setCollapsed(true)} />
            <Box sx={{ p: 2, marginTop: "56px" }}>
              <Outlet />
            </Box>
            <PageStatusOverlay />
          </Box>
        </Box>
      </PageHeaderProvider>
    </PageStatusProvider>
  );
}
