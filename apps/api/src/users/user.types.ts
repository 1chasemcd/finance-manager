export interface OnboardUserInput {
  email: string;
  name: string;
  subject: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subject: string;
  accountId: number;
}

export type CreateUserInput = Omit<User, "id">;
