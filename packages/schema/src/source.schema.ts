import z from "zod";

export const createSourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullish(),
  ownerId: z.int(),
  fileFormatId: z.int().nullish(),
});

export const updateSourceSchema = createSourceSchema.extend({
  archived: z.boolean().default(false),
});

export type CreateSourceRequest = z.infer<typeof createSourceSchema>;
export type UpdateSourceRequest = z.infer<typeof updateSourceSchema>;
