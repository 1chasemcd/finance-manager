import { Box, Divider, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { usePageHeaderConfig } from "@/lib/pageHeader";
import { Menu } from "@mui/icons-material";
import { theme } from "@/theme";

interface PageHeaderProps {
  openDrawerCallback: () => void;
}

export default function PageHeader({ openDrawerCallback }: PageHeaderProps) {
  const config = usePageHeaderConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", position: "fixed", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          bgcolor: "background.default",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
          width: "100%",
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
          {isMobile && (
            <IconButton size="medium" aria-label="Open navigation" onClick={openDrawerCallback}>
              <Menu />
            </IconButton>
          )}
          <Typography variant="h5">{config?.title}</Typography>
        </Box>

        {config?.actions ? (
          <Stack direction="row" spacing={1}>
            {config.actions}
          </Stack>
        ) : null}
      </Box>
      <Divider />
    </Box>
  );
}
