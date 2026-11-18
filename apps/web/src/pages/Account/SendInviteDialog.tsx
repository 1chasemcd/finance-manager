import { useSendInvite } from "@/lib/api/account";
import { inviteUserSchema } from "@finapp/schema";
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
  Divider,
} from "@mui/material";
import { useState } from "react";
import z from "zod";
import { useAppForm } from "@/lib/appForm";

type InviteUserRequestData = z.infer<typeof inviteUserSchema>;

export function useSendInviteDialog(): [() => void, React.JSX.Element] {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const sendInvite = useSendInvite();

  const { register, handleSubmit, ...form } = useAppForm({
    schema: inviteUserSchema,
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    form.reset();
    sendInvite.reset();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = (data: InviteUserRequestData) => {
    sendInvite.mutate(data, {
      onSuccess: () => {
        handleDialogClose();
        setSnackbar({ open: true, message: "Invitation sent", severity: "success" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "The invitation could not be sent", severity: "error" });
      },
    });
  };

  return [
    handleDialogOpen,
    <>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Send Invitation</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText>
            Provide the email address of the user you would like to invite to your group.
          </DialogContentText>
          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            id="send-invite-form"
            noValidate
            sx={{ mt: 2 }}
          >
            <TextField {...register("email")} autoFocus type="email" fullWidth />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            type="submit"
            form="send-invite-form"
            disabled={sendInvite.isPending}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>,
  ];
}
