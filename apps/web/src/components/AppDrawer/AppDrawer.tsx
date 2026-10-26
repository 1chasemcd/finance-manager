import { useEffect, useImperativeHandle, useState } from "react";
import { Drawer, useMediaQuery, useTheme } from "@mui/material";
import { AppDrawerContent } from "./AppDrawerContent";

export interface AppDrawerHandle {
  setCollapsed: (value: boolean) => void;
}

interface AppDrawerProps {
  ref: React.Ref<AppDrawerHandle>;
}

export default function AppDrawer({ ref }: AppDrawerProps) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("drawer-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("drawer-collapsed", String(collapsed));
  }, [collapsed]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useImperativeHandle(
    ref,
    () => ({
      setCollapsed,
    }),
    [],
  );

  const closeMobileNav = () => {
    if (isMobile) setCollapsed(false);
  };
  const toggleCollapsed: () => void = () => {
    setCollapsed((value) => !value);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? collapsed : true}
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
  );
}
