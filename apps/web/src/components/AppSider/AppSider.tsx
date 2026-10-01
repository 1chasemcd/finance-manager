import { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  Dashboard,
  Payments,
  Category,
  AccountBalance,
  People,
  Rule,
  Description,
  CloudUpload,
  ChevronRight,
} from "@mui/icons-material";
import { Logo } from "../Logo";

const menuItems = [
  { label: "Dashboard", icon: <Dashboard /> },
  { label: "Transactions", icon: <Payments /> },
  { label: "Import Batch", icon: <CloudUpload /> },
  { label: "Categories", icon: <Category /> },
  { label: "Sources", icon: <AccountBalance /> },
  { label: "File Formats", icon: <Description /> },
  { label: "Category Rules", icon: <Rule /> },
  { label: "Account", icon: <People /> },
];

export default function AppSider() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          position: "relative",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minHeight: 64,
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36 }}>
          <Logo
            size={22}
            style={{
              background: "purple",
              color: "white",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            display: "grid",
            gridTemplateColumns: collapsed ? "minmax(0, 0fr)" : "minmax(0, 1fr)",
            overflow: "hidden",
            opacity: collapsed ? 0 : 1,
            transition: "grid-template-columns 0.3s ease, opacity 0.3s ease",
          }}
        >
          Finance Manager
        </Typography>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.label}>
            <ListItemIcon
              sx={{
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              sx={{
                display: "grid",
                gridTemplateColumns: collapsed ? "minmax(0, 0fr)" : "minmax(0, 1fr)",
                overflow: "hidden",
                opacity: collapsed ? 0 : 1,
                transition: "grid-template-columns 0.3s ease, opacity 0.3s ease",
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />

        <Box sx={{ display: "flex", alignItems: "center", py: 1, px: 2 }}>
          <IconButton
            sx={{ width: 36, height: 36 }}
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
