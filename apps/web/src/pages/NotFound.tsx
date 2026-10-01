import { Box, Typography, Button } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h1">404</Typography>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>

      <Button variant="contained" href="/">
        Go Home
      </Button>
    </Box>
  );
}
