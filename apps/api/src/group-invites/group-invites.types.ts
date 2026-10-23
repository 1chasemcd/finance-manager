import z from "zod";

export interface GroupInvite {
  id: number;
  publicId: string;
  groupId: number;
  userId: number;
  createdAt: Date;
}

export const InviteUserSchema = z.object({
  email: z.email(),
});
