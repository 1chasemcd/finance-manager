import { Box, Divider, Typography } from "@mui/material";
import type { ReactNode } from "react";
import AppPaper from "./AppPaper";

interface PageSectionProps {
  title: string;
  children: ReactNode;
  noMargin?: true;
}

export default function PageSection({ title, children, noMargin }: PageSectionProps) {
  return (
    <AppPaper>
      <Box>
        <Typography variant="h6" sx={{ px: 2, py: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: noMargin ? 0 : 2 }}>{children}</Box>
    </AppPaper>
  );
}
