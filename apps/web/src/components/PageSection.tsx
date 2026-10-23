import { Box, Divider, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageSectionProps {
  title: string;
  children: ReactNode;
  noMargin?: true;
}

export default function PageSection({ title, children, noMargin }: PageSectionProps) {
  return (
    <Paper variant="outlined">
      <Box>
        <Typography variant="h6" sx={{ px: 2, py: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: noMargin ? 0 : 2 }}>{children}</Box>
    </Paper>
  );
}
