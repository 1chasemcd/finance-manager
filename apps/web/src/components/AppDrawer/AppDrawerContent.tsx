import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { NavLink } from "react-router";
import { Logo } from "../Logo";
import { navEntries } from "../../routes";

interface AppDrawerContentProps {
  collapsed: boolean;
  isMobile: boolean;
  onCollapseToggle: () => void;
  onNavigate: () => void;
}

const collapsibleLabelSx = (collapsed: boolean): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: collapsed ? "minmax(0, 0fr)" : "minmax(0, 1fr)",
  overflow: "hidden",
  opacity: collapsed ? 0 : 1,
  transition: "grid-template-columns 0.3s ease, opacity 0.3s ease",
});

const navItemSx = (theme: Theme) => ({
  "&.active": {
    color: "primary.main",
    fontWeight: 600,
    bgcolor: alpha(theme.palette.primary.main, 0.12),
    "& .MuiListItemIcon-root": { color: "primary.main" },
    "&:hover, &:focus-visible": {
      bgcolor: alpha(theme.palette.primary.main, 0.2),
    },
  },
});

export function AppDrawerContent({
  collapsed,
  isMobile,
  onCollapseToggle,
  onNavigate,
}: AppDrawerContentProps) {
  const theme = useTheme();
  const labelSx = collapsibleLabelSx(collapsed);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 64, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36 }}>
          <Logo
            size={22}
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
        </Box>
        <Typography variant="h6" sx={labelSx}>
          Finance Manager
        </Typography>
      </Box>

      <Divider />

      <List>
        {navEntries.map(({ path, label, Icon: Icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            onClick={isMobile ? onNavigate : undefined}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ justifyContent: "center" }}>
              <Icon />
            </ListItemIcon>

            <ListItemText primary={label} sx={labelSx} />
          </ListItemButton>
        ))}
      </List>

      {!isMobile && (
        <Box sx={{ mt: "auto" }}>
          <Divider />

          <Box sx={{ display: "flex", alignItems: "center", py: 1, px: 2 }}>
            <IconButton
              sx={{ width: 36, height: 36 }}
              onClick={onCollapseToggle}
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );
}
