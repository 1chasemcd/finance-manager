import { Paper, type PaperProps } from "@mui/material";

export default function AppPaper({ children, ...props }: PaperProps) {
  return (
    <Paper variant="outlined" {...props}>
      {children}
    </Paper>
  );
}
