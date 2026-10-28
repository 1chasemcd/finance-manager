import z from "zod";

export const createSourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ownerEmail: z.email(),
  fileFormatPublicId: z.uuid().optional(),
});

export const updateSourceSchema = createSourceSchema.partial().extend({
  archived: z.boolean().optional(),
});
