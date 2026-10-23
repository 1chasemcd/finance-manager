interface AccountInfoUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface GroupInvite {
  inviteId: string;
  groupMembers: AccountInfoUser[];
  createdAt: Date;
}

export interface AccountInfoResponse {
  me: AccountInfoUser;
  groupMembers: AccountInfoUser[];
  pendingInvite?: GroupInvite;
}
