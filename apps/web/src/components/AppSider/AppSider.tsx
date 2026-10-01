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
  useMediaQuery,
  useTheme,
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
  Menu,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerContent = (
    <>
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
          <ListItemButton
            key={item.label}
            onClick={
              isMobile
                ? () => {
                    setMobileOpen(false);
                  }
                : undefined
            }
          >
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

      {!isMobile && (
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
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="Open navigation"
          onClick={() => {
            setMobileOpen(true);
          }}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: theme.zIndex.appBar,
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              bgcolor: "background.paper",
            },
          }}
        >
          <Menu />
        </IconButton>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => {
            setMobileOpen(false);
          }}
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          position: "relative",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
