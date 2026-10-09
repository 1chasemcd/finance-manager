import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import PageSection from "@/components/PageSection";
import { usePageHeader } from "@/lib/pageHeader";
import { useState } from "react";
import React from "react";
import {
  useAcceptInvite,
  useAccountInfo,
  useDeclineInvite,
  useSendInvite,
  type AccountUser,
  type PendingInvite,
} from "@/lib/account";

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField
        label={label}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
        value={value}
        fullWidth
      />
    </Grid>
  );
}

function GroupTable({ members, meEmail }: { members: AccountUser[]; meEmail: string }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 400 }} aria-label="group members table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((row) => (
            <TableRow key={row.email} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {row.firstName} {row.lastName}
                {row.email === meEmail ? " (me)" : ""}
              </TableCell>
              <TableCell>{row.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function inviteDescription(invite: PendingInvite | undefined): string {
  const members = invite?.groupMembers ?? [];
  const [first, ...rest] = members;
  if (!first) return "You have been invited to join another group. Would you like to accept?";
  const names =
    rest.length > 0
      ? `'${first.firstName} ${first.lastName}' and ${rest.length.toString()} others`
      : `'${first.firstName} ${first.lastName}'`;
  return `You have been invited to join a group with ${names}. Would you like to accept the invitation?`;
}

function useAcceptInviteDialog(invite: PendingInvite | undefined): [() => void, React.JSX.Element] {
  const [open, setOpen] = useState(false);
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  const inviteId = invite?.inviteId;
  const pending = acceptInvite.isPending || declineInvite.isPending;
  const failed = acceptInvite.isError || declineInvite.isError;

  const handleClose = () => {
    setOpen(false);
    acceptInvite.reset();
    declineInvite.reset();
  };

  const handleOpen = () => {
    if (inviteId) setOpen(true);
  };

  const handleAccept = () => {
    if (!inviteId) return;
    acceptInvite.mutate(inviteId, { onSuccess: handleClose });
  };

  const handleDecline = () => {
    if (!inviteId) return;
    declineInvite.mutate(inviteId, { onSuccess: handleClose });
  };

  return [
    handleOpen,
    <Dialog open={open && inviteId !== undefined} onClose={handleClose}>
      <DialogTitle>Manage Group Invitation</DialogTitle>
      <DialogContent>
        <DialogContentText>{inviteDescription(invite)}</DialogContentText>
        <Alert severity="warning" sx={{ marginTop: 2 }}>
          <AlertTitle>Data Loss Warning</AlertTitle>
          You will be removed from your current group when you join a new one. If you are the only
          member of your current group, it will be deleted.
        </Alert>
        {failed && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            The invitation could not be processed. Please try again.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDecline} disabled={pending}>
          Decline
        </Button>
        <Button onClick={handleAccept} disabled={pending}>
          Accept
        </Button>
      </DialogActions>
    </Dialog>,
  ];
}

function useSendInviteDialog(): [() => void, React.JSX.Element] {
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

function Account() {
  const { data, isPending, isError, refetch } = useAccountInfo();
  const [openAcceptInviteDialog, AcceptInviteDialog] = useAcceptInviteDialog(data?.pendingInvite);
  const [openSendInviteDialog, SendInviteDialog] = useSendInviteDialog();

  usePageHeader({
    title: "Account",
  });

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Failed to load account information.
      </Alert>
    );
  }

  const { me, groupMembers, pendingInvite } = data;

  return (
    <React.Fragment>
      <Stack spacing={2} sx={{ width: "100%" }}>
        <PageSection title="Personal Info">
          <Grid container spacing={2}>
            <AccountField label="First Name" value={me.firstName} />
            <AccountField label="Last Name" value={me.lastName} />
            <AccountField label="Email" value={me.email} />
          </Grid>
        </PageSection>

        <PageSection title="Group Members">
          {pendingInvite ? (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={openAcceptInviteDialog}>
                  Manage Invitation
                </Button>
              }
              sx={{ marginBottom: 2 }}
            >
              You have a pending group invitation.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              Invite users to your group to manage your finances together.
              <Button onClick={openSendInviteDialog}>Send an Invite</Button>
            </Box>
          )}

          <GroupTable members={groupMembers} meEmail={me.email} />
        </PageSection>
      </Stack>
      {AcceptInviteDialog}
      {SendInviteDialog}
    </React.Fragment>
  );
}

export default Account;
