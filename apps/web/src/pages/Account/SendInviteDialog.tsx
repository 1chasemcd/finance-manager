import { useSendInvite } from "@/lib/account";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
  TextField,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";

export function useSendInviteDialog(): [() => void, React.JSX.Element] {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const sendInvite = useSendInvite();

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    sendInvite.reset();
  };

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string" || email.length === 0) return;

    sendInvite.mutate(email, {
      onSuccess: () => {
        handleDialogClose();
        setSnackbar({ message: "Invitation sent", severity: "success" });
      },
      onError: () => {
        setSnackbar({ message: "The invitation could not be sent", severity: "error" });
      },
    });
  };

  return [
    handleDialogOpen,
    <>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Send Invitation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Specify the email address of the user you would like to invite to your group.
          </DialogContentText>
        </DialogContent>
        <Box sx={{ mx: 3 }}>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
              autoFocus
              required
              id="name"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
            />
          </form>
        </Box>

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" form="subscription-form" disabled={sendInvite.isPending}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar !== null} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar?.severity ?? "info"}
          variant="filled"
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </>,
  ];
}
