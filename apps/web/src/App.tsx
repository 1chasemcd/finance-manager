import { Alert, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [healthy, setHealthy] = useState<boolean>(false);
  useEffect(() => {
    const healthCheck = async () => {
      try {
        const response = await api.health.$get();

        if (!response.ok) return;

        const data = await response.json();
        if (data.status == "ok") setHealthy(true);
      } finally {
        setLoading(false);
      }
    };

    healthCheck().catch(() => {
      return;
    });
  }, []);
  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <Loading />
      ) : healthy ? (
        <Alert severity="success">App is running</Alert>
      ) : (
        <Alert severity="error">Something went wrong</Alert>
      )}
    </Box>
  );
}

export default App;
