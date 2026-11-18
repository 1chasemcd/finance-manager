import z from "zod";

export const writeFileFormatSchema = z.object({
  name: z.string().min(1).max(100),
  skipRows: z.int().min(0).default(0),
  rowPattern: z.string().max(500).nullish(),
  dateIndex: z.int().min(0),
  summaryIndex: z.int().min(0),
  amountIndex: z.int().min(0),
  dateFormat: z.string().max(100).nullish(),
  positiveIsSpending: z.boolean(),
});

export type WriteFileFormatRequest = z.infer<typeof writeFileFormatSchema>;
