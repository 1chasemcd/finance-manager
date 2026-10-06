import { Box } from "@mui/material";
import { Outlet } from "react-router";
import AppDrawer from "../components/AppDrawer/AppDrawer";
import PageHeader from "../components/PageHeader/PageHeader";
import PageHeaderProvider from "../components/PageHeader/PageHeaderProvider";

export default function AppLayout() {
  return (
    <PageHeaderProvider>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AppDrawer />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
          }}
        >
          <PageHeader />
          <Box sx={{ px: 2 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </PageHeaderProvider>
  );
}
