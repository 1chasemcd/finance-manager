import type { UserRepository } from "../users/user.repository";
import type { CurrentUser } from "../identity/current-user";
import type { AccountInfoResponse } from "./account.types";
import type { User } from "../users/user.types";
import type { GroupInviteService } from "../group-invites/group-invite.service";

export class AccountService {
  constructor(
    private readonly users: UserRepository,
    private readonly groupInvites: GroupInviteService,
    private readonly currentUser: CurrentUser,
  ) {}

  async getAccountInfo(): Promise<AccountInfoResponse> {
    const user = this.currentUser.require();
    const members = (await this.users.findByGroup(user.groupId)).map((m) => this.mapUser(m));

    const res: AccountInfoResponse = {
      me: this.mapUser(user),
      groupMembers: members,
    };

    const invites = await this.groupInvites.getPendingInvites();

    if (invites.length == 0) return res;

    const oldest = invites.reduce((oldest, current) =>
      current.createdAt < oldest.createdAt ? current : oldest,
    );

    const inviteMembers = (await this.users.findByGroup(oldest.groupId)).map((m) =>
      this.mapUser(m),
    );

    res.pendingInvite = {
      inviteId: oldest.publicId,
      groupMembers: inviteMembers,
      createdAt: oldest.createdAt,
    };

    return res;
  }

  private mapUser(user: User) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
