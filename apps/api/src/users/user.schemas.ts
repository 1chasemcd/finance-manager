import z from "zod";

const BaseUser = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const CreateUser = BaseUser;
export const UpdateUser = BaseUser.partial();
export const User = BaseUser.extend({
  id: z.int(),
});

export type CreateUser = z.infer<typeof CreateUser>;
export type UpdateUser = z.infer<typeof UpdateUser>;
export type User = z.infer<typeof User>;
