interface AccountInfoUser {
  firstName: string;
  lastName: string;
  email: string;
  currentUser?: true | undefined;
}

export interface AccountInfoResponse {
  members: AccountInfoUser[];
}

export interface Account {
  id: number;
}
