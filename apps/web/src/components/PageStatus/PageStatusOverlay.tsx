import { usePageStatusChanages } from "@/lib/pageStatus";
import { Alert, alpha, Box, CircularProgress, Snackbar } from "@mui/material";
import { useState } from "react";

export default function PageStatusOverlay() {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const status = usePageStatusChanages((status) => {
    if (status === "error") setSnackbarOpen(true);
  });
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (status === "loading")
    return (
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
    );

  return (
    <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} autoHideDuration={null}>
      <Alert onClose={handleSnackbarClose} severity="error" variant="filled">
        An unexpected problem occurred.
      </Alert>
    </Snackbar>
  );
}
