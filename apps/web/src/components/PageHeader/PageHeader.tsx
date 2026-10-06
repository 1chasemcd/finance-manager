import { Box, Stack, Typography } from "@mui/material";
import { usePageHeaderConfig } from "../../lib/pageHeader";

export default function PageHeader() {
  const config = usePageHeaderConfig();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 64,
        px: 2,
        py: 1,
      }}
    >
      <Typography variant="h4">{config?.title}</Typography>
      {config?.actions ? (
        <Stack direction="row" spacing={1}>
          {config.actions}
        </Stack>
      ) : null}
    </Box>
  );
}
