export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subject: string;
  groupId: number;
}

export type CreateUserInput = Omit<User, "id">;

export interface UpdateUserInput {
  groupId?: number;
}
