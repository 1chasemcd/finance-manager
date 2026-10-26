import { useAcceptInvite, useDeclineInvite, type PendingInvite } from "@/lib/api/account";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";

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

export function useAcceptInviteDialog(
  invite: PendingInvite | undefined,
): [() => void, React.JSX.Element] {
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
