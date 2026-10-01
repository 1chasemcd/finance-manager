import { useState } from "react";
import { Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { AppDrawerContent } from "./AppDrawerContent";

export default function AppDrawer() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const openMobileNav = () => {
    setMobileOpen(true);
  };
  const closeMobileNav = () => {
    setMobileOpen(false);
  };
  const toggleCollapsed: () => void = () => {
    setCollapsed((value) => !value);
  };

  return (
    <>
      {isMobile && (
        <IconButton
          size="large"
          aria-label="Open navigation"
          onClick={openMobileNav}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: theme.zIndex.appBar,
            borderRadius: "50%",
            boxShadow: 3,
          }}
        >
          <Menu />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={closeMobileNav}
        sx={[
          { whiteSpace: "nowrap" },
          !isMobile && { "& .MuiDrawer-paper": { position: "relative" } },
        ]}
      >
        <AppDrawerContent
          collapsed={collapsed}
          isMobile={isMobile}
          onCollapseToggle={toggleCollapsed}
          onNavigate={closeMobileNav}
        />
      </Drawer>
    </>
  );
}
