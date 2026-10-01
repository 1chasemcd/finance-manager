import { Box } from "@mui/material";
import { Outlet } from "react-router";
import AppSider from "../components/AppSider/AppSider";

export default function AppLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppSider />

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
