import { alpha, Box, CircularProgress } from "@mui/material";

export default function PageSpinner({ visible = true }: { visible?: boolean }) {
  return (
    visible && (
      <Box
        sx={(theme) => ({
          position: "absolute",
          inset: 0,
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: alpha(theme.palette.background.default, 0.4),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <CircularProgress />
      </Box>
    )
  );
}
