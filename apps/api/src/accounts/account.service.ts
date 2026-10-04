import type { UserRepository } from "../users/user.repository";
import type { CurrentUser } from "../identity/current-user";
import type { AccountInfoResponse } from "./account.types";

export class AccountService {
  constructor(
    private readonly users: UserRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async getAccountInfo(): Promise<AccountInfoResponse> {
    const user = this.currentUser.require();
    const members = await this.users.findByAccount(user.accountId);

    return {
      members: members.map((m) => ({
        firstName: m.firstName,
        lastName: m.firstName,
        email: m.email,
        currentUser: m.id === user.id ? true : undefined,
      })),
    };
  }
}
