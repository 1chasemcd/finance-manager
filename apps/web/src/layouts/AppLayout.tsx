import { Box } from "@mui/material";
import { Outlet } from "react-router";
import AppDrawer from "../components/AppDrawer/AppDrawer";

export default function AppLayout() {
  return (
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
          p: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
