export interface FileFormat {
  publicId: string;
  name: string;
  skipRows: number;
  rowPattern: string | null;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat: string | null;
  positiveIsSpending: boolean;
}

export interface CreateFileFormatInput {
  name: string;
  skipRows: number;
  rowPattern?: string | null;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat?: string | null;
  positiveIsSpending: boolean;
}

export type UpdateFileFormatInput = Partial<CreateFileFormatInput & { archived: boolean }>;
