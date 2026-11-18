import z from "zod";

export const searchTransactionsSchema = z.object({
  page: z.int().min(0).default(0),
  limit: z.int().min(1).max(50).default(50),
  minDate: z.iso.date().optional(),
  maxDate: z.iso.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  categoryId: z.int().optional(),
  sourceId: z.int().optional(),
});

export type SearchTransactionsRequest = z.infer<typeof searchTransactionsSchema>;
