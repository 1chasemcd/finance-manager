import {
  Alert,
  AlertTitle,
  Box,
  Button,
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
import PageSection from "../components/PageSection";
import { useState } from "react";
import React from "react";

const groupMembers = [
  {
    name: "Chase McDonald (me)",
    email: "1chasemcd@gmail.com",
  },
  {
    name: "Hannah McDonald",
    email: "hannah.mcd26@gmail.com",
  },
];

const hasPendingInvite = false as boolean;

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

function GroupTable() {
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
          {groupMembers.map((row) => (
            <TableRow key={row.email} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell>{row.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function useAcceptInviteDialog(): [() => void, React.JSX.Element] {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return [
    handleOpen,
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Manage Group Invitation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have been invited to join a group with 'Megan Rhude' and 2 others. Would you like to
          accept the invitation?
        </DialogContentText>
        <Alert severity="warning" sx={{ marginTop: 2 }}>
          <AlertTitle>Data Loss Warning</AlertTitle>
          You will be removed from your current group when you join a new one. If you are the only
          member of your current group, it will be deleted.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Decline</Button>
        <Button onClick={handleClose}>Accept</Button>
      </DialogActions>
    </Dialog>,
  ];
}

function useSendInviteDialog(): [() => void, React.JSX.Element] {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSnackbarOpen(true);
    handleDialogClose();
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
          <Button type="submit" form="subscription-form">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} message="Invitation processed" />
    </>,
  ];
}

function Account() {
  const [openAcceptInviteDialog, AcceptInviteDialog] = useAcceptInviteDialog();
  const [openSendInviteDialog, SendInviteDialog] = useSendInviteDialog();

  return (
    <React.Fragment>
      <Stack spacing={2} sx={{ width: "100%" }}>
        <PageSection title="Personal Info">
          <Grid container spacing={2}>
            <AccountField label="First Name" value="Chase" />
            <AccountField label="Last Name" value="McDonald" />
            <AccountField label="Email" value="1chasemcd@gmail.com" />
          </Grid>
        </PageSection>

        <PageSection title="Group Members">
          {hasPendingInvite ? (
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

          <GroupTable />
        </PageSection>
      </Stack>
      {AcceptInviteDialog}
      {SendInviteDialog}
    </React.Fragment>
  );
}

export default Account;
