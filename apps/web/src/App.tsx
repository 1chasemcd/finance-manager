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
        minHeight: "100vh",
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
    const fetchUsers = async () => {
      try {
        const response = await api.api.health.$get();

        if (!response.ok) return;

        const data = await response.json();
        if (data.status == "ok") setHealthy(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers().catch(() => {
      return;
    });
  }, []);
  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Loading />
      ) : healthy ? (
        <Alert severity="success">API is running</Alert>
      ) : (
        <Alert severity="error">Something went wrong</Alert>
      )}
    </Box>
  );
}

export default App;
