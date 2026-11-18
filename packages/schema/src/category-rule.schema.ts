import z from "zod";

export const writeCategoryRuleSchema = z.object({
  pattern: z.string().min(1).max(100),
  categoryId: z.number().nullish(),
});

export type WriteCategoryRuleRequest = z.infer<typeof writeCategoryRuleSchema>;
