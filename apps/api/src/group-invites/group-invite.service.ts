import { err, ok, type Result } from "@finapp/result";
import type { CurrentUser } from "@/identity/current-user";
import type { UserRepository } from "@/users/user.repository";
import type { GroupInviteRepository } from "./group-invite.repository";
import type { GroupInvite } from "./group-invites.types";

export const GROUP_INVITE_VALID_DURATION_MS = 24 * 60 * 60 * 1000;

export class GroupInviteService {
  constructor(
    private readonly users: UserRepository,
    private readonly groupInvites: GroupInviteRepository,
    private readonly currentUser: CurrentUser,
    private readonly currentTime: () => Date,
  ) {}

  async getPendingInvites(): Promise<GroupInvite[]> {
    const user = this.currentUser.require();
    const invites = await this.groupInvites.byUser(user.id);

    const oldestDate = this.getOldestValidInviteDate();

    return invites.filter((i) => i.createdAt >= oldestDate);
  }

  async inviteUserToGroup(emailOfUserToInvite: string): Promise<void> {
    const groupId = this.currentUser.require().groupId;

    await this.groupInvites.deleteExpired(this.getOldestValidInviteDate());

    const user = await this.users.byEmail(emailOfUserToInvite);
    if (!user) return; // fail silently if user not found

    await this.groupInvites.create(groupId, user.id);
  }

  async acceptInviteToGroup(invitePublicId: string): Promise<Result> {
    const invite = await this.getInviteByPublicId(invitePublicId);
    if (invite.isErr) return invite;

    const userId = this.currentUser.require().id;
    await this.users.update(userId, { groupId: invite.data.groupId });
    await this.groupInvites.delete(invite.data.id);
    return ok();
  }

  async declineInviteToGroup(invitePublicId: string): Promise<Result> {
    const invite = await this.getInviteByPublicId(invitePublicId);
    if (invite.isErr) return invite;

    await this.groupInvites.delete(invite.data.id);
    return ok();
  }

  async cleanupExpiredInvites(): Promise<void> {
    await this.groupInvites.deleteExpired(this.getOldestValidInviteDate());
  }

  private getOldestValidInviteDate(): Date {
    return new Date(this.currentTime().getTime() - GROUP_INVITE_VALID_DURATION_MS);
  }

  private async getInviteByPublicId(invitePublicId: string): Promise<Result<GroupInvite>> {
    const invite = (await this.getPendingInvites()).find((i) => i.publicId == invitePublicId);
    if (!invite) return err();
    return ok(invite);
  }
}
