import { ok, type Result } from "@finapp/result";
import type { CurrentUser } from "../identity/current-user";
import type { UserRepository } from "../users/user.repository";
import type { GroupInviteRepository } from "./group-invite.repository";
import { notFound, type NotFound } from "../core/errors";
import type { CurrentTime } from "../types/current-time";
import type { GroupInvite } from "./group-invites.types";

export const GROUP_INVITE_VALID_DURATION_MS = 24 * 60 * 60 * 1000;

export class GroupInviteService {
  constructor(
    private readonly users: UserRepository,
    private readonly groupInvites: GroupInviteRepository,
    private readonly currentUser: CurrentUser,
    private readonly currentTime: CurrentTime,
  ) {}

  async getPendingInvites(): Promise<GroupInvite[]> {
    const user = this.currentUser.require();
    const invites = await this.groupInvites.getInvitesByUser(user.id);

    const oldestDate = this.getOldestValidInviteDate();

    return invites.filter((i) => i.createdAt >= oldestDate);
  }

  async inviteUserToGroup(emailOfUserToInvite: string): Promise<void> {
    const groupId = this.currentUser.require().groupId;

    await this.groupInvites.deleteInvitesOlderThan(this.getOldestValidInviteDate());

    const user = await this.users.findByEmail(emailOfUserToInvite);
    if (user.isErr) return; // fail silently if user not found

    await this.groupInvites.createInvite(groupId, user.data.id);
  }

  async acceptInviteToGroup(invitePublicId: string): Promise<Result<void, NotFound>> {
    const invite = await this.getInviteByPublicId(invitePublicId);
    if (invite.isErr) return invite;

    const userId = this.currentUser.require().id;
    await this.users.updateUser(userId, { groupId: invite.data.groupId });
    await this.groupInvites.deleteInvite(invite.data.id);
    return ok();
  }

  async declineInviteToGroup(invitePublicId: string): Promise<Result<void, NotFound>> {
    const invite = await this.getInviteByPublicId(invitePublicId);
    if (invite.isErr) return invite;

    await this.groupInvites.deleteInvite(invite.data.id);
    return ok();
  }

  async cleanupExpiredInvites(): Promise<void> {
    await this.groupInvites.deleteInvitesOlderThan(this.getOldestValidInviteDate());
  }

  private getOldestValidInviteDate(): Date {
    return new Date(this.currentTime().getTime() - GROUP_INVITE_VALID_DURATION_MS);
  }

  private async getInviteByPublicId(
    invitePublicId: string,
  ): Promise<Result<GroupInvite, NotFound>> {
    const invite = (await this.getPendingInvites()).find((i) => i.publicId == invitePublicId);
    if (!invite) return notFound("groupInvite", invitePublicId);
    return ok(invite);
  }
}
