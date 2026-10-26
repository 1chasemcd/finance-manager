import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
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
import React, { useEffect } from "react";
import { useAccountInfo, type AccountUser } from "@/lib/api/account";
import { useAcceptInviteDialog } from "./AcceptInviteDialog";
import { useSendInviteDialog } from "./SendInviteDialog";
import { usePageStatus } from "@/lib/pageStatus";

const emptyUser = { firstName: "", lastName: "", email: "" };

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField
        label={label}
        slotProps={{
          input: {
            readOnly: true,
          },
          inputLabel: { shrink: true },
        }}
        value={value}
        fullWidth
      />
    </Grid>
  );
}

function GroupTable({ members, meEmail }: { members: AccountUser[]; meEmail: string }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto", width: "100%" }}>
      <Table aria-label="group members table" sx={{ whiteSpace: "nowrap" }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((row) => (
            <TableRow key={row.email} sx={{ "&:last-child > *": { borderBottom: 0 } }}>
              <TableCell component="th" scope="row">
                {row.firstName} {row.lastName}
                {row.email === meEmail && meEmail != "" ? " (me)" : ""}
              </TableCell>
              <TableCell>{row.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function Account() {
  const { resetStatus, setLoadingStatus, setErrorStatus } = usePageStatus();
  const { data, isPending, isError } = useAccountInfo();
  const [openAcceptInviteDialog, AcceptInviteDialog] = useAcceptInviteDialog(data?.pendingInvite);
  const [openSendInviteDialog, SendInviteDialog] = useSendInviteDialog();

  usePageHeader({ title: "Account" });
  useEffect(() => {
    if (isPending) setLoadingStatus();
    else if (isError) setErrorStatus();
    else resetStatus();
  }, [isPending, isError, resetStatus, setLoadingStatus, setErrorStatus]);

  const { me, groupMembers, pendingInvite } = data ?? {
    me: emptyUser,
    groupMembers: [emptyUser],
  };

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
