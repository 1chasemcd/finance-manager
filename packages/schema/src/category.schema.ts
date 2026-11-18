import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().nonempty().max(100),
  description: z.string().max(500).nullish(),
});

export const updateCategorySchema = createCategorySchema.extend({
  archived: z.boolean().default(false),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
