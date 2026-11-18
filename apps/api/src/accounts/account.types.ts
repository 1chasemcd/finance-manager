interface AccountInfoUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface PendingInvite {
  inviteId: number;
  groupMembers: AccountInfoUser[];
  createdAt: Date;
}

export interface AccountInfo {
  me: AccountInfoUser;
  groupMembers: AccountInfoUser[];
  pendingInvite?: PendingInvite;
}
