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

export interface FileFormatDetail extends FileFormat {
  canDelete: boolean;
}
