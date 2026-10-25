import { useSendInvite } from "@/lib/account";
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
} from "@mui/material";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type InviteUserRequestData = z.infer<typeof inviteUserSchema>;

export function useSendInviteDialog(): [() => void, React.JSX.Element] {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const sendInvite = useSendInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
    ...form
  } = useForm<InviteUserRequestData>({
    resolver: zodResolver(inviteUserSchema),
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
        <DialogContent>
          <DialogContentText>
            Specify the email address of the user you would like to invite to your group.
          </DialogContentText>
        </DialogContent>
        <Box sx={{ mx: 3 }}>
          <form
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            id="send-invite-form"
            noValidate
          >
            <TextField
              autoFocus
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message ?? " "}
              label="Email Address"
              type="email"
              fullWidth
            />
          </form>
        </Box>

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" form="send-invite-form" disabled={sendInvite.isPending}>
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
