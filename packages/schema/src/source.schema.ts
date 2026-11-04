import z from "zod";

export const createSourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullish(),
  ownerEmail: z.email(),
  fileFormatPublicId: z.uuid().nullish(),
});

export const updateSourceSchema = createSourceSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
