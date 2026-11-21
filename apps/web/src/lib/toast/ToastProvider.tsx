import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { toast } from "./toast";

interface ToastMessage {
  id: number;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export function ToastProvider() {
  const [current, setCurrent] = useState<ToastMessage | null>(null);

  useEffect(() => {
    return toast.subscribe(setCurrent);
  }, []);

  const handleClose = () => {
    setCurrent(null);
  };

  return (
    <Snackbar
      key={current?.id}
      open={!!current}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      {current ? (
        <Alert
          severity={current.severity}
          variant="filled"
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {current.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
