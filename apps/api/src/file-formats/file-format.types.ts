export interface FileFormat {
  id: number;
  publicId: string;
  name: string;
  skipRows: number;
  rowPattern?: string;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat?: string;
  positiveIsSpending: boolean;
}
