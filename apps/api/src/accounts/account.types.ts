interface AccountInfoUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface PendingInvite {
  inviteId: string;
  groupMembers: AccountInfoUser[];
  createdAt: Date;
}

export interface AccountInfoResponse {
  me: AccountInfoUser;
  groupMembers: AccountInfoUser[];
  pendingInvite?: PendingInvite;
}
