import z from "zod";

export const createFileFormatSchema = z.object({
  name: z.string().min(1).max(100),
  skipRows: z.number().min(0).default(0),
  rowPattern: z.string().max(500).nullish(),
  dateIndex: z.number().min(0),
  summaryIndex: z.number().min(0),
  amountIndex: z.number().min(0),
  dateFormat: z.string().max(100).nullish(),
  positiveIsSpending: z.boolean().default(false),
});

export const updateFileFormatSchema = createFileFormatSchema.partial();

export type CreateFileFormatInput = z.infer<typeof createFileFormatSchema>;
export type UpdateFileFormatInput = z.infer<typeof updateFileFormatSchema>;
