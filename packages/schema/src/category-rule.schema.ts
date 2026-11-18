import z from "zod";

export const writeCategoryRuleSchema = z.object({
  pattern: z.string().nonempty().max(100),
  categoryId: z.int().nullish(),
});

export type WriteCategoryRuleRequest = z.infer<typeof writeCategoryRuleSchema>;
