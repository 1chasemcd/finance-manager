import z from "zod";

export const inviteUserSchema = z.object({
  email: z.email(),
});
