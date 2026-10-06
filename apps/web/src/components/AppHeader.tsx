import { Box, Button, Stack, Typography } from "@mui/material";

export default function AppHeader() {
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
      <Typography variant="h4">Account</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained">Test Action</Button>
      </Stack>
    </Box>
  );
}
